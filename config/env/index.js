"use strict";

const path = require('path');
const fs   = require('fs');

const DefaultConfig = require('./default');

const envFile     = path.resolve(__dirname, '../../env.json');
const configFile  = path.resolve(__dirname, '../../config.json');

const getJsonSync = path => {
  if (!fs.existsSync(path)) {
    return {};
  }
  let data = fs.readFileSync(path, 'utf-8');
  data = data.trim();
  if(!data){
    return {}
  }
  let json = JSON.parse(data);
  return json;
};

Object.assign(process.env, getJsonSync(envFile));

const CustomConfig = getJsonSync(configFile);

module.exports = Object.assign({}, DefaultConfig, CustomConfig);