"use strict";

const cors   = require("cors");
const unless = require("express-unless");
const jwt    = require("express-jwt");
const redis  = require('./redis');
const env    = require('./env');

function getToken(req){
  return req.headers['x-access-token'] || null;
}

function jwtMiddleware(){
  let func = function(req, res, next){
    let token = getToken(req);
    let ip    = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if(!!!token){
      return next(new Error("token not found"));
    }
    let rId = `${env.session.prefix}:${token}`;
    redis.get(rId, function(err, reply){
      if(err){
        return next(new Error(err));
      }
      if(!!!reply){
        return next(new Error("token doesn't exists"))
      }
      var data = JSON.parse(reply);
      if(data.token!==token || data.ip!==ip){
        return next(new Error("token doesn't exists"))
      }
      req.user = data;
      next();
    });
  }
  func.unless = require("express-unless");
  return func;
};

module.exports = (app) => {
    if (process.env.CORS_ORIGIN) {
        let corsOptions = {
            origin: process.env.CORS_ORIGIN,
            methods: process.env.CORS_METHODS || 'GET,PUT,POST,DELETE',
            allowedHeaders: ['Content-Type', 'x-access-token']
        };
        app.use(cors(corsOptions));
    }
    let jwtCheck = jwt({
      secret: env.session.secret,
      getToken: getToken
    });
    jwtCheck.unless = unless;   
    app.use(jwtCheck.unless({path: '/signin' }));
    app.use(jwtMiddleware().unless({path: '/signin' }));
};
