'use strict';

var get = require('get-value');
var isNumber = require('is-number');
var define = require('define-property');
var parseName = require('./parse/name');
var utils = require('./utils');

exports.comment = function(comment, options) {
  if (!utils.isObject(comment)) return;

  if (options && typeof options.comment === 'function') {
    return options.comment(comment);
  }

  if (comment.type === 'block') {
    comment.type = 'BlockComment';
  }
};

exports.tag = function(tag, options) {
  if (!utils.isObject(tag)) return;

  if (tag.name) {
    parseName(tag);
  }

  if (options && typeof options.tag === 'function') {
    return options.tag(tag);
  }

  switch (tag.title) {
    case 'access':
      tag.access = tag.description;
      tag.description = null;
      break;
    case 'readonly':
      tag.readonly = true;
      break;
    case 'kind':
      tag.kind = tag.description;
      tag.description = null;
      break;
    case 'variation':
      tag.variation = isNumber(tag.description)
        ? parseFloat(tag.description, 10)
        : tag.description;

      tag.description = null;
      break;
    case 'this':
      var name = get(tag, 'type.name');
      if (name) {
        tag.name = name;
      }
      break;
    case 'var':
      // console.log(tag)
      break;
    default: {
      break;
    }
  }

  return tag;
};

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

  var name = (tag.key || tag.title).toLowerCase();
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

    case 'fn':
    case 'func':
    case 'function':
      key = 'function';
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
