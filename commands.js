"use strict";

const commander         = require("commander"),
      fs                = require("fs");

const setupCommand      = require("./commands/setup"),
      importCommand     = require("./commands/import"),
      exportCommand     = require("./commands/export"),
      uploadCommand     = require("./commands/upload"),
      downloadCommand   = require("./commands/download");

const PACKAGE = "./package.json";

module.exports = function (args) {
    let packageDescription = JSON.parse(fs.readFileSync(PACKAGE));
    let version = `${packageDescription.name} v${packageDescription.version}`;
    let parser = commander
        .version(version, null);

    parser.command("setup")
        .description("Set configuration")
        .action(setupCommand);

    parser.command("import <file>")
        .description("Import JWK public key of a recipient")
        .action(importCommand);

    parser.command("export <password> <file>")
        .description("Export own JWK public key")
        .action(exportCommand);

    parser.command("upload <password> <file>")
        .option("-N, --network [network]", "ethereum network, dev by default")
        .description("Upload KYC card")
        .action(uploadCommand);

    parser.command("download <password> <path_or_folder>")
        .option("-a, --address [address]", "address of the document originator")
        .option("-N, --network [network]", "ethereum network, dev by default")
        .description("Download KYC card")
        .action(downloadCommand);

    parser.parse(args);
};
