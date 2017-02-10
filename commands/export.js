"use strict";

const fs            = require("fs"),
      elliptic      = require("elliptic"),
      wallet        = require("ethereumjs-wallet"),
      path          = require("path");

const secret        = require("../lib/secret");

/**
 * Export own public key as JWK to `filePath`.
 * @param {string} keyFilePath
 * @param {string} password
 * @param {string} jwkFilePath
 */
module.exports = function (keyFilePath, password, jwkFilePath) {
    let keyString = fs.readFileSync(path.resolve(keyFilePath));
    let ethKey = wallet.fromV3(JSON.parse(keyString), password);
    let key = new secret.Key(ethKey.getPrivateKey());
    let publicKey = key.public();
    let jwk = publicKey.jwk();
    let jwkString = JSON.stringify(jwk);
    fs.writeFileSync(jwkFilePath, jwkString);
};
