"use strict";

const crypto = require("crypto");

const digest = function (contents) {
    let sha256 = crypto.createHash("sha256");
    sha256.update(contents);
    return sha256.digest("hex");
};

module.exports = {
    digest: digest
};
