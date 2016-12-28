"use strict";

const keythereum = require("keythereum"),
      elliptic = require("elliptic");

const CURVE = new (elliptic.ec)("secp256k1");

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

/**
 * Wrapper for public key.
 * @param {Buffer} buffer
 * @constructor
 */
const PublicKey = function (buffer) {
    this._buffer = buffer;
};

/**
 * @returns {Buffer}
 */
PublicKey.prototype.buffer = function () {
    return this._buffer;
};

/**
 * Wrapper for private key.
 * @param {Buffer} buffer
 * @constructor
 */
const PrivateKey = function (buffer) {
    this._buffer = buffer;
};

/**
 * @returns {Buffer}
 */
PrivateKey.prototype.buffer = function () {
    return this._buffer;
};

/**
 * Key pair built on `privateKey` bytes.
 * @param {PrivateKey} privateKey
 * @param {PublicKey} publicKey
 * @constructor
 */
const Key = function (privateKey, publicKey) {
    if (!privateKey) throw "Expect non-null privateKey argument";
    if (!publicKey) throw "Expect non-null publicKey argument";
    if (!(privateKey instanceof PrivateKey)) throw "Expect privateKey param to be instance of PrivateKey";
    if (!(publicKey instanceof PublicKey)) throw "Expect publicKey param to be instance of PublicKey";

    this.privateKey = privateKey;
    this.publicKey = publicKey;
};

/**
 * @returns {PrivateKey}
 */
Key.prototype.private = function () {
    return this.privateKey;
};

/**
 * @returns {PublicKey}
 */
Key.prototype.public = function () {
    return this.publicKey;
};

/**
 * Derive public key corresponding to the private one.
 * @param privateKey
 */
const derivePublicKey = function (privateKey) {
    let privateKeyBuffer = privateKey.buffer();
    let publicKeyBuffer = Buffer.from(CURVE.keyFromPrivate(privateKeyBuffer).getPublic("arr"));
    return new PublicKey(publicKeyBuffer);
};

module.exports = {
    CURVE: CURVE,
    Key: Key,
    PrivateKey: PrivateKey,
    PublicKey: PublicKey,
    derivePublicKey: derivePublicKey,
    digest: digest
};
