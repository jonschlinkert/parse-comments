'use strict';

var isNumber = require('is-number');
var Expression = require('./expression');
var utils = require('./utils');

/**
 * Create a field to add to the `fields` array in a `RecordType` node.
 */

module.exports = function Param(name, val) {
  this.type = 'ParameterType';

  if (typeof val === 'string') {
    val = new Expression(val);

    if (val.type === 'OptionalType') {
      var param = new Param(name, val.name || val.val);
      this.type = 'OptionalType';
      this.expression = param;
      return;
    }
  }

  if (typeof name === 'string') {
    this.name = name.trim();
  }

  if (isNumber(this.name)) {
    if (utils.isFloatingPoint(this.name)) {
      this.name = String(parseFloat(this.name));
    } else {
      this.name = String(parseInt(this.name, 16));
    }
  }

  if (!utils.isString(val)) {
    this.expression = val;
  }
};
