'use strict';

var normalize = require('./normalize');
var expects = require('./expects');

exports.name = function(tag) {
  if (expects.name(tag)) {
    return true;
  }

  switch (tag.key) {
    case 'const':
    case 'constant':
      return true;
    default: {
      return false;
    }
  }
};

exports.type = function(tag) {
  if (expects.type(tag)) {
    return true;
  }

  switch (normalize.key(tag)) {
    case 'augments':
    case 'class':
    case 'constant':
    case 'ctor':
    case 'extends':
    case 'member':
    case 'module':
    case 'namespace':
    case 'private':
    case 'protected':
    case 'public':
    case 'throws':
    case 'variable':
      return true;
    default: {
      return false;
    }
  }
};

exports.optional = function(tag) {
  switch (normalize.key(tag)) {
    case 'prop':
    case 'param':
      return true;
    default: {
      return false;
    }
  }
};

exports.nested = function(tag) {
  switch (normalize.key(tag)) {
    case 'prop':
    case 'param':
      return true;
    default: {
      return false;
    }
  }
};
