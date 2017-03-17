#!/usr/bin/env node

"use strict";

const fs = require("fs"),
  path = require("path"),
  commander = require("commander"),
  Web3 = require("web3"),
  express = require("express"),
  bodyParser = require('body-parser'),
  wallet = require('ethereumjs-wallet'),
  multer = require("multer"),
  cors = require("cors"),
  http = require("http"),
  crypto = require("crypto"),
  jsonwebtoken = require("jsonwebtoken"),
  socketIo = require("socket.io"),
  async = require("async");

const contract = require("./lib/contract"),
  configuration = require("./lib/configuration"),
  literals = require("./lib/literals"),
  keys = require("./lib/keys"),
  kyc = require("./lib/kyc"),
  secret = require("./lib/secret"),
  ops = require("./lib/ops"),
  env = require("./config/env"),
  redis = require("./config/redis");

const web3 = new Web3(new Web3.providers.HttpProvider(configuration.ethHttpAddress()));
const app = express();
const server = http.Server(app);
const io = socketIo(server);
const upload = multer();

require("./config/express")(app);
require("./config/socket")(io, app);

app.post("/import", bodyParser.text(), (req, res) => {
  ops.importOpAsync(req.body)
    .then(
    () => res.status(201).end()
    )
    .catch(
    err => res.status(500).json({ error: err.message })
    );
});

app.get("/remove", (req, res) => {
  ops.removeOpAsync(req.query.kid)
    .then(
    () => res.status(201).end()
    )
    .catch(
    err => res.status(500).json({ error: err.message })
    );
})

app.get("/list", (req, res) => {
  keys.readKeySetAsync()
    .then(
    keySet => res.status(200).json(keySet.jwk())
    )
    .catch(
    err => res.status(500).json({ error: err.message })
    )
});

app.get("/export", (req, res) => {
  let keyFilePath = configuration.keyFilePath();
  let password = req.query.password;

  ops.exportOpAsync(keyFilePath, password)
    .then(
    jwk => res.status(200).json(jwk)
    )
    .catch(
    err => res.status(500).json({ error: err.message })
    );
});

app.post("/upload", upload.single('file'), (req, res) => {
  let keyFilePath = configuration.keyFilePath();
  let network = configuration.network();
  let password = req.body.password;
  let file = req.file;
  let jwk;
  keys.readKeyAsync(keyFilePath, password)
    .then(key => {
      jwk = key.public().jwk();
      io.emit('kycCard:update:start', jwk);
      let contents = file.buffer;
      return ops.uploadOpAsync(web3, network, key, contents)
    })
    .then(data => {
      let { checksum, txid, descriptorUrl, jwk } = data;
      let checksumHex = checksum.toString("hex");
      io.emit('kycCard:update:done', {
        jwk: jwk,
        checksum: `0x${checksumHex}`
      });
    })
    .catch(error => {
      console.log(error)
      io.emit('kycCard:update:fail', {
        message: error.message,
        jwk: jwk
      });
    });
  res.status(200).json({ code: 200, isFileSyncStarted: true });
});

app.get("/card/version", (req, res) => {
  let keyFilePath = configuration.keyFilePath();
  let network = configuration.network();
  let account = configuration.account();

  let password = req.query.password;
  let address = req.query.address;
  keys.readKeyAsync(keyFilePath, password)
    .then(key => {
      let keySet = keys.readKeySet();
      let client = new kyc.Client(web3, network, account, keySet, publicKey => {
        return secret.ecdhSecret(key, publicKey);
      });
      return client.getSwarmHash(address)
    })
    .then(version => {
      res.status(200).json({ version })
    })
    .catch(err => {
      console.log(err);
      res.status(404).json({ version: null });
    });
});

app.get("/download", (req, res) => {
  let keyFilePath = configuration.keyFilePath();
  let network = configuration.network();
  let account = configuration.account();

  let password = req.query.password;
  let address = req.query.address;

  keys.readKeyAsync(keyFilePath, password)
    .then(key => {
      let keySet = keys.readKeySet();
      let client = new kyc.Client(web3, network, account, keySet, publicKey => {
        return secret.ecdhSecret(key, publicKey);
      });
      res.set('Content-Type', 'application/octet-stream');
      return client.downloadStream(address)
        .pipe(res)
        .once('error', (error) => {
          console.log(error);
          res.status(500).end();
        })
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err.message });
    });
});

app.post("/signin", bodyParser.urlencoded({ extended: false }), (req, res) => {
  let { username, password } = req.body;
  let { httpUser, session } = env;
  let hash = crypto.createHash('sha256').update(httpUser.password).digest('hex');
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if (httpUser.username !== username || password !== hash) {
    return res.status(404).end();
  }

  let token = jsonwebtoken.sign({ username }, session.secret, {
    expiresIn: session.ttl
  });
  let data = { ip, username, token };
  let rId = `${session.prefix}:${token}`;
  redis.set(rId, JSON.stringify(data), (err, reply) => {
    if (err || !!!reply) {
      return res.status(500).end();
    }
    redis.expire(rId, session.ttl, (err, reply) => {
      if (err || !!!reply) {
        return res.status(500).end();
      }
      res.status(200).json({
        jwt: token
      });
    });
  });
});

app.get("/signout", (req, res) => {
  let token = req.user.token;
  if (!!token) {
    let rId = `${env.session.prefix}:${token}`;
    redis.expire(rId, 0);
    res.status(200).end();
  }else{
    res.status(404).end();
  }
});

app.all("*", (req, res, next) => {
  next(new Error("not found"));
});

app.use((err, req, res, next) => {
  console.log(err);
  let status = err.status || 500;
  return res.status(status).end();
});

io.on('connection', (socket) => {
});

server.listen(8080, function (_) {
  console.log("Waiting at http://localhost:8080/");
});
