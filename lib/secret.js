"use strict";

const keythereum = require("keythereum"),
      elliptic = require("elliptic"),
      pubToAddress = require("ethereumjs-util").pubToAddress;

const CURVE_NAME = "secp256k1";
const CURVE = new (elliptic.ec)(CURVE_NAME);

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
 * Represent as EC point.
 * @returns {{x:Object,y:Object}}
 */
PublicKey.prototype.point = function () {
    return CURVE.curve.decodePoint(this.buffer());
};

/**
 * Ethereum address for the public key.
 * @returns {Buffer}
 */
PublicKey.prototype.address = function () {
    return pubToAddress(this.buffer());
};

/**
 * Represent as JWK.
 *
 * @returns {{kty: string, crv: string, x: string, y: string, kid: String}}
 */
PublicKey.prototype.jwk = function () {
    let point = this.point();
    let address = this.address().toString("hex");
    return {
        kty: "EC",
        crv: CURVE_NAME,
        x: point.x.toString("hex"),
        y: point.y.toString("hex"),
        kid: address
    };
};

/**
 * Key pair built on `privateKey` bytes.
 *
 * @param {Buffer} buffer
 * @constructor
 */
const Key = function (buffer) {
    this._buffer = buffer;
};

/**
 * @returns {Buffer}
 */
Key.prototype.buffer = function () {
    return this._buffer;
};

/**
 * @returns {PublicKey}
 */
Key.prototype.public = function () {
    if (!this._publicKey) {
        this._publicKey = derivePublicKey(this);
    }
    return this._publicKey;
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
    PublicKey: PublicKey,
    derivePublicKey: derivePublicKey,
    digest: digest
};
