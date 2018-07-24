'use strict';

const normalize = require('../normalize');

exports.name = function(tag) {
  switch (normalize.key(tag)) {
    case 'alias':
    case 'api':
    case 'mixes':
    case 'option':
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
    case 'option':
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
