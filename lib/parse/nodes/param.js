'use strict';

const Expression = require('./expression');
const { isFloatingPoint, isNumber, isString } = require('../utils');

/**
 * Create a param to add to the `params` array in a `FunctionType` node
 * with a RestType argument
 */

class Param {
  constructor(name, value) {
    this.type = 'ParameterType';

    if (typeof value === 'string') {
      value = new Expression(value);

      if (value.type === 'OptionalType') {
        this.type = 'OptionalType';
        this.expression = new Param(name, value.name || value.value);
        return;
      }
    }

    if (typeof name === 'string') {
      this.name = name.trim();
    }

    if (isNumber(this.name)) {
      if (isFloatingPoint(this.name)) {
        this.name = String(parseFloat(this.name));
      } else {
        this.name = String(parseInt(this.name, 16));
      }
    }

    if (!isString(value)) {
      this.expression = value;
    }
  }
}

module.exports = Param;
