#!/usr/bin/env node

"use strict";

const fs                = require("fs"),
    path              = require("path"),
    commander         = require("commander"),
    Web3              = require("web3"),
    express = require("express"),
    bodyParser = require('body-parser');

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

});

app.listen(8080, function(_) {
    console.log("Waiting at http://localhost:8080/");
});
