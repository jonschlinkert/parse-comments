'use strict';

var define = require('define-property');

module.exports = function(node, parent) {
  if (node._prefixed) return node;
  parsePrefix(node);
  parseSuffix(node);
  node.name = node.val;
  define(node, '_prefixed', true);
  return node;
};

function parsePrefix(node, parent) {
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
    default: {
      return node;
    }
  }
}

function parseSuffix(node, parent) {
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

