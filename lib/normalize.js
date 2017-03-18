'use strict';

var define = require('define-property');
var utils = require('./utils');

exports.key = function(tag) {
  if (!utils.isObject(tag)) {
    throw new TypeError('expected tag to be an object');
  }

  if (tag._key) {
    return tag._key;
  }

  if (typeof tag.key !== 'string') {
    throw new TypeError('expected tag.key to be a string');
  }

  var name = tag.key.toLowerCase();
  var key = null;

  switch (name) {
    case 'const':
    case 'constant':
      key = 'constant';
      break;

    case 'ctor':
    case 'constructor':
      key = 'ctor';
      break;

    case 'arg':
    case 'argument':
    case 'param':
    case 'parameter':
      key = 'param';
      break;

    case 'prop':
    case 'property':
      key = 'prop';
      break;

    case 'return':
    case 'returns':
      key = 'returns';
      break;

    case 'var':
    case 'variable':
      key = 'variable';
      break;

    default: {
      key = name;
      break;
    }
  }

  define(tag, '_key', key);
  return key;
};
