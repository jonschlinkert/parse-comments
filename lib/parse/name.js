'use strict';

var define = require('define-property');

module.exports = function parseName(tok) {
  if (typeof tok.name !== 'string') {
    return tok;
  }

  var name = tok.name.trim();
  if (name.charAt(0) === '[') {
    if (name.slice(-1) !== ']') {
      return tok;
    }

    // tok.name = name.slice(1, -1);
    // tok.types = tok.type;
    // tok.type = 'OptionalType';
  }

  return tok;
};
