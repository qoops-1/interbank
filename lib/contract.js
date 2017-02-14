"use strict";

const Tx = require("ethereumjs-tx")

/**
 * @param {string} account
 * @param {Web3} web3
 * @param {{ABI: *, ADDRESS: *}} deployment
 * @constructor
 */
const KycStorage = function (account, web3, deployment) {
    this.me = '0x' + account.toString('hex')
    this.contract = web3.eth.contract(deployment.ABI).at(deployment.ADDRESS)
    this.web3 = web3
}

KycStorage.prototype.add = function (descriptorSwarmHash, checksum, signTransaction, callback) {
  let call = this.contract.add.getData(descriptorSwarmHash, checksum);
  let nonce = this.web3.eth.getTransactionCount(this.me)
  let rawTransaction = {
    nonce: this.web3.toHex(nonce),
    gasPrice: this.web3.toHex(this.web3.eth.gasPrice),
    gasLimit: this.web3.toHex(100000),
    to: this.contract.address,
    data: call,
    from: this.me
  }
  let tx = new Tx(rawTransaction)
  signTransaction(tx)
  let txHex = '0x' + Buffer.from(tx.serialize()).toString('hex')

  this.web3.eth.sendRawTransaction(txHex, (error, txid) => {
    if (error) {
      callback(error)
    } else {
      let didAddEvent = this.contract.DidAdd({ id: this.me, rights: descriptorSwarmHash });
      didAddEvent.watch(error => {
        didAddEvent.stopWatching();
        callback(error, txid);
      });
    }
  })
};

KycStorage.prototype.read = function (id, callback) {
    let result = this.contract.get(id);
    let rights = result[0];
    let checksum = result[1];
    callback(rights, checksum);
};

KycStorage.prototype.watch = function (address, callback) {
    let didAddEvent = this.contract.DidAdd({id: address });
    didAddEvent.watch((error, result) => {
        callback(error, result, didAddEvent);
    });
};

module.exports = {
    KycStorage: KycStorage
};
