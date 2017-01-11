"use strict";

const fs            = require("fs"),
      elliptic      = require("elliptic");

const keys          = require("../lib/keys");

/**
 * Export own public key as JWK to `filePath`.
 *
 * @param {string} password
 * @param {string} filePath
 */
module.exports = function (password, filePath) {
    keys.readKey(password, key => {
        let publicKey = key.public();
        let jwk = publicKey.jwk();
        let jwkString = JSON.stringify(jwk);
        fs.writeFileSync(filePath, jwkString);
    });
};
