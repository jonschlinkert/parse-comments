'use strict';

const BaseType = require('./BaseType')('params');

class FunctionType extends BaseType {
  constructor(...args) {
    super(...args);
    this.type = 'FunctionType';
  }
}

module.exports = FunctionType;
