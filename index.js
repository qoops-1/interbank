#!/usr/bin/env node

"use strict";

const fs                = require("fs"),
    path              = require("path"),
    commander         = require("commander"),
    Web3              = require("web3"),
    express = require("express"),
    bodyParser = require('body-parser'),
    wallet = require('ethereumjs-wallet');

const contract = require("./lib/contract"),
    configuration = require("./lib/configuration"),
    literals = require("./lib/literals"),
    keys = require("./lib/keys"),
    kyc = require("./lib/kyc"),
    secret = require("./lib/secret"),
    ops = require("./lib/ops");

const PACKAGE_PATH = path.resolve(path.join(__dirname, "./package.json"));
const PACKAGE = JSON.parse(fs.readFileSync(PACKAGE_PATH));

const web3 = new Web3(new Web3.providers.HttpProvider(configuration.ethHttpAddress()));


let app = express();
app.use(bodyParser.json());
app.use(bodyParser.text());


app.post("/import", (req, res) => {
    try {
        let keyString = req.body;
        ops.importOp(keyString);
        res.status(201).end();
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.get("/export", (req, res) => {
    let keyFilePath = configuration.keyFilePath();
    let password = req.query.password;

    try {
        let inputString = fs.readFileSync(path.resolve(keyFilePath));
        console.log(JSON.parse(inputString));
        console.log(password);
        let key = wallet.fromV3(JSON.parse(inputString), password);
        let privateKey = new secret.Key(key.getPrivateKey());
        let jwk = privateKey.public().jwk();
        res.status(200).json(jwk);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(8080, function(_) {
    console.log("Waiting at http://localhost:8080/");
});
