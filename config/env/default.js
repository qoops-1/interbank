"use strict";

module.exports = {
  httpUser: {
    username: "admin",
    password: "admin"
  },
  session: {
    secret: "secret",
    ttl: 24*60*60,
    prefix: "sess"
  }
};