"use strict";

const http = require("http");

const Swarm = function (_host, _port) {
    this.host = _host || "localhost";
    this.port = _port || 8500
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
      res.setEncoding("utf8");
      let hash = "";
      res.on("data", (chunk) => {
          hash += chunk;
      });
      res.on("end", () => {
          callback(hash);
      });
  });

  request.end(content);
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
        res.setEncoding("utf8");
        let content = "";
        res.on("data", (chunk) => {
            content += chunk;
        });
        res.on("end", () => {
            callback(content);
        });
    });
    request.end();
};

module.exports = {
    Swarm: Swarm
};
