const assert = require("assert"),
      secret = require("../lib/secret");

describe('secret', function() {
    describe('.digest', function() {
        it('should return -1 when the value is not present', function() {
            let output = Buffer("2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae", "hex");
            assert.deepEqual(output, secret.digest("foo"));
        });
    });
});
