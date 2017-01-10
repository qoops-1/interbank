"use strict";

const fs            = require("fs"),
      path          = require("path"),
      keythereum    = require("keythereum"),
      elliptic      = require("elliptic");

const configuration = require("../lib/configuration"),
      secret        = require("../lib/secret");

const ecdsa = new (elliptic.ec)("secp256k1");

/**
 * Export own public key as JWK to `filePath`.
 *
 * @param {string} password
 * @param {string} filePath
 */
module.exports = function (password, filePath) {
    let config = configuration.read();
    let address = config.account;
    let datadir = config.datadir;

    keythereum.importFromFile(address, datadir, keyObject => {
        keythereum.recover(password, keyObject, (privateKey) => {
            let publicKeyHex = ecdsa.keyFromPrivate(privateKey).getPublic("hex");
            let publicKeyBuffer = Buffer.from(publicKeyHex, "hex");
            let publicKey = new secret.PublicKey(publicKeyBuffer);
            let jwk = publicKey.jwk();
            let jwkString = JSON.stringify(jwk);
            fs.writeFileSync(filePath, jwkString);
        });
    });
};
