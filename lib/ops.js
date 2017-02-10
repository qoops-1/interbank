"use strict";

const secret    = require("./secret"),
      keys      = require("./keys");

/**
 * @param {object, string} jsonString
 */
const importOp = (jsonString) => {
    let jwk = jsonString;
    if (typeof jsonString == "string") {
        jwk = JSON.parse(jsonString);
    }
    let publicKey = secret.PublicKey.fromJWK(jwk);
    let keySet = keys.readKeySet();
    keySet.add(publicKey);
    keys.writeKeySet(keySet);
};

const exportOp = (keyFilePath, password, callback) => {
    keys.readKey(keyFilePath, password, key => {
        let jwk = key.public().jwk();
        callback(jwk);
    });
};

module.exports = {
    importOp: importOp,
    exportOp: exportOp
};
