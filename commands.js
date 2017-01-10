"use strict";

const commander     = require("commander"),
      fs            = require("fs");

const importCommand    = require("./commands/import"),
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

    parser.command("import <path_to_jwk>")
        .description("Import public key of a recipient")
        .action(importCommand);

    parser.command("export <password> <filepath>")
        .description("Export own public key")
        .action(exportCommand);

    parser.parse(args);
};
