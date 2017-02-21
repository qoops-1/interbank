'use strict';

module.exports = class Deferred {

  constructor(){
    let executor = (resolve, reject) => { 
      this.resolve = resolve;
      this.reject  = reject;
    }
    this.promise = new Promise(executor)
  }

}