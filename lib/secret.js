"use strict";

const keythereum    = require("keythereum"),
      elliptic      = require("elliptic"),
      base64url     = require("base64url"),
      _             = require("lodash"),
      crypto        = require("crypto"),
      pubToAddress  = require("ethereumjs-util").pubToAddress;

const CIPHER_NAME = "aes256";
const JWK_KEY_TYPE = "EC";
const CURVE_NAME = "secp256k1";
const CURVE = new (elliptic.ec)(CURVE_NAME);

/**
 * Wrapper for public key.
 * @param {Buffer} buffer
 * @constructor
 */
const PublicKey = function (buffer) {
    this._buffer = buffer;
};

PublicKey.JWK_USE = ["encrypt", "verify"];

/**
 * Reconstruct PublicKey from JWK.
 * @param {{kty: string, use: array, crv: string, x: string, y: string, kid: String}} jwk
 * @returns {PublicKey}
 */
PublicKey.fromJWK = function (jwk) {
    let suitable =
        jwk.kty == JWK_KEY_TYPE &&
        jwk.crv == CURVE_NAME &&
        ! _.isEmpty(_.intersection(PublicKey.JWK_USE, jwk.use)) &&
        ! _.isEmpty(jwk.x) &&
        ! _.isEmpty(jwk.y);

    if (!suitable) throw "Invalid JWK passed";

    let x = base64url.toBuffer(jwk.x);
    let y = base64url.toBuffer(jwk.y);
    let point = CURVE.curve.point(x, y);
    let buffer = Buffer.from(point.encode());
    return new PublicKey(buffer);
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
    if (!this._point) {
        this._point = CURVE.curve.decodePoint(this.buffer());
    }
    return this._point;
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
        kty: JWK_KEY_TYPE,
        use: PublicKey.JWK_USE,
        crv: CURVE_NAME,
        x: base64url.encode(point.x.toBuffer()),
        y: base64url.encode(point.y.toBuffer()),
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

Key.JWK_USE = ["sign", "verify", "encrypt", "decrypt"];

/**
 * Reconstruct private key from JWK.
 * @param {{kty: string, crv: string, x: string, y: string, d: string kid: String}} jwk
 * @returns {Key}
 */
Key.fromJWK = function (jwk) {
    let suitable =
        jwk.kty == JWK_KEY_TYPE &&
        jwk.crv == CURVE_NAME &&
        ! _.isEmpty(_.intersection(Key.JWK_USE, jwk.use)) &&
        ! _.isEmpty(jwk.d);

    if (!suitable) throw "Invalid JWK passed";


    let buffer = base64url.toBuffer(jwk.d);
    return new Key(buffer);
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
 * Represent as JWK.
 *
 * @returns {{kty: string, crv: string, x: string, y: string, d: string kid: String}}
 */
Key.prototype.jwk = function () {
    let jwk = Object.assign(this.public().jwk());
    jwk.use = Key.JWK_USE;
    jwk.d = base64url.encode(this.buffer());
    return jwk;
};

/**
 * Set of JWK public keys.
 *
 * @param {Array} keys
 * @constructor
 */
const KeySet = function (keys = []) {
    this._keys = keys;
};

KeySet.fromJWK = function (json) {
    let keys = _.map(json.keys, (jwk) => {
        return PublicKey.fromJWK(jwk);
    });
    return new KeySet(keys);
};

/**
 * Return keys contained.
 *
 * @return {Array}
 */
KeySet.prototype.keys = function () {
    return this._keys;
};

/**
 * Add Key or PublicKey.
 *
 * @param {Key, PublicKey} publicKey
 */
KeySet.prototype.add = function (publicKey) {
    if (! (publicKey instanceof PublicKey)) throw "Expect PublicKey";
    let publicKeyAddress = publicKey.address();
    let same = _.find(this._keys, (k) => {
       return _.isEqual(publicKeyAddress, k.address());
    });
    if (!same) {
        this._keys.push(publicKey);
    }
};

KeySet.prototype.byAddress = function (address) {
    let pattern = address;
    if (typeof address == 'string') {
        pattern = Buffer.from(address.replace("0x", ""), "hex");
    }
    return _.find(this.keys(), k => {
      return _.isEqual(k.address(), pattern);
    })
};

/**
 * JWK representation of the key set.
 *
 * @return {{keys: Array}}
 */
KeySet.prototype.jwk = function () {
    let jwkKeys = _.map(this._keys, (key) => { return key.jwk() });
    return {
        keys: jwkKeys
    }
};

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
 * Derive public key corresponding to the private one.
 * @param privateKey
 */
const derivePublicKey = function (privateKey) {
    let privateKeyBuffer = privateKey.buffer();
    let publicKeyBuffer = Buffer.from(CURVE.keyFromPrivate(privateKeyBuffer).getPublic("arr"));
    return new PublicKey(publicKeyBuffer);
};

/**
 * Random bytes, for example for password.
 *
 * @param {number} length
 * @return {Buffer}
 */
const randomBytes = function (length) {
    return crypto.randomBytes(length);
};

/**
 * Symmetric encryption.
 *
 * @param {Buffer|string} plainText
 * @param {Buffer|string} password
 * @return {Buffer}
 */
const encrypt = function (plainText, password) {
    let cipher = crypto.createCipher(CIPHER_NAME, password.toString());
    let encrypted = cipher.update(plainText.toString(), "binary", "binary");
    encrypted += cipher.final("binary");
    return Buffer.from(encrypted);
};

/**
 * Symmetric decryption.
 *
 * @param {Buffer|string} cipherText
 * @param {Buffer|string} password
 * @return {Buffer}
 */
const decrypt = function (cipherText, password) {
    let decipher = crypto.createDecipher(CIPHER_NAME, password.toString());
    let decrypted  = decipher.update(cipherText.toString(), "binary", "binary");
    decrypted += decipher.final("binary");
    return Buffer.from(decrypted);
};

/**
 * Compute Elliptic Curve Diffie-Hellman shared secret.
 * @param {Key} key
 * @param {PublicKey} publicKey
 * @return {Buffer}
 */
const ecdhSecret = function (key, publicKey) {
    let ecdh = crypto.createECDH(CURVE_NAME);
    ecdh.setPrivateKey(key.buffer());
    let ecdhSecret = ecdh.computeSecret(publicKey.buffer());
    let sharedSecret = digest(ecdhSecret).slice(0, 32);
    return sharedSecret;
};

module.exports = {
    CURVE: CURVE,
    Key: Key,
    PublicKey: PublicKey,
    KeySet: KeySet,
    derivePublicKey: derivePublicKey,
    digest: digest,
    encrypt: encrypt,
    decrypt: decrypt,
    randomBytes: randomBytes,
    ecdhSecret: ecdhSecret
};
