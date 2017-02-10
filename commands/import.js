"use strict";

const fs    = require("fs");

const ops   = require("../lib/ops");

module.exports = (filePath) => {
    let jsonString = JSON.parse(fs.readFileSync(filePath));
    ops.importOp(jsonString);
};
