"use strict";

const fs = require("fs");

const configuration = require("../lib/configuration"),
      secret = require("../lib/secret");

/**
 * @param {string} filePath
 * @return {PublicKey}
 */
const readPublicKey = function (filePath) {
    let jwk = JSON.parse(fs.readFileSync(filePath));
    return secret.PublicKey.fromJWK(jwk);
};

/**
 * @param {string} keySetFilePath
 * @return {KeySet}
 */
const readKeySet = function (keySetFilePath) {
    let keySet = new secret.KeySet();
    try {
        let jwk = JSON.parse(fs.readFileSync(keySetFilePath))
        keySet = secret.KeySet.fromJWK(jwk);
    } catch (e) {
        // Do Nothing
    }
    return keySet;
};

/**
 * @param {KeySet} keySet
 * @param {string} keySetFilePath
 */
const writeKeySet = function (keySet, keySetFilePath) {
    let jwk = keySet.jwk();
    let jwkString = JSON.stringify(jwk);
    fs.writeFileSync(keySetFilePath, jwkString);
};

module.exports = function (filePath) {
    let keySetFilePath = configuration.keySetFilePath;

    let publicKey = readPublicKey(filePath);
    let keySet = readKeySet(keySetFilePath);
    keySet.add(publicKey);
    writeKeySet(keySet, keySetFilePath)
};
