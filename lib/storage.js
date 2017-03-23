"use strict";

const http = require("http"),
      PassThrough = require("stream").PassThrough,
      configuration = require("./configuration");

let secret = require("./secret")

const Swarm = function (_host, _port) {
    this.host = _host || configuration.swarmHost();
    this.port = _port || configuration.swarmPort();
};

Swarm.prototype.upload = function (content, callback) {
  let options = {
      host: this.host,
      port: this.port,
      path: "/bzzr:/",
      method: "POST",
      headers: {
          "Content-Length": Buffer.byteLength(content)
      }
  };

  let request = http.request(options, function (res) {
      res.setEncoding('binary');
      let hash = "";
      res.on("data", (chunk) => {
          hash += chunk;
      });
      res.on("end", () => {
          callback(hash);
      });
  });

  request.write(content);
  request.end();
};

Swarm.prototype.download = function (hash, callback) {
    let _hash = hash.replace("0x", "");
    let options = {
        host: this.host,
        port: this.port,
        path: "/bzzr:/" + _hash,
        method: "GET"
    };
    let request = http.request(options, function (res) {
        let content = Buffer.from([]);
        res.on("data", (chunk) => {
            content = Buffer.concat([content, Buffer.from(chunk)])
        });
        res.on("end", () => {
            callback(content);
        });
    });
    request.end();
};

Swarm.prototype.downloadStream = function (hash) {
    let _hash     = hash.replace("0x", "");
    let stream = new PassThrough();
    let options = {
        host: this.host,
        port: this.port,
        path: "/bzzr:/" + _hash,
        method: "GET"
    };
    let request = http.request(options, res => res.pipe(stream) );
    request.end();
    return stream;
}

module.exports = {
    Swarm: Swarm
};
