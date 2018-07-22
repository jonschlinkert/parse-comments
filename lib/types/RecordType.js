'use strict';

const BaseType = require('./BaseType')('fields');

class RecordType extends BaseType {
  constructor(...args) {
    super(...args);
    this.type = 'RecordType';
  }
}

module.exports = RecordType;
