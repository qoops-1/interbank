"use strict";

const fs            = require("fs"),
      base64url     = require("base64url"),
      Web3          = require("web3"),
      _             = require("lodash");

const secret        = require("../lib/secret"),
      storage       = require("../lib/storage"),
      configuration = require("../lib/configuration"),
      keys          = require("../lib/keys"),
      contract      = require("../lib/contract"),
      literals      = require("../lib/literals");

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

const ROW_REGEX = new RegExp(`([\\w-_]+)${literals.SEPARATOR_ESCAPED}([\\w-_]+)`);

const decodeRow = function (handlerString, sharedSecret) {
    try {
        let decoded = base64url.toBuffer(handlerString);
        let decrypted = secret.decrypt(decoded, sharedSecret).toString();
        let match = ROW_REGEX.exec(decrypted);
        return {
            checksum: base64url.toBuffer(match[1]),
            password: base64url.toBuffer(match[2])
        }
    } catch (e) {
        // Do Nothing
    }
};

const bzzrSwarmHash = function (path) {
    let regexp = /bzzr:\/\/(.+)/g;
    return regexp.exec(path)[1];
};

module.exports = function (keyPassword, filePath, options) {
    let address = options.address;
    let network = options.network || "dev";
    let deployment = literals[network];
    let config = configuration.read();
    let account = config.account;

    let swarm = new storage.Swarm();
    let kycStorage = new contract.KycStorage(account, web3, deployment);

    kycStorage.read(address, hexSwarmHash => {
        let swarmHash = hexSwarmHash.replace("0x", "");
        swarm.download(swarmHash, descriptorString => {
            let descriptor = JSON.parse(descriptorString);
            let path = descriptor.path;
            let handlers = descriptor.handlers;

            keys.readKey(keyPassword, key => {
               let keySet = keys.readKeySet();
               let otherPublicKey = keySet.byAddress(address);
               if (otherPublicKey) {
                   let sharedSecret = secret.ecdhSecret(key, otherPublicKey);
                   let correctHandler = _.find(handlers, handler => {
                       return decodeRow(handler, sharedSecret);
                   });
                   let swarmHash = bzzrSwarmHash(path);
                   let decodedRow = decodeRow(correctHandler, sharedSecret);
                   swarm.download(swarmHash, content => {
                       let password = decodedRow.password;
                       let decrypted = secret.decrypt(content, password);
                       let checksum = secret.digest(decrypted);
                       if (_.isEqual(checksum, decodedRow.checksum)) {
                           fs.writeFileSync(filePath, decrypted);
                       } else {
                           console.log("Wrong checksum");
                       }
                   });
               } else {
                   console.log(`Can not find an entry by ${address}`)
               }
            });
        });
    });
};
