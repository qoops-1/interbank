"use strict";

const fs        = require("fs");

const secret    = require("../lib/secret"),
      keys      = require("../lib/keys");

/**
 * @param {string} filePath
 * @return {PublicKey}
 */
const readPublicKey = function (filePath) {
    let jwk = JSON.parse(fs.readFileSync(filePath));
    return secret.PublicKey.fromJWK(jwk);
};

module.exports = function (filePath) {
    let publicKey = readPublicKey(filePath);
    let keySet = keys.readKeySet();
    keySet.add(publicKey);
    keys.writeKeySet(keySet);
};
