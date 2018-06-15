'use strict';

const floatingPointRegex = require('floating-point-regex');
const typeOf = require('kind-of');

/**
 * Define a non-enumerable property on an object
 */

exports.define = (obj, key, value) => {
  Reflect.defineProperty(obj, key, {
    enumerable: false,
    configurable: true,
    writable: true,
    value
  });
};

/**
 * Get the last value a string or array.
 * @param {Array|string} `val`
 */

exports.isNumber = val => Number.isFinite(+val);

/**
 * Get the last value a string or array.
 * @param {Array|string} `val`
 */

exports.last = arr => arr[arr.length - 1];

/**
 * Returns true if `val` is a non-empty string
 * @return {Boolean}
 */

exports.isString = val => val && typeof val === 'string';

/**
 * Returns true if `val` is an object
 * @return {Boolean}
 */

exports.isObject = val => typeOf(val) === 'object';

/**
 * Cast `val` to an array
 * @return {Array}
 */

exports.arrayify = function(val) {
  return val ? (Array.isArray(val) ? val : [val]) : [];
};

/**
 * Returns true if the given comment `str` is a protected comment
 * that begins with `!`
 * @return {Boolean}
 */

exports.isProtectedComment = function(str) {
  if (str.charAt(0) === '/') str = str.replace(/^\s*\/\*/, '');
  return str.slice(0, 2) === '*!' || str.charAt(0) === '!';
};

/**
 * Returns true if the given comment `str` is a config comment that contains
 * `eslint`, `global`, `jshint`, `jslint` etc.
 * @return {Boolean}
 */

exports.isConfigComment = function(str, names) {
  return /^\W*(?:[ej]s[hl]int|global)[\s-]*(['"\w])/.test(str);
};

/**
 * Returns true if the given `comment` is a valid block comment. A block comment is
 * valid when it begins with `**` or `*` if `options.allowSingleStar` is true.
 *
 * @param {Objects} comment
 * @param {Objects} options
 * @return {Boolean}
 */

exports.isValidBlockComment = function(comment, options = {}) {
  const regex = options.allowSingleStar ? /^\s*\/\*/ : /^\s*\/\*\*/;
  if (typeof comment === 'string') {
    return regex.test(comment);
  }
  switch (comment.type && comment.type.toLowerCase()) {
    case 'block':
    case 'commentblock':
    case 'blockcomment':
      if (!options.allowSingleStar) {
        return comment.raw.charAt(0) === '*';
      }
      return true;
    default: {
      return false;
    }
  }
};

/**
 * Remove trailing single dot and trim whitespace from `name`
 * @param {String} `name`
 * @return {String}
 */

exports.clean = name => name.replace(/\.$/, '').trim();

/**
 * Strip leading stars from a code comment
 */

exports.stripStars = function(str) {
  return str.replace(/(?:^(?:\s*\/?\*)?[^\S\n]?|\s*(?:\*\/)?\s*$)/gm, '');
};

exports.isFloatingPoint = function(str) {
  return floatingPointRegex().test(str);
};

exports.unwrap = function(ast) {
  return ast.nodes.slice(1, ast.nodes.length - 1);
};

exports.getNext = function(str, substr, startIndex) {
  var idx = str.search(substr, startIndex);
  if (str.charAt(idx - 1) === '\\') {
    return exports.getNext(str, substr, idx + 1);
  }
  if (idx === -1) {
    idx = str.length;
  }
  return idx;
};

/**
 * Copy properties in the given `node` to normalize `val` and
 * get the value from any getters that might exist, before parsing.
 *
 * @param {Object} `node`
 * @return {Object}
 */

exports.copyNode = function(node) {
  if (!node) return {};
  const newNode = {};

  for (const key of Object.keys(node)) {
    const val = node[key];
    if (key === 'value') {
      newNode.val = val;
    } else {
      newNode[key] = val;
    }
  }
  return newNode;
};
