#!/usr/bin/env node --harmony

"use strict";

const commander = require("commander"),
      Web3 = require("web3"),
      fs = require("fs"),
      crypto = require('crypto');


const literals = require("../lib/literals"),
      storage = require("../lib/storage"),
      contract = require("../lib/contract");

const web3 = new Web3();


web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545')); // FIXME CONST

const parse = function (argv, callback) {
    let parser = commander
        .version("v0.0.1")
        .option("-N, --network [network]", "ethereum network, dev by default")
        .arguments("<account> <path>")
        .action((account, path, options) => {
            let opts = {
                account: account,
                path: path,
                network: options.network || "dev"
            };
            callback(opts);
        });

    parser.parse(argv);

    if (!argv.slice(2).length) {
        parser.outputHelp();
    }
};

const digest = function (contents, callback) {
    let sha256 = crypto.createHash('sha256');
    sha256.on('readable', () => {
        let data = sha256.read();
        if (data) {
            let stringHex = data.toString('hex');
            callback(stringHex);
        }
    });

    sha256.write(contents);
    sha256.end();
};

parse(process.argv, (options) => {
    let account = options.account;

    let swarm = new storage.Swarm();
    let deployment = literals[options.network];
    let kycStorage = new contract.KycStorage(account, web3, deployment);

    let contents = fs.readFileSync(options.path);
    digest(contents, (checksum) => {
        swarm.upload(contents, function (hash) {
            let hexHash = "0x" + hash;
            let hexChecksum = "0x" + checksum;
            kycStorage.add(hexHash, hexChecksum, (error, txid) => {
                if (error) {
                    throw error;
                } else {
                    console.log(`Updated doc for ${account}: Swarm hash ${hash}, checksum ${checksum}`);
                    console.log(`Txid: ${txid}`)
                }
            });
        });
    });
});
