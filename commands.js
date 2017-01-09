"use strict";

const commander = require("commander"),
      fs        = require("fs");

const addCommand = require("./commands/add");

const PACKAGE = "./package.json";

module.exports = function (args) {
    let packageDescription = JSON.parse(fs.readFileSync(PACKAGE));
    let version = `${packageDescription.name} v${packageDescription.version}`;
    let parser = commander
        .version(version, null);

    parser.command("add <jwk>")
        .description("Add JWK key of a recipient")
        .action(addCommand);

    parser.parse(args);
};
