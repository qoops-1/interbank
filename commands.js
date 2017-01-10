"use strict";

const commander     = require("commander"),
      fs            = require("fs");

const addCommand    = require("./commands/add"),
      setupCommand  = require("./commands/setup"),
      exportCommand = require("./commands/export");

const PACKAGE = "./package.json";

module.exports = function (args) {
    let packageDescription = JSON.parse(fs.readFileSync(PACKAGE));
    let version = `${packageDescription.name} v${packageDescription.version}`;
    let parser = commander
        .version(version, null);

    parser.command("setup")
        .description("Set configuration")
        .action(setupCommand);

    parser.command("add <path_to_jwk>")
        .description("Add JWK key of a recipient")
        .action(addCommand);

    parser.command("export <password> <filepath>")
        .description("Export own public key")
        .action(exportCommand);

    parser.parse(args);
};
