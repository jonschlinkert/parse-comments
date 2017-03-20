'use strict';

var isNumber = require('is-number');
var Expression = require('./expression');
var utils = require('./utils');

/**
 * Create a field to add to the `fields` array in a `RecordType` node.
 */

module.exports = function Field(key, val) {
  this.type = 'FieldType';

  if (typeof val === 'string') {
    val = new Expression(val);
  }

  if (typeof key === 'string') {
    this.key = key.trim();
  }

  if (isNumber(this.key)) {
    if (utils.isFloatingPoint(this.key)) {
      this.key = String(parseFloat(this.key));
    } else {
      this.key = String(parseInt(this.key, 16));
    }
  }

  if (!utils.isString(val)) {
    this.value = val;
  }
};
