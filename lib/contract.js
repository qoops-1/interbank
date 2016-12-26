"use strict";

const KycStorage = function (account, web3, deployment) {
    this.me = account;
    this.contract = web3.eth.contract(deployment.ABI).at(deployment.ADDRESS);
};

KycStorage.prototype.add = function (rights, checksum, callback) {
    let options = {
        from: this.me,
        gas: 100000
    };
    this.contract.add(rights, checksum, options, (error, txid) => {
        let didAddEvent = this.contract.DidAdd({ id: this.me, rights: rights });
        didAddEvent.watch((error, result) => {
            didAddEvent.stopWatching();
            callback(error, txid);
        });
    });
};

KycStorage.prototype.read = function (id, callback) {
    let result = this.contract.get(id);
    let rights = result[0];
    let checksum = result[1];
    callback(rights, checksum);
};

module.exports = {
    KycStorage: KycStorage
};
