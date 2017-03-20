'use strict';

var normalize = require('./normalize');
var expects = require('./expects');

exports.name = function(tag) {
  if (expects.name(tag)) {
    return true;
  }

  var key = normalize.key(tag);

  switch (key) {
    case 'augments':
    case 'class':
    case 'const':
    case 'constant':
    case 'ctor':
    case 'constructor':
    case 'function':
    case 'extends':
    case 'member':
    case 'method':
    case 'mixin':
    case 'module':
    case 'name':
    case 'namespace':
    case 'variable':
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
    case 'alias':
    case 'augments':
    case 'class':
    case 'constant':
    case 'ctor':
    case 'extends':
    case 'member':
    case 'mixin':
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
