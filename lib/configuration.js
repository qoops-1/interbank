"use strict";

const path    = require("path"),
      homedir = require("homedir"),
      fs      = require("fs");

const BASE_DIR = ".interbank",
      KEYS     = "keys.json";

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

module.exports = {
    directory: directory(),
    keySetFilePath: keySetFilePath()
};
