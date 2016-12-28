"use strict";

const keythereum = require("keythereum");

/**
 * SHA256 hash of the contents.
 * @param {String, Buffer} contents
 * @returns {Buffer}
 */
const digest = function (contents) {
    let sha256 = keythereum.crypto.createHash("sha256");
    sha256.update(contents);
    return sha256.digest();
};

module.exports = {
    digest: digest
};
