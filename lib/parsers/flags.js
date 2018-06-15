'use strict';

const { define } = require('../utils');

module.exports = function(node, parent) {
  if (node.isPrefixed) return node;
  define(node, 'isPrefixed', true);

  parsePrefix(node);
  parseSuffix(node);

  node.name = node.val;
  return node;
};

function parsePrefix(node, parent) {
  switch (node.val.charAt(0)) {
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
