"use strict";

const path    = require("path"),
      homedir = require("homedir"),
      fs      = require("fs");

const BASE_DIR = ".interbank",
      KEYS     = "keys.json",
      FILE     = "config.json";

const environmentConfiguration = {
    cors: {
        origin: '*' || process.env.CORS_ORIGIN,
        methods: 'GET,PUT,POST,DELETE' || process.env.CORS_METHODS,
        allowedHeaders: ['Content-Type']
    }
};

const directory = function () {
    let dir = path.resolve(path.join(homedir(), BASE_DIR));
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir)
    }
    return dir;
};

const keySetFilePath = function () {
    return path.join(directory(), KEYS);
};

/**
 * Read configuration file.
 *
 * @return {{}}
 */
const read = function () {
    let filePath = path.resolve(path.join(directory(), FILE));
    let _read = {};
    if (fs.existsSync(filePath)) {
        _read = JSON.parse(fs.readFileSync(filePath));
    }
    _read = Object.assign(_read, environmentConfiguration);
    return _read;
};

const keyFilePath = function () {
    return process.env.KEY_FILE_PATH;
};

const account = function () {
    if (keyFilePath()) {
        let keyString = fs.readFileSync(keyFilePath());
        let keyJson = JSON.parse(keyString);
        return "0x" + keyJson.address;
    } else {
        return read().account;
    }
};

const network = function () {
    return process.env.ETH_NETWORK || "dev";
};

/**
 * @param {{}} configuration
 */
const write = function (configuration) {
    let filePath = path.join(directory(), FILE);
    let string = JSON.stringify(configuration);
    fs.writeFileSync(filePath, string);
};

const ethHttpAddress = function () {
    let host = process.env.ETH_HOST || "localhost";
    let port = process.env.ETH_PORT || 8545;
    return `http://${host}:${port}`
};

const swarmHost = function () {
    return process.env.SWARM_HOST || "localhost";
};

const swarmPort = function () {
    return process.env.SWARM_PORT || 8500;
};

module.exports = {
    directory: directory(),
    keySetFilePath: keySetFilePath(),
    read: read,
    write: write,
    ethHttpAddress: ethHttpAddress,
    swarmHost: swarmHost,
    swarmPort: swarmPort,
    keyFilePath: keyFilePath,
    account: account,
    network: network
};
