"use strict";

const secret = require("./secret"),
  keys = require("./keys"),
  kyc = require("./kyc"),
  Deferred = require('./utils/Deferred');

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
  return keys.writeKeySet(keySet)
}

/**
 * @param {object, string} jsonString
 */
const importOpAsync = (jsonString) => {
  let jwk = jsonString
  if (typeof jsonString == 'string') {
    jwk = JSON.parse(jsonString);
  }
  let publicKey = secret.PublicKey.fromJWK(jwk);
  return keys.readKeySetAsync()
    .then(keySet => {
      keySet.add(publicKey);
      return keys.writeKeySet(keySet); 
    });
}

/**
 * @param {string} kid
 */
const removeOp = (kid) => {
  let keySet = keys.readKeySet()
  keySet.remove(kid)
  keys.writeKeySet(keySet)
};

/**
 * @param {string} kid
 */
const removeOpAsync = (kid) => {
  let keySet = keys.readKeySet()
  keySet.remove(kid)
  return keys.writeKeySetAsync(keySet)
};

const exportOp = (keyFilePath, password, callback) => {
  keys.readKey(keyFilePath, password, key => {
    let jwk = key.public().jwk()
    callback(jwk)
  });
};

const exportOpAsync = (keyFilePath, password) => {
  return keys.readKeyAsync(keyFilePath, password)
    .then( key => key.public().jwk() );
};

const uploadOp = (web3, network, key, contents, callback) => {
  let keySet = keys.readKeySet()
  let account = key.public().address()

  let genSecret = publicKey => { return secret.ecdhSecret(key, publicKey) }
  let signTransaction = tx => { tx.sign(key.buffer()) }

  let client = new kyc.Client(web3, network, account, keySet, genSecret)

  client.upload(contents, signTransaction, (error, checksum, txid, descriptorUrl) => {
    callback(error, checksum, txid, descriptorUrl, key.public().jwk())
  })
}

const uploadOpAsync = (web3, network, key, contents) => {
  let account = key.public().address();
  let jwk     = key.public().jwk();
  let genSecret = publicKey => { 
    return secret.ecdhSecret(key, publicKey) 
  };
  let signTransaction = tx => {
    tx.sign(key.buffer());
  };
  return keys.readKeySetAsync()
    .then(keySet => {
      let client = new kyc.Client(web3, network, account, keySet, genSecret);
      return client.uploadAsync(contents, signTransaction)
        .then(data => {
          data.jwk = jwk;
          data.descriptorUrl = data.bzzrAddress;
          return data;
        });
    });
}

module.exports = {
  importOp: importOp,
  importOpAsync: importOpAsync,
  exportOp: exportOp,
  exportOpAsync: exportOpAsync,
  uploadOp: uploadOp,
  uploadOpAsync: uploadOpAsync,
  removeOp: removeOp,
  removeOpAsync: removeOpAsync
}
