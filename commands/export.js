"use strict";

const fs            = require("fs");

const keys          = require("../lib/keys");

/**
 * Export own public key as JWK to `filePath`.
 * @param {string} keyFilePath
 * @param {string} password
 * @param {string} jwkFilePath
 */
module.exports = function (keyFilePath, password, jwkFilePath) {
    keys.readKeyFile(keyFilePath, password, key => {
        let publicKey = key.public();
        let jwk = publicKey.jwk();
        let jwkString = JSON.stringify(jwk);
        fs.writeFileSync(jwkFilePath, jwkString);
    });
};
