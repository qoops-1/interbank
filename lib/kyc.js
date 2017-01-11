"use strict";

const base64url     = require("base64url"),
      _             = require("lodash");

const storage       = require("./storage"),
      secret        = require("./secret"),
      literals      = require("./literals"),
      contract      = require("./contract");

const SEPARATOR = "§";
const HANDLER_REGEX = new RegExp(`([\\w-_]+)${SEPARATOR}([\\w-_]+)`);

/**
 * Proper bzzr://address for the provided hash.
 *
 * @param {string|Buffer} probablyHash
 * @return {string}
 */
const bzzrAddress = function (probablyHash) {
    let hash = bzzrHash(probablyHash);
    return `bzzr://${hash}`
};

/**
 * Convert bzzr://url or hash in hex to vanilla bzzr hash.
 *
 * @param {string} probablyHash
 * @return {string}
 */
const bzzrHash = function (probablyHash) {
    if (_.startsWith(probablyHash, "0x")) {
        return probablyHash.replace("0x", "");
    } else if (_.startsWith(probablyHash, "bzzr://")) {
        return probablyHash.replace("bzzr://", "")
    } else if (probablyHash instanceof Buffer) {
        return probablyHash.toString("hex");
    } else {
        return probablyHash;
    }
};

/**
 * Encode handler as string.
 *
 * @param {Buffer} checksum
 * @param {Buffer|string} password
 * @return {string}
 */
const genHandler = function (checksum, password) {
    return base64url.encode(checksum) + SEPARATOR + base64url.encode(password);
};

/**
 * Parse handler from string.
 *
 * @param {string} encryptedHandler
 * @param {string} sharedSecret
 * @return {{checksum: Buffer, password: Buffer}|null}
 */
const parseHandler = function (encryptedHandler, sharedSecret) {
    try {
        let decoded = base64url.toBuffer(encryptedHandler);
        let decrypted = secret.decrypt(decoded, sharedSecret).toString();
        let match = HANDLER_REGEX.exec(decrypted);
        return {
            checksum: base64url.toBuffer(match[1]),
            password: base64url.toBuffer(match[2])
        }
    } catch (e) {
        // Do Nothing
    }
};

/**
 * Find handler that could be decrypted by the shared secret.
 *
 * @param {Array<string>} encryptedHandlers
 * @param {string} sharedSecret
 * @return {{checksum: Buffer, password: Buffer}|null}
 */
const findHandler = function (encryptedHandlers, sharedSecret) {
    let decrypted = _.map(encryptedHandlers, encryptedHandler => {
        return parseHandler(encryptedHandler, sharedSecret);
    });
    let nonEmpty = _.compact(decrypted);
    return nonEmpty[0];
};

/**
 * Descriptor document.
 *
 * @param {string} url Address of the encrypted document.
 * @param {string} handler Decrypted handler.
 * @param {Array<PublicKey>} keys
 * @param {function(PublicKey)} genSharedSecret
 * @return {{url: *, handlers: (Array|*|{})}}
 */
const genDescriptor = function (url, handler, keys, genSharedSecret) {
    let encryptedHandlers = keys.map(publicKey => {
        let sharedSecret = genSharedSecret(publicKey);
        let encryptedRow = secret.encrypt(handler, sharedSecret);
        return base64url.encode(encryptedRow);
    });

    return {
        url: url,
        handlers: encryptedHandlers
    }
};

const Client = function (web3, network, account, keySet, genSharedSecret) {
    this.network = network;
    this.account = account;
    this.swarm = new storage.Swarm();
    this.keySet = keySet;
    this.genSharedSecret= genSharedSecret;

    let deployment = literals[this.network];
    this.kycStorage = new contract.KycStorage(this.account, web3, deployment);
};

Client.prototype.upload = function (document, callback) {
    let documentPassword = secret.randomBytes(10);
    let checksum = secret.digest(document);
    let encryptedDocument = secret.encrypt(document, documentPassword);

    this._upload(encryptedDocument, documentUrl => {
        let handler = genHandler(checksum, documentPassword);
        let recipientKeys = this.keySet.keys();
        let descriptor = genDescriptor(documentUrl, handler, recipientKeys, this.genSharedSecret);
        let descriptorString = JSON.stringify(descriptor);
        this.swarm.upload(descriptorString, descriptorSwarmHash => {
            this._blockchainWrite(descriptorSwarmHash, checksum, (error, txid) => {
                callback(error, checksum, txid, bzzrAddress(descriptorSwarmHash));
            });
        });
    });
};

Client.prototype.download = function (address, callback) {
    let thatPublicKey = this.keySet.byAddress(address);
    if (!thatPublicKey) throw `Can not find an entry by ${address}`;

    let sharedSecret = this.genSharedSecret(thatPublicKey);

    this._blockchainRead(address, (swarmHash, checksum) => {
        this._download(swarmHash, descriptorString => {
            let descriptor = JSON.parse(descriptorString);
            let handler = findHandler(descriptor.handlers, sharedSecret);
            if (!_.isEqual(checksum, handler.checksum)) throw "Handler and contract contain different checksums";

            this._download(descriptor.url, encryptedDocument => {
                let document = secret.decrypt(encryptedDocument, handler.password);
                let documentChecksum = secret.digest(document);
                if (!_.isEqual(documentChecksum, checksum)) throw "Invalid document";
                callback(null, document);
            });
        });
    })
};

Client.prototype._upload = function (document, callback) {
    this.swarm.upload(document, swarmHash => {
       let url = bzzrAddress(swarmHash);
       callback(url);
    });
};

Client.prototype._download = function (hashOrUrl, callback) {
    let _hash = bzzrHash(hashOrUrl);
    this.swarm.download(_hash, callback);
};

Client.prototype._blockchainWrite = function (descriptorSwarmHash, checksum, callback) {
    let hexDescriptorHash = "0x" + descriptorSwarmHash;
    let hexChecksum = "0x" + checksum.toString("hex");
    this.kycStorage.add(hexDescriptorHash, hexChecksum, (error, txid) => {
        callback(error, txid);
    });
};

Client.prototype._blockchainRead = function (address, callback) {
    this.kycStorage.read(address, (hexSwarmHash, checksum) => {
        let swarmHash = hexSwarmHash.replace("0x", "");
        let checksumBuffer = Buffer.from(checksum.replace("0x", ""), "hex");
        callback(swarmHash, checksumBuffer);
    });
};

module.exports = {
    Client: Client
};