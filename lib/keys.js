"use strict";

const fs            = require("fs");

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

module.exports = {
    readKeySet: readKeySet,
    writeKeySet: writeKeySet
};
