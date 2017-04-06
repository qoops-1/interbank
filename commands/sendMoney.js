"use strict"
const Web3          = require('web3'),
      configuration = require('../lib/configuration'),
      keys          = require('../lib/keys'),
      secret        = require('../lib/secret'),
      kyc           = require('../lib/kyc');

module.exports = function (keyFilePath, keyPassword, amount, bank, options) {
    let web3 = new Web3()
    web3.setProvider(new web3.providers.HttpProvider(configuration.ethHttpAddress()))
    let network = options.network || configuration.network()
    let address = options.address
    keys.readKey(keyFilePath, keyPassword, (key) => {
        let keySet = keys.readKeySet()
        let me = key.public().address()
        let genSecret = publicKey => { 
            return secret.ecdhSecret(key, publicKey) 
        };
        let client = new kyc.Client(web3, network, me, keySet, genSecret);
        client.useCurrentToken(address, key, (error, token) => {
            if (error) {
                console.log("Couldn't perform transfer due to error.")
                console.log(error)
            } else {
                if (!token.address) {
                    console.log("txHash: " + token.transactionHash)
                } else {
                    token.transfer(bank, amount*token.mult)
                    console.log("address: " + token.address)
                }
            }
        })
    })
}