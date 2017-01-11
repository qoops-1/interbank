"use strict";

module.exports = {
    dev: {
        ADDRESS: "0x02ebbc25eed1b91a13a093aa49a105f4da926867",
        ABI: [{"constant":false,"inputs":[],"name":"kill","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"id","type":"address"}],"name":"get","outputs":[{"name":"","type":"bytes32"},{"name":"","type":"bytes32"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"rights","type":"bytes32"},{"name":"checksum","type":"bytes32"}],"name":"add","outputs":[],"payable":false,"type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"id","type":"address"},{"indexed":false,"name":"rights","type":"bytes32"},{"indexed":false,"name":"checksum","type":"bytes32"}],"name":"DidAdd","type":"event"}]
    },
    SEPARATOR: ':$:',
    SEPARATOR_ESCAPED: ':\\$:'
};
