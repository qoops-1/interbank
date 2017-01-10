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
        .arguments("<account> <id>")
        .action((account, id, options) => {
            let opts = {
                account: account,
                id: id,
                network: options.network || "dev"
            };
            callback(opts);
        });

    parser.parse(argv);

    if (!argv.slice(2).length) {
        parser.outputHelp();
    }
};

parse(process.argv, (options) => {
    let account = options.account;

    let swarm = new storage.Swarm();
    let deployment = literals[options.network];
    let kycStorage = new contract.KycStorage(account, web3, deployment);

    kycStorage.read(options.id, (rights, checksum) => {
        swarm.download(rights, function (content) {
            console.log(content);
        });
    });
});
