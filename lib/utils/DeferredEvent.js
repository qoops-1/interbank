'use strict';
const util = require('util');
const EventEmitter = require('events').EventEmitter;
const Deferred = require('./Deferred');

module.exports = util.inherits(Deferred, EventEmitter); 