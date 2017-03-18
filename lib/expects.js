'use strict';

var normalize = require('./normalize');

exports.name = function(tag) {
  switch (normalize.key(tag)) {
    case 'alias':
    case 'mixes':
    case 'param':
    case 'prop':
    case 'requires':
    case 'this':
    case 'typedef':
      return true;
    default: {
      return false;
    }
  }
};

exports.type = function(tag) {
  switch (normalize.key(tag)) {
    case 'define':
    case 'enum':
    case 'implements':
    case 'param':
    case 'prop':
    case 'returns':
    case 'this':
    case 'type':
    case 'typedef':
      return true;
    default: {
      return false;
    }
  }
};
