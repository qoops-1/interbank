"use strict";

module.exports = {
    dev: {
        ADDRESS: "0x37b89de04d1eea76f8ee3acccd12cb5f71de27e1",
        ABI: [ { "constant": false, "inputs": [], "name": "kill", "outputs": [], "payable": false, "type": "function" }, { "constant": true, "inputs": [ { "name": "id", "type": "address" } ], "name": "get", "outputs": [ { "name": "", "type": "bytes32", "value": "0x0000000000000000000000000000000000000000000000000000000000000000" }, { "name": "", "type": "bytes32", "value": "0x0000000000000000000000000000000000000000000000000000000000000000" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "rights", "type": "bytes32" }, { "name": "checksum", "type": "bytes32" } ], "name": "add", "outputs": [], "payable": false, "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "id", "type": "address" }, { "indexed": false, "name": "rights", "type": "bytes32" }, { "indexed": false, "name": "checksum", "type": "bytes32" } ], "name": "DidAdd", "type": "event" } ]
    },
    mc: {
        ADDRESS: "0x37b89de04d1eea76f8ee3acccd12cb5f71de27e1",
        ABI: [ { "constant": false, "inputs": [], "name": "kill", "outputs": [], "payable": false, "type": "function" }, { "constant": true, "inputs": [ { "name": "id", "type": "address" } ], "name": "get", "outputs": [ { "name": "", "type": "bytes32", "value": "0x0000000000000000000000000000000000000000000000000000000000000000" }, { "name": "", "type": "bytes32", "value": "0x0000000000000000000000000000000000000000000000000000000000000000" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "rights", "type": "bytes32" }, { "name": "checksum", "type": "bytes32" } ], "name": "add", "outputs": [], "payable": false, "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "id", "type": "address" }, { "indexed": false, "name": "rights", "type": "bytes32" }, { "indexed": false, "name": "checksum", "type": "bytes32" } ], "name": "DidAdd", "type": "event" } ]
    },
    prod: {
        ADDRESS: "0x37b89de04d1eea76f8ee3acccd12cb5f71de27e1",
        ABI: [ { "constant": false, "inputs": [], "name": "kill", "outputs": [], "payable": false, "type": "function" }, { "constant": true, "inputs": [ { "name": "id", "type": "address" } ], "name": "get", "outputs": [ { "name": "", "type": "bytes32", "value": "0x0000000000000000000000000000000000000000000000000000000000000000" }, { "name": "", "type": "bytes32", "value": "0x0000000000000000000000000000000000000000000000000000000000000000" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "rights", "type": "bytes32" }, { "name": "checksum", "type": "bytes32" } ], "name": "add", "outputs": [], "payable": false, "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "id", "type": "address" }, { "indexed": false, "name": "rights", "type": "bytes32" }, { "indexed": false, "name": "checksum", "type": "bytes32" } ], "name": "DidAdd", "type": "event" } ]
    },
    SEPARATOR: ':$:',
    SEPARATOR_ESCAPED: ':\\$:'
};
