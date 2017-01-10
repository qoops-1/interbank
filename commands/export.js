"use strict";

const fs            = require("fs"),
      elliptic      = require("elliptic");

const secret        = require("../lib/secret"),
      keys          = require("../lib/keys");

const ecdsa = new (elliptic.ec)("secp256k1");

/**
 * Export own public key as JWK to `filePath`.
 *
 * @param {string} password
 * @param {string} filePath
 */
module.exports = function (password, filePath) {
    keys.readKey(password, key => {
        let keyBuffer = key.buffer();
        let publicKeyHex = ecdsa.keyFromPrivate(keyBuffer).getPublic("hex");
        let publicKeyBuffer = Buffer.from(publicKeyHex, "hex");
        let publicKey = new secret.PublicKey(publicKeyBuffer);
        let jwk = publicKey.jwk();
        let jwkString = JSON.stringify(jwk);
        fs.writeFileSync(filePath, jwkString);
    });
};
