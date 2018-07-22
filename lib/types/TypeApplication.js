'use strict';

const BaseType = require('./BaseType')('applications');

class TypeApplication extends BaseType {
  constructor(...args) {
    super(...args);
    this.type = 'TypeApplication';
  }
}

module.exports = TypeApplication;
