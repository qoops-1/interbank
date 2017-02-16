#!/usr/bin/env node --harmony

"use strict";

const Web3 = require("web3"),
      fs = require("fs"),
      web3 = new Web3();


web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

const from = "0x50f550d0bbce84fa67232c33f821e202be35112f";
const password = "G6cKyE8pBvMPhuo";

web3.personal.unlockAccount(from, password, 1000);

const contents = fs.readFileSync("contracts/KycStorage.sol", "utf-8");
let compiled = web3.eth.compile.solidity(contents);

let kyc = compiled["<stdin>:KycStorage"];
console.log("~~~~~");
console.log(JSON.stringify(kyc.info.abiDefinition));
console.log("~~~~~");

let contract = web3.eth.contract(kyc.info.abiDefinition);

contract.new(null, {from: from, data: kyc.code, gas: 1000000}, function (e, contract) {
    if (e) throw e;

    if(!contract.address) {
        console.log("Contract transaction send: TransactionHash: " + contract.transactionHash + " waiting to be mined...");

    } else {
        console.log("Contract mined! Address: " + contract.address);
    }
});
