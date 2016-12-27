#!/usr/bin/env node --harmony

"use strict";

const commander = require("commander"),
      Web3 = require("web3"),
      fs = require("fs"),
      keythereum = require("keythereum"),
      crypto = require("crypto"),
      path = require("path");

const ecdsa = new (require("elliptic").ec)("secp256k1");

const literals = require("../lib/literals"),
      storage = require("../lib/storage"),
      contract = require("../lib/contract"),
      secret = require("../lib/secret");

const web3 = new Web3();


web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545')); // FIXME CONST

const parse = function (argv, callback) {
    let parser = commander
        .version("v0.0.1")
        .option("-N, --network [network]", "ethereum network, dev by default")
        .arguments("<configFilePath> <password>")
        .action((configFilePath, password) => {
            let config = JSON.parse(fs.readFileSync(configFilePath));
            config.password = password;
            callback(config);
        });

    parser.parse(argv);

    if (!argv.slice(2).length) {
        parser.outputHelp();
    }
};

const CIPHER_NAME = "aes256";

const encrypt = function (plainText, password, callback) {
    callback(encryptSync(plainText, password));
};

const encryptSync = function (plainText, password) {
    const cipher = crypto.createCipher(CIPHER_NAME, password);
    let encrypted = cipher.update(plainText, "binary", "binary");
    encrypted += cipher.final("binary");
    return encrypted;
};

const decrypt = function (cipherText, password, callback) {
    const decipher = crypto.createDecipher(CIPHER_NAME, password);
    let decoded  = decipher.update(cipherText, "binary", "binary");
    decoded += decipher.final("binary");
    callback(decoded)
};

const recoverPublicKey = function (privateKey, callback) {
    let pubKey = ecdsa.keyFromPrivate(privateKey).getPublic();
    callback(pubKey);
};

parse(process.argv, (opts) => {
    keythereum.importFromFile(opts.me, opts.datadir, (keyObject) => {
        let encryptionPassword = crypto.randomBytes(10).toString("hex");
        let contents = fs.readFileSync(opts.filePath);
        encrypt(contents, encryptionPassword, (cipherText) => {
            let directory = path.dirname(opts.filePath);
            let basename = path.basename(opts.filePath);
            let encFilePath = path.join(directory, basename + ".enc");
            fs.writeFileSync(encFilePath, cipherText, { encoding: "binary" });

            let outputDescriptor = {
                path: encFilePath,
                receivers: [
                ]
            };

            let row = "checksum" + ":" + encryptionPassword;

            keythereum.recover(opts.password, keyObject, (privateKey) => {
                for (let receiver of opts.receivers) {
                    let receiverECDH = crypto.createECDH("secp256k1");
                    receiverECDH.setPrivateKey(privateKey.toString("hex"), "hex");
                    let ecdhSecret = receiverECDH.computeSecret(receiver.pub, "hex");
                    let realSharedSecret = secret.digest(ecdhSecret).slice(0, 32);
                    let encryptedRow = Buffer(encryptSync(row, realSharedSecret)).toString("hex");
                    outputDescriptor.receivers.push(encryptedRow);
                }

                console.log(outputDescriptor);
            });
        });
    });
});
