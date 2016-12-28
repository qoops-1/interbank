"use strict";

const assert = require("assert"),
      secret = require("../lib/secret"),
      crypto = require("crypto");

describe("secret", () => {
    describe(".digest", () => {
        it("compute SHA256 hash", () => {
            let output = Buffer.from("2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae", "hex");
            assert.deepEqual(output, secret.digest("foo"));
        });
    });

    describe(".PrivateKey", () => {
        it("contains buffer", () => {
            let randomBytes = crypto.randomBytes(32);
            let key = new secret.PrivateKey(randomBytes);
            assert.deepEqual(randomBytes, key.buffer());
        })
    });

    describe(".PublicKey", () => {
        it("contains buffer", () => {
            let randomBytes = crypto.randomBytes(32);
            let key = new secret.PublicKey(randomBytes);
            assert.deepEqual(randomBytes, key.buffer());
        })
    });

    describe(".Key", () => {
        let randomPrivateKey = new secret.PrivateKey(crypto.randomBytes(32));
        let randomPublicKey = secret.derivePublicKey(randomPrivateKey);
        let key = new secret.Key(randomPrivateKey, randomPublicKey);

        describe("#private()", () => {
            it("return private key", () => {
               assert.deepEqual(randomPrivateKey, key.private());
            });
        });

        describe("#public()", () => {
            it("return public key", () => {
                assert.deepEqual(randomPublicKey, key.public());
            });
        });
    });
});
