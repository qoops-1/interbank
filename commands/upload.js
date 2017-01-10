"use strict";

const fs            = require("fs"),
      base64url     = require("base64url"),
      Web3          = require("web3");

const secret        = require("../lib/secret"),
      storage       = require("../lib/storage"),
      configuration = require("../lib/configuration"),
      keys          = require("../lib/keys"),
      contract      = require("../lib/contract"),
      literals      = require("../lib/literals");

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

const prepareDescriptor = function (key, documentAddress, checksum, password) {
    let row = checksum + ":" + password;
    let keySet = keys.readKeySet();

    let handlers = keySet.keys().map(publicKey => {
        let sharedSecret = secret.ecdhSecret(key, publicKey);
        let encryptedRow = secret.encrypt(row, sharedSecret);
        return base64url.encode(encryptedRow);
    });

    return {
        path: documentAddress,
        handlers: handlers
    }
};

module.exports = function (keyPassword, filePath, options) {
    keys.readKey(keyPassword, key => {
        let swarm = new storage.Swarm();
        let documentPassword = secret.randomBytes(10);

        let contents = fs.readFileSync(filePath);
        let encryptedContent = secret.encrypt(contents, documentPassword);

        swarm.upload(encryptedContent, swarmHash => {
            let documentAddress = "bzzr://" + swarmHash;
            let checksum = secret.digest(contents);
            let descriptor = prepareDescriptor(key, documentAddress, checksum, documentPassword);
            let descriptorString = JSON.stringify(descriptor);
            swarm.upload(descriptorString, descriptorHash => {
                let network = options.network || "dev";
                let deployment = literals[network];
                let config = configuration.read();
                let account = config.account;
                let kycStorage = new contract.KycStorage(account, web3, deployment);
                let hexDescriptorHash = "0x" + descriptorHash;
                let hexChecksum = "0x" + checksum.toString("hex");
                kycStorage.add(hexDescriptorHash, hexChecksum, (error, txid) => {
                    if (error) {
                        throw error;
                    } else {
                        console.log(`Updated doc for ${account}: checksum ${hexChecksum}`);
                        console.log(`Txid: ${txid}`);
                        console.log(`Document address: bzzr://${descriptorHash}`);
                    }
                });
            });
        });
    });
};
