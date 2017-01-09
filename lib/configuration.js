"use strict";

const path    = require("path"),
      homedir = require("homedir"),
      fs      = require("fs");

const BASE_DIR = ".interbank",
      KEYS     = "keys.json",
      FILE     = "config.json";

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
    let filePath = path.join(directory(), FILE);
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath));
    } else {
        return {};
    }
};

/**
 * @param {{}} configuration
 */
const write = function (configuration) {
    let filePath = path.join(directory(), FILE);
    let string = JSON.stringify(configuration);
    fs.writeFileSync(filePath, string);
};

module.exports = {
    directory: directory(),
    keySetFilePath: keySetFilePath(),
    read: read,
    write: write
};
