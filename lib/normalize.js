'use strict';

const normalize = module.exports;
const parseName = require('./parsers/name');
const allows = require('./allows');
const utils = require('./utils');
const { isNumber, define, get } = utils;

/**
 * Normalize tag name
 */

normalize.name = function(tag) {
  if (!allows.name(tag) && tag.name) {
    tag.description = (tag.name.trim() + ' ' + tag.description).trim();
    tag.name = '';
  }
};

/**
 * Normalize tag.key
 */

normalize.key = function(tag) {
  if (!utils.isObject(tag)) {
    throw new TypeError('expected tag to be an object');
  }

  if (tag._key) {
    return tag._key;
  }

  let title = tag.key || tag.title;
  if (!utils.isString(title)) {
    throw new TypeError('expected either tag.key or tag.title to a string');
  }

  title = title.toLowerCase();
  if (title.charAt(0) === '@') {
    title = title.slice(1);
  }

  let key = null;
  switch (title) {
    case 'extends':
    case 'augments':
      key = 'augments';
      break;

    case 'const':
    case 'constant':
      key = 'constant';
      break;

    case 'class':
    case 'ctor':
    case 'constructor':
      key = 'class';
      break;

    case 'file':
    case 'fileoverview':
    case 'overview':
      key = 'file';
      break;

    case 'host':
    case 'external':
      key = 'external';
      break;

    case 'emits':
    case 'fires':
      key = 'emits';
      break;

    case 'exception':
    case 'throws':
      key = 'throws';
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

    case 'member':
    case 'variable':
    case 'var':
      key = 'variable';
      break;

    case 'linkcode':
    case 'link':
      key = 'link';
      break;

    case 'desc':
    case 'description':
      key = 'description';
      break;

    case 'default':
    case 'defaultvalue':
      key = 'default';
      break;

    case 'virtual':
    case 'abstract':
      key = 'abstract';
      break;

    default: {
      key = title;
      break;
    }
  }

  define(tag, '_key', key);
  tag.key = key;
  return key;
};

normalize.title = function(tag) {
  let title = tag.title || tag.key;
  if (title && title.charAt(0) === '@') {
    title = title.slice(1);
  }
  tag.title = title;
  return title;
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

normalize.tag = function(tag, options = {}) {
  if (!utils.isObject(tag)) return;
  let name, desc;

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
    case 'interface':
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
      desc = tag.description.trim();
      tag.variation = isNumber(desc)
        ? parseFloat(desc, 10)
        : desc;

      tag.description = null;
      break;
    case 'this':
      name = get(tag, 'type.name');
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

normalize.examples = function(comment, options = {}) {
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
