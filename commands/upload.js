"use strict";

const fs            = require("fs"),
      Web3          = require("web3");

const secret        = require("../lib/secret"),
      configuration = require("../lib/configuration"),
      keys          = require("../lib/keys"),
      kyc           = require("../lib/kyc");

module.exports = function (keyFilePath, keyPassword, filePath, options) {
    let network = options.network || "dev";
    let config = configuration.read();
    let account = config.account;

    let web3 = new Web3(new Web3.providers.HttpProvider(configuration.ethHttpAddress()));

    keys.readKeyFile(keyFilePath, keyPassword, key => {
        let keySet = keys.readKeySet();
        let client = new kyc.Client(web3, network, account, keySet, publicKey => {
            return secret.ecdhSecret(key, publicKey);
        });
        let contents = fs.readFileSync(filePath);
        client.upload(contents, (error, checksum, txid, descriptorUrl) => {
            if (error) {
                throw error;
            } else {
                console.log(`Updated KYC card for ${this.account}`);
                console.log(`Checksum: ${"0x" + checksum.toString("hex")}`);
                console.log(`Txid: ${txid}`);
                console.log(`Descriptor address: ${descriptorUrl}`);
            }
        });
    });
};
