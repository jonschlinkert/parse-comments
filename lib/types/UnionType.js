'use strict';

const BaseType = require('./BaseType')('elements');

class UnionType extends BaseType {
  constructor(...args) {
    super(...args);
    this.type = 'UnionType';
  }
}

module.exports = UnionType;
