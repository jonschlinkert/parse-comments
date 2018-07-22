'use strict';

const Expression = require('../nodes/expression');
const utils = require('../utils');

module.exports = (tok, options = {}) => {
  if (typeof tok === 'string') {
    tok = { type: 'NameExpression', name: tok };
  }

  if (typeof tok.name !== 'string') {
    return tok;
  }

  let name = tok.name.trim();
  let isOptional = false;

  if (name.charAt(0) === '[') {
    if (options.strict === true || name.slice(-1) !== ']') {
      tok.invalid = true;
      return tok;
    }

    isOptional = true;
    name = name.slice(1, -1);
  }

  if (name.charAt(0) === '`') {
    if (name.slice(-1) !== '`') {
      return tok;
    }
    name = name.slice(1, -1).trim();
  }

  const args = name.split(/ *= */);
  if (args.length > 1) {
    tok.default = args[1].trim();
    tok.name = args[0].trim();
  } else {
    tok.name = name;
  }

  if (isOptional && typeof tok.type === 'string') {
    tok = { type: 'OptionalType', expression: new Expression(tok.name) };

  } else if (utils.isObject(tok.type) && typeof tok.type.type === 'string') {
    if (tok.type.type === 'OptionalType') {
      return tok;
    }

    if (isOptional) {
      tok.type = { type: 'OptionalType', expression: tok.type };
    }
  }
  return tok;
};
