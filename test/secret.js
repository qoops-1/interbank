"use strict";

const assert = require("assert"),
      secret = require("../lib/secret"),
      crypto = require("crypto"),
      mocha  = require("mocha");

const base64url = require("base64url");

const describe = mocha.describe,
      it       = mocha.it;

describe("secret", () => {
    let bytes = Buffer.from("0a3043ad9513ca10392687903506c6a716ddaaee3e76a675ad8952d3838367bf", "hex");
    let privateKey = new secret.Key(bytes);
    let publicKey = secret.derivePublicKey(privateKey);

    describe(".Key", () => {
        specify("#buffer", () => {
            assert.deepEqual(bytes, privateKey.buffer());
        });

        describe("#public()", () => {
            it("return public key", () => {
                assert.deepEqual(privateKey.public(), publicKey);
            });
        });

        describe("#jwk()", () => {
            it("return JWK representation", () => {
                let jwk = privateKey.jwk();
                assert.equal(jwk.kty, "EC");
                assert.equal(jwk.crv, "secp256k1");
                assert.equal(jwk.kid, publicKey.address().toString("hex"));
            });
        });

        describe(".fromJWK", () => {
           it("builds Key", () => {
               let jwk = privateKey.jwk();
               let rebuilt = secret.Key.fromJWK(jwk);
               assert(rebuilt instanceof secret.Key);
               assert.deepEqual(privateKey.buffer(), rebuilt.buffer());
           });
        });
    });

    describe(".PublicKey", () => {
        specify("#buffer()", () => {
            assert(publicKey.buffer() instanceof Buffer)
        });

        describe("#point()", () => {
            it("returns EC point", () => {
                assert.notEqual(publicKey.point().x, null);
                assert.notEqual(publicKey.point().y, null);
            })
        });

        describe("#address()", () => {
            it("return Ethereum address", () => {
                let expected = Buffer.from("0b1ffdc070d46592bdcf8e7e7a470c8d34993baf", "hex");
                assert.deepEqual(publicKey.address(), expected);
            });
        });

        describe("#jwk()", () => {
            it("return JWK representation", () => {
                let jwk = publicKey.jwk();
                assert.equal(jwk.kty, "EC");
                assert.equal(jwk.crv, "secp256k1");
                assert.equal(jwk.kid, publicKey.address().toString("hex"));
            });
        });

        describe(".fromJWK()", () => {
            it("builds PublicKey", () => {
                let jwk = publicKey.jwk();
                let rebuilt = secret.PublicKey.fromJWK(jwk);
                assert(rebuilt instanceof secret.PublicKey);
                assert.deepEqual(publicKey.buffer(), rebuilt.buffer());
                assert.deepEqual(publicKey.point().x, rebuilt.point().x);
                assert.deepEqual(publicKey.point().y, rebuilt.point().y);
            });
        });
    });

    describe(".KeySet", () => {
        it("store public keys", () => {
            let keySet = new secret.KeySet();
            keySet.add(publicKey);
            let keys = keySet.keys();
            assert(keys instanceof Array);
            assert.equal(publicKey, keys[0]);
        });

        it("store public keys", () => {
            let keySet = new secret.KeySet()
            keySet.add(publicKey)
            keySet.remove(publicKey)
            let keys = keySet.keys();
            assert(keys instanceof Array);
            assert.equal(0, keys.length);

        });

        specify("deduplicate keys", () => {
            let keySet = new secret.KeySet();
            keySet.add(publicKey);
            keySet.add(publicKey);

            let keys = keySet.keys();
            assert(keys instanceof Array);
            assert.equal(1, keys.length);
            assert.equal(publicKey, keys[0]);
        });

        specify("#jwk()", () => {
            let keySet = new secret.KeySet();
            keySet.add(publicKey);
            let jwk = keySet.jwk();
            assert(jwk.keys instanceof Array);
            assert.equal(1, jwk.keys.length);
            let jwkKey = jwk.keys[0];
            assert.deepEqual(publicKey.jwk(), jwkKey);
        });

        describe("#byAddress", () => {
            let keySet = new secret.KeySet();
            keySet.add(publicKey);
            specify("find PublicKey by Buffer address", () => {
                let found = keySet.byAddress(publicKey.address());
                assert.equal(found, publicKey);
            });

            specify("find PublicKey by hex address", () => {
                let addressString = "0x" + publicKey.address().toString("hex");
                let found = keySet.byAddress(addressString);
                assert.equal(found, publicKey);
            });
        });

        specify(".fromJWK()", () => {
            let keySet = new secret.KeySet();
            let rebuilt = secret.KeySet.fromJWK(keySet.jwk());
            assert.deepEqual(keySet, rebuilt);
        });
    });

    describe(".digest", () => {
        it("compute SHA256 hash", () => {
            let output = Buffer.from("2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae", "hex");
            assert.deepEqual(secret.digest("foo"), output);
        });
    });

    describe(".encrypt, .decrypt", () => {
        let password = "p4$$w0rd";

        it("can be decrypted by String password", () => {
           let source = "Lorem ipsum dolor sit amet, consectetur adipiscing elit";
           let encrypted = secret.encrypt(source, password);
           let decrypted = secret.decrypt(encrypted, password);
           assert.equal(source, decrypted);
        });

        it("can be decrypted by Buffer password", () => {
            let source = "Lorem ipsum dolor sit amet, consectetur adipiscing elit";
            let passwordBuffer = Buffer.from(password);

            let encrypted = secret.encrypt(source, password);
            let encryptedB = secret.encrypt(source, passwordBuffer);
            assert.deepEqual(encrypted, encryptedB);

            let decrypted = secret.decrypt(encrypted, passwordBuffer);
            let decryptedB = secret.decrypt(encryptedB, password);
            assert.deepEqual(decrypted, decryptedB);
        });
    });

    describe(".ecdhSecret", () => {
        it("compute ECDH shared secret", () => {
            let otherPrivateKeyBytes = secret.randomBytes(32);
            let otherPrivateKey = new secret.Key(otherPrivateKeyBytes);
            let otherPublicKey = otherPrivateKey.public();

            let aSecret = secret.ecdhSecret(privateKey, otherPublicKey);
            let bSecret = secret.ecdhSecret(otherPrivateKey, publicKey);
            assert.deepEqual(aSecret, bSecret);
        });
    });
});
