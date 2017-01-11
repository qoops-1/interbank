"use strict";

const fs            = require("fs"),
      keythereum    = require("keythereum");

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

/**
 * Read own key.
 *
 * @param {string} password
 * @param {function(Key)} callback
 */
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

module.exports = {
    readKeySet: readKeySet,
    writeKeySet: writeKeySet,
    readKey: readKey
};