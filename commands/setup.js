"use strict";

const prompt        = require("prompt");

const configuration = require("../lib/configuration");

module.exports = function () {
    let config = configuration.read();

    prompt.message = null;
    prompt.colors = false;
    prompt.start();

    console.log("Please, type a path to datadir of your Masterchain installation below");
    prompt.get("datadir", (err, result) => {
        if (err) throw err;
        let datadir = result.datadir;
        console.log("Please, type your Masterchain account below");
        prompt.get("account", (err, result) => {
           if (err) throw err;
           let account = result.account;
           config.account = account;
           config.datadir = datadir;
           configuration.write(config);
           console.log("Thanks. This is your configuration file:");
           console.log(config);
        });
    });
};
