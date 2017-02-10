#!/usr/bin/env node

"use strict";

const fs                = require("fs"),
    path              = require("path"),
    commander         = require("commander"),
    Web3              = require("web3"),
    express = require("express"),
    bodyParser = require('body-parser'),
    wallet = require('ethereumjs-wallet'),
    multer = require("multer");

const contract = require("./lib/contract"),
    configuration = require("./lib/configuration"),
    literals = require("./lib/literals"),
    keys = require("./lib/keys"),
    kyc = require("./lib/kyc"),
    secret = require("./lib/secret"),
    ops = require("./lib/ops");

const web3 = new Web3(new Web3.providers.HttpProvider(configuration.ethHttpAddress()));
const app = express();
const upload = multer();

if(process.env.NODE_ENV==='development'){
  app.use((req, res, next)=>{
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      next();
  });
}

app.post("/import", bodyParser.text(), (req, res) => {
    try {
        let keyString = req.body;
        ops.importOp(keyString);
        res.status(201).end();
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.get("/list", (req, res) => {
    try {
        let keySet = keys.readKeySet();
        res.status(200).json(keySet.jwk());
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.get("/export", (req, res) => {
    let keyFilePath = configuration.keyFilePath();
    let password = req.query.password;

    try {
        ops.exportOp(keyFilePath, password, jwk => {
            res.status(200).json(jwk);
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.post("/upload", upload.single('file'), (req, res) => {
    let keyFilePath = configuration.keyFilePath();
    let network = configuration.network();
    let account = configuration.account();

    let password = req.body.password;
    let file = req.file;

    try {
        keys.readKey(keyFilePath, password, key => {
            let keySet = keys.readKeySet();
            let client = new kyc.Client(web3, network, account, keySet, publicKey => {
                return secret.ecdhSecret(key, publicKey);
            });

            let contents = file.buffer;

            client.upload(contents, (error, checksum, txid, descriptorUrl) => {
                if (error) {
                    res.status(500).json({ error: error.message });
                } else {
                    res.status(200).json({
                        updated: account,
                        checksum: "0x" + checksum.toString("hex"),
                        txid: txid,
                        descriptorUrl: descriptorUrl
                    });
                }
            });
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});

app.get("/download", (req, res) => {
    let keyFilePath = configuration.keyFilePath();
    let network = configuration.network();
    let account = configuration.account();

    let password = req.query.password;
    let address = req.query.address;

    try {
        keys.readKey(keyFilePath, password, key => {
            let keySet = keys.readKeySet();
            let client = new kyc.Client(web3, network, account, keySet, publicKey => {
                return secret.ecdhSecret(key, publicKey);
            });

            client.download(address, (error, document) => {
                if (error) {
                    res.status(500).json({ error: error.message });
                } else {
                    res.set('Content-Type', 'application/octet-stream');
                    res.status(200).end(document);
                }
            });
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(8080, function(_) {
    console.log("Waiting at http://localhost:8080/");
});
