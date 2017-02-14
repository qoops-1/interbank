"use strict";

const secret    = require("./secret"),
      keys      = require("./keys"),
      kyc       = require("./kyc")

/**
 * @param {object, string} jsonString
 */
const importOp = (jsonString) => {
  let jwk = jsonString
  if (typeof jsonString == 'string') {
    jwk = JSON.parse(jsonString)
  }
  let publicKey = secret.PublicKey.fromJWK(jwk)
  let keySet = keys.readKeySet()
  keySet.add(publicKey)
  keys.writeKeySet(keySet)
};

const exportOp = (keyFilePath, password, callback) => {
  keys.readKey(keyFilePath, password, key => {
    let jwk = key.public().jwk()
    callback(jwk)
  });
};

const uploadOp = (web3, network, key, contents, callback) => {
  let keySet = keys.readKeySet()
  let account = key.public().address()

  let genSecret = publicKey => { return secret.ecdhSecret(key, publicKey) }
  let signTransaction = tx => { tx.sign(key.buffer()) }

  let client = new kyc.Client(web3, network, account, keySet, genSecret)

  client.upload(contents, signTransaction, (checksum, descriptorUrl) => {
    callback(checksum, descriptorUrl, key.public().jwk())
  })
}

module.exports = {
  importOp: importOp,
  exportOp: exportOp,
  uploadOp: uploadOp
}
