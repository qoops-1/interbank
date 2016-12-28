#!/usr/bin/env node --harmony

"use strict";

const commander = require("commander"),
      Web3 = require("web3"),
      fs = require("fs"),
      keythereum = require("keythereum"),
      path = require("path");

const ecdsa = new (require("elliptic").ec)("secp256k1");

const literals = require("../lib/literals"),
      storage = require("../lib/storage"),
      contract = require("../lib/contract");

const web3 = new Web3();

web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545')); // FIXME CONST

const parse = function (argv, callback) {
    let parser = commander
        .version("v0.0.1")
        .arguments("<datadir> <address> <password>")
        .action((datadir, address, password) => {
            let options = {
                datadir: datadir,
                address: address,
                password: password
            };
            callback(options);
        });

    parser.parse(argv);

    if (!argv.slice(2).length) {
        parser.outputHelp();
    }
};

parse(process.argv, (options) => {
    let datadir = options.datadir;
    let address = options.address;
    let password = options.password;

    keythereum.importFromFile(address, datadir, (keyObject) => {
       keythereum.recover(password, keyObject, (privateKey) => {
           console.log(ecdsa.keyFromPrivate(privateKey).getPublic("hex"));
       });
    });
});
