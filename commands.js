"use strict";

const commander         = require("commander"),
      fs                = require("fs"),
      path              = require("path");

const importCommand     = require("./commands/import"),
      exportCommand     = require("./commands/export"),
      uploadCommand     = require("./commands/upload"),
      downloadCommand   = require("./commands/download");

/**
 * Read package.json
 *
 * @returns {object}
 */
const readPackageDescription = () => {
    let packagePath = path.resolve(path.join(__dirname, "package.json"));
    return JSON.parse(fs.readFileSync(packagePath));
};

module.exports = function (args) {
    let packageDescription = readPackageDescription();
    let version = `${packageDescription.name} v${packageDescription.version}`;
    let parser = commander
        .version(version, null);

    parser.command("import <file>")
        .description("Import JWK public key of a recipient")
        .action(importCommand);

    parser.command("export <key> <password> <jwk>")
        .description("Export own JWK public key")
        .action(exportCommand);

    parser.command("upload <key> <password> <file>")
        .option("-N, --network [network]", "ethereum network, dev by default")
        .description("Upload KYC card")
        .action(uploadCommand);

    parser.command("download <key> <password> <path_or_folder>")
        .option("-a, --address [address]", "address of the document originator")
        .option("-N, --network [network]", "ethereum network, dev by default")
        .description("Download KYC card")
        .action(downloadCommand);

    parser.parse(args);
};
