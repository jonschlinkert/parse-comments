'use strict';

var define = require('define-property');
var utils = require('../utils');

module.exports = function parseName(tok) {
  if (typeof tok.name !== 'string') {
    return tok;
  }

  var name = tok.name.trim();
  if (name.charAt(0) === '[') {
    if (name.slice(-1) !== ']') {
      return tok;
    }

    if (typeof tok.type === 'string') {
      tok.type = 'OptionalType';
    } else if (utils.isObject(tok.type) && typeof tok.type.type === 'string') {
      tok.type.type = 'OptionalType';
    }

    tok.name = name.slice(1, -1);
  }

  name = name.replace(/^[\W\s]+|[\W\s]+$/g, '');
  tok.name = name;
  return tok;
};
