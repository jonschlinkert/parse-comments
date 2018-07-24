'use strict';

const Expression = require('./expression');
const { isFloatingPoint, isNumber } = require('../utils');

/**
 * Create a field to add to the `fields` array in a `RecordType` node.
 */

class Field {
  constructor(key, value) {
    this.type = 'FieldType';
    this.key = key;

    if (typeof value === 'string') {
      this.value = new Expression(value);
    } else {
      this.value = value;
    }

    if (isNumber(this.key)) {
      if (isFloatingPoint(this.key)) {
        this.key = String(parseFloat(this.key));
      } else {
        this.key = String(parseInt(this.key, 16));
      }
    }
  }
}

module.exports = Field;
