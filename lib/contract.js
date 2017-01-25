"use strict";

/**
 * @param {string} account
 * @param {Web3} web3
 * @param {{ABI: *, ADDRESS: *}} deployment
 * @constructor
 */
const KycStorage = function (account, web3, deployment) {
    this.me = account;
    this.contract = web3.eth.contract(deployment.ABI).at(deployment.ADDRESS);
};

KycStorage.prototype.add = function (descriptorSwarmHash, checksum, callback) {
    let options = {
        from: this.me,
        gas: 100000
    };
    this.contract.add(descriptorSwarmHash, checksum, options, (error, txid) => {
        if (error) {
            callback(error);
        } else {
            let didAddEvent = this.contract.DidAdd({ id: this.me, rights: descriptorSwarmHash });
            didAddEvent.watch((error, result) => {
                didAddEvent.stopWatching();
                callback(error, txid);
            });
        }
    });
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
