#!/usr/bin/env node

"use strict";

const fs                = require("fs"),
      path              = require("path"),
      commander         = require("commander"),
      Web3              = require("web3");

const contract = require("../lib/contract"),
    configuration = require("../lib/configuration"),
    literals = require("../lib/literals"),
    keys = require("../lib/keys"),
    kyc = require("../lib/kyc"),
    secret = require("../lib/secret");

const PACKAGE_PATH = path.resolve(path.join(__dirname, "../package.json"));
const PACKAGE = JSON.parse(fs.readFileSync(PACKAGE_PATH));

const web3 = new Web3(new Web3.providers.HttpProvider(configuration.ethHttpAddress()));

const parseArgs = function (args) {
    let result = {};

    commander
        .version(PACKAGE.version)
        .arguments("<key> <password> <address>")
        .option("-N, --network [network]", "ethereum network, dev by default")
        .action((keyFilePath, password, address, options) => {
            result.keyFilePath = keyFilePath;
            result.password = password;
            result.network = options.network || "dev";
            result.address = address;
        })
        .parse(process.argv);

    return result;
};

let args = parseArgs(process.argv);
let config = configuration.read();

let deployment = literals[args.network];
let watching = args.address;
let me = config.account;

keys.readKeyFile(args.keyFilePath, args.password, key => {
    let keySet = keys.readKeySet();
    let client = new kyc.Client(web3, args.network, me, keySet, publicKey => {
        return secret.ecdhSecret(key, publicKey);
    });

    let kycStorage = new contract.KycStorage(me, web3, deployment);
    console.log(`Start watching for ${watching}`);
    kycStorage.watch(watching, (error, result, stop) => {
        if (error) throw error;
        console.log(`Received update on ${watching}`);
        let event = result.args;
        console.log(`Swarm hash: ${event.rights}`);
        console.log(`Checksum: ${event.checksum}`);

        client.download(watching, (error, document) => {
            console.log(document.toString());
            console.log("--------------------------");
        });
    });
});
