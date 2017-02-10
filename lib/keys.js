"use strict";

const fs            = require("fs"),
      keythereum    = require("keythereum"),
      path          = require("path"),
      wallet = require('ethereumjs-wallet');

const configuration = require("./configuration"),
      secret        = require("./secret");

/**
 * @return {KeySet}
 */
const readKeySet = function () {
    let keySetFilePath = configuration.keySetFilePath;
    let keySet = new secret.KeySet();
    try {
        let jwk = JSON.parse(fs.readFileSync(keySetFilePath));
        keySet = secret.KeySet.fromJWK(jwk);
    } catch (e) {
        // Do Nothing
    }
    return keySet;
};

/**
 * @param {KeySet} keySet
 */
const writeKeySet = function (keySet) {
    let keySetFilePath = configuration.keySetFilePath;

    let jwk = keySet.jwk();
    let jwkString = JSON.stringify(jwk);
    fs.writeFileSync(keySetFilePath, jwkString);
};

const readKey = function (password, callback) {
    let config = configuration.read();
    let address = config.account;
    let datadir = config.datadir;

    keythereum.importFromFile(address, datadir, keyObject => {
        keythereum.recover(password, keyObject, privateKeyBuffer => {
            let key = new secret.Key(privateKeyBuffer);
            callback(key);
        });
    });
};

/**
 * Read an Ethereum V3 key.
 *
 * @param {string} filePath
 * @param {string} password
 * @param {function(Key)} callback
 */
const readKey = function (filePath, password, callback) {
    let inputString = fs.readFileSync(path.resolve(filePath));
    let key = wallet.fromV3(JSON.parse(inputString), password);
    let privateKey = new secret.Key(key.getPrivateKey());
    callback(privateKey);
};

module.exports = {
    readKeySet: readKeySet,
    writeKeySet: writeKeySet,
    readKey: readKey
};
