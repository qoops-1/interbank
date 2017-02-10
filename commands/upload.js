"use strict";

const fs            = require("fs"),
      Web3          = require("web3");

const configuration = require("../lib/configuration"),
      keys          = require("../lib/keys"),
      ops          = require("../lib/ops");

module.exports = function (keyFilePath, keyPassword, filePath, options) {
  let network = options.network || "dev";

  let web3 = new Web3(new Web3.providers.HttpProvider(configuration.ethHttpAddress()));

  keys.readKey(keyFilePath, keyPassword, key => {
    let contents = fs.readFileSync(filePath)
    let account = key.public().address()
    ops.uploadOp(web3, network, key, contents, (error, checksum, txid, descriptorUrl) => {
      if (error) {
        throw error
      } else {
        console.log(`Updated KYC card for ${account}`)
        console.log(`Checksum: ${"0x" + checksum.toString("hex")}`)
        console.log(`Txid: ${txid}`)
        console.log(`Descriptor address: ${descriptorUrl}`)
      }
    })
  })
}
