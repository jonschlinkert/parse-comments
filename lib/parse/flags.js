'use strict';

var define = require('define-property');

module.exports = function(node) {
  parsePrefix(node);
  parseSuffix(node);
  return node;
};

function parsePrefix(node) {
  var val = node.name || node.val;
  // var prefix = /[*!?=]|\.{3}/.exec(node.val) || [];

  switch (node.val.charAt(0)) {
    case '*':
      node.type = 'AllLiteral';
      return addPrefix(node);
    case '!':
      node.type = 'NonNullableType';
      return addPrefix(node);
    case '?':
      node.type = 'NullableType';
      return addPrefix(node);
    case '=':
      node.type = 'OptionalType';
      return addPrefix(node);
    case '...':
      node.type = 'RestType';
      return addPrefix(node);
    default: {
      return node;
    }
  }
}

function parseSuffix(node) {
  switch (node.val.slice(-1)) {
    case '*':
      node.type = 'AllLiteral';
      return addSuffix(node);
    case '!':
      node.type = 'NonNullableType';
      return addSuffix(node);
    case '?':
      node.type = 'NullableType';
      return addSuffix(node);
    case '=':
      node.type = 'OptionalType';
      return addSuffix(node);
    default: {
      return node;
    }
  }
}

function addPrefix(node) {
  node.val = node.val.slice(1);
  node.prefix = true;
  return parsePrefix(node);
}

function addSuffix(node) {
  node.val = node.val.slice(0, -1);
  node.prefix = false;
  return parseSuffix(node);
}
