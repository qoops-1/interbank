"use strict";

const fs = require("fs"),
  path = require("path"),
  wallet = require('ethereumjs-wallet');

const Deferred = require('./utils/Deferred');

const configuration = require("./configuration"),
  secret = require("./secret");

/**
 * Promisified readFile
 * 
 * @param {string} filePath
 * @return {Promise}
 */
const readFile = (filePath) => {
  let deferred = new Deferred();
  fs.readFile(filePath, (error, data) => {
    if (error) {
      deferred.reject(error);
    }
    deferred.resolve(data)
  });
  return deferred.promise;
}

/**
 * @return {KeySet}
 */
const readKeySet = function () {
  let keySetFilePath = configuration.keySetFilePath;
  let keySet = new secret.KeySet();
  try {
    let jwk = JSON.parse(fs.readFileSync(keySetFilePath));
    keySet = secret.KeySet.fromJWK(jwk);
  } catch (e) {
    // Do Nothing
  }
  return keySet;
};

const readKeySetAsync = () => {
  let keySetFilePath = configuration.keySetFilePath;
  let keySet = new secret.KeySet();
  return readFile(keySetFilePath)
    .then(data => {
      let jwk = JSON.parse(data.toString('utf8'));
      return secret.KeySet.fromJWK(jwk);
    })
}

/**
 * @param {KeySet} keySet
 */
const writeKeySet = function (keySet) {
  let keySetFilePath = configuration.keySetFilePath;

  let jwk = keySet.jwk();
  let jwkString = JSON.stringify(jwk);
  fs.writeFileSync(keySetFilePath, jwkString);
};

/**
 * Read an Ethereum V3 key.
 *
 * @param {string} filePath
 * @param {string} password
 * @param {function(Key)} callback
 */
const readKey = function (filePath, password, callback) {
  let inputString = fs.readFileSync(path.resolve(filePath));
  let key = wallet.fromV3(JSON.parse(inputString), password);
  let privateKey = new secret.Key(key.getPrivateKey());
  callback(privateKey);
};

/**
 * Read an Ethereum V3 key.
 *
 * @param {string} filePath
 * @param {string} password
 * @return {Promise}
 */
const readKeyAsync = (filePath, password) => {
  return readFile(path.resolve(filePath))
    .then(data => {
      let str = data.toString('utf8');
      let json = JSON.parse(str);
      let key = wallet.fromV3(json, password);
      return new secret.Key(key.getPrivateKey());
    });
}

module.exports = {
  readKeySet: readKeySet,
  readKeySetAsync: readKeySetAsync,
  writeKeySet: writeKeySet,
  readKey: readKey,
  readKeyAsync: readKeyAsync
};
