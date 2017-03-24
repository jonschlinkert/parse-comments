'use strict';

var get = require('get-value');
var isNumber = require('is-number');
var define = require('define-property');
var parseName = require('./parse/name');
var allows = require('./allows');
var utils = require('./utils');
var normalize = module.exports;

normalize.key = function(tag) {
  if (!utils.isObject(tag)) {
    throw new TypeError('expected tag to be an object');
  }

  if (tag._key) {
    return tag._key;
  }

  var name = tag.key || tag.title;
  if (!utils.isString(name)) {
    throw new TypeError('expected either tag.key or tag.title to a string');
  }

  name = name.toLowerCase();
  if (name.charAt(0) === '@') {
    name = name.slice(1);
  }

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

normalize.comment = function(comment, options) {
  if (!utils.isObject(comment)) return;

  if (options && typeof options.comment === 'function') {
    return options.comment(comment);
  }

  if (comment.type === 'block') {
    comment.type = 'BlockComment';
  }
};

normalize.tag = function(tag, options) {
  if (!utils.isObject(tag)) return;

  if (tag.name) {
    parseName(tag, options);
    if (tag.invalid) {
      return;
    }
  }

  if (options && typeof options.tag === 'function') {
    return options.tag(tag);
  }

  // normalize name
  normalize.name(tag);

  switch (tag.title) {
    case 'access':
      tag.access = tag.description;
      tag.description = null;
      break;
    case 'readonly':
      tag.readonly = true;
      break;
    case 'kind':
      tag.kind = tag.description.trim();
      tag.description = null;
      break;
    case 'variation':
      var desc = tag.description.trim();
      tag.variation = isNumber(desc)
        ? parseFloat(desc, 10)
        : desc;

      tag.description = null;
      break;
    case 'this':
      var name = get(tag, 'type.name');
      if (name) {
        tag.name = name;
      }
      break;
    case 'variable':
      break;
    default: {
      break;
    }
  }

  return tag;
};

/**
 * Normalize tag name
 */

normalize.examples = function(comment, options) {
  if (options.jsdoc) {
    for (var i = 0; i < comment.examples.length; i++) {
      var example = comment.examples[i];
      if (example.type === 'javadoc') {
        var caption = /<caption>([^<]+)<\/caption>/.exec(example.val);
        if (caption) {
          example.caption = caption[1];
          example.description = example.val.slice(caption[0].length).trim();
        } else {
          example.description = example.val.trim();
        }
        comment.tags.push(example);
        comment.examples.splice(i, 1);
      }
    }
  }
};

/**
 * Normalize tag name
 */

normalize.name = function(tag) {
  if (!allows.name(tag) && tag.name) {
    tag.description = (tag.name.trim() + ' ' + tag.description).trim();
    tag.name = '';
  }
};
