"use strict";

const fs            = require("fs");

const keys          = require("../lib/keys");
const ops   = require("../lib/ops");

/**
 * Export own public key as JWK to `filePath`.
 * @param {string} keyFilePath
 * @param {string} password
 * @param {string} jwkFilePath
 */
module.exports = function (keyFilePath, password, jwkFilePath) {
    ops.exportOp(keyFilePath, password, jwk => {
        let jwkString = JSON.stringify(jwk);
        fs.writeFileSync(jwkFilePath, jwkString);
    });
};
