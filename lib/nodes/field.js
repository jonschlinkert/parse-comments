'use strict';

const Expression = require('./expression');
const { isFloatingPoint, isNumber, isString } = require('../utils');

/**
 * Create a field to add to the `fields` array in a `RecordType` node.
 */

class Field {
  constructor(key, value) {
    this.type = 'FieldType';

    if (typeof value === 'string') {
      value = new Expression(value);
    }

    if (typeof key === 'string') {
      this.key = key.trim();
    }

    if (isNumber(this.key)) {
      if (isFloatingPoint(this.key)) {
        this.key = String(parseFloat(this.key));
      } else {
        this.key = String(parseInt(this.key, 16));
      }
    }

    if (!isString(value)) {
      this.value = value;
    }
  }
}

module.exports = Field;
