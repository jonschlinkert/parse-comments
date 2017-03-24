'use strict';

var extend = require('extend-shallow');
var define = require('define-property');
var utils = require('../utils');

var delimiters = {
  '`': '`',
  '<': '>',
  '{': '}',
  '[': ']',
  '(': ')',
  '@': ' ',
  ' ': ' '
};

function split(tok, options) {
  if (typeof tok === 'string') {
    tok = { raw: tok };
  }

  options = options || {};
  var input = tok.raw;
  var tag = {key: '', rawType: '', name: '', description: ''};
  var prop = '';
  var segs = [];

  if (tok.key) {
    define(tag, 'key', tok.key);
    tag.title = tok.key;
  }

  function splitString(str) {
    str = str.trim();

    var open = str.charAt(0);
    var close = delimiters[open];
    var stack = [];
    var parts = [];
    var substr = '';

    var len = str.length;
    var idx = -1;

    if (isBracket(open)) {
      stack.push(open);
      substr += str[++idx];

      while (++idx < len && stack.length) {
        var ch = str[idx];
        substr += ch;

        if (ch === close) {
          var last = stack.pop();
          if (last !== open) {
            throw new Error('missing "' + open + '"');
          }
        }

        if (ch === open) {
          stack.push(ch);
        }
      }

      if (stack.length) {
        throw new Error('missing "' + open + '"');
      }

      update(parts, substr);
      var rest =  str.slice(idx).trim();

      if (open === '[') {
        if (!tag.name) tag.name = substr;
        return parts.concat(splitString(rest));
      }

      if (open === '{') {
        if (!tag.rawType) tag.rawType = substr;
        return parts.concat(splitString(rest));
      }

      if (rest) {
        parts.push(rest);
      }

      return parts;
    }

    if (open === '`') {
      substr += str[++idx];

      while (++idx < len) {
        var ch = str[idx];
        substr += ch;
        if (ch === close) {
          ++idx;
          break;
        }
      }

      var rest = str.slice(idx);
      if (!tag.name) {
        tag.name = substr;
        tag.description = rest;
      }

      update(parts, substr);
      parts.push(rest);
      return parts;
    }

    var nextIdx = utils.getNext(str, /\s/);
    var substr = str.slice(0, nextIdx);
    var rest = str.slice(nextIdx).trim();

    if (open === '@' && !parts.length) {
      tag.key = substr;
      parts.push(tag.key);

      if (tag.key === '@example') {
        parts.push(rest);
        tag = extend({}, tok, tag);
        tag.description = tok.description;
        return parts;
      }
      return parts.concat(splitString(rest));
    }

    if (!tag.name) {
      tag.name = substr.trim();
      tag.description = rest;

    } else if (!tag.description) {
      tag.description = str;
    }

    parts.push(rest);
    return parts;
  }

  define(tag, 'tokens', splitString(input));
  tag.description = tag.description.trim();

  if (tag.description.slice(-2) === '}}') {
    tag.description = tag.description.slice(0, -2);
  }

  if (tag.description) {
    tag.description = tag.description.replace(/^ *- */, '');
  }

  tag.name = tag.name.trim();
  define(tag, 'isTag', true);
  return tag;
}

function isBracket(ch) {
  return ch === '[' || ch === '{' || ch === '{' || ch === '<';
}

function update(arr, str) {
  if (!arr.length) arr.push('');
  arr[arr.length - 1] += str;
}

/**
 * Expose `tokenizeTag`
 */

module.exports = split;
