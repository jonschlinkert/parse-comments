'use strict';

const flags = require('./parsers/flags');
const utils = require('./utils');
const { isNumber, define } = utils;

class Expression {
  constructor(name, type) {
    this.value = name;
    name = name.trim();

    if (name.slice(0, 3) === '...') {
      this.expression = new Expression(name.slice(3));
      this.type = 'RestType';
      define(this, 'name', this.expression.name);
      define(this, 'value', this.value);
      return;
    }

    if (isNumber(name)) {
      this.type = 'NumericLiteralType';
      this.value = name;
      return;
    }

    if (type === 'StringLiteralType') {
      this.type = type;
      this.value = name;
      return;
    }

    switch (name) {
      case 'true':
      case 'false':
        this.type = 'BooleanLiteralType';
        this.value = name === 'true';
        break;
      case '*':
        this.type = 'AllLiteral';
        define(this, 'value', this.value);
        break;
      case '!':
        this.type = 'NonNullableLiteral';
        define(this, 'value', this.value);
        break;
      case '?':
        this.type = 'NullableLiteral';
        define(this, 'value', this.value);
        break;
      default: {
        this.type = 'NameExpression';
        this.name = name ? utils.clean(name) : null;
        define(this, 'value', this.name);
        let tok = flags(this);
        let hasType = ['OptionalType', 'NullableType', 'NonNullableType'].includes(tok.type);
        if (tok.value !== this.name || hasType) {
          this.name = tok.value;
          if (tok.type === 'OptionalType') delete this.prefix;
          if (hasType) delete this.name;
          this.expression = new Expression(tok.value);
        }
        break;
      }
    }
  }
}

module.exports = Expression;
