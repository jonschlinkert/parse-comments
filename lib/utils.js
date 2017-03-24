'use strict';

var regex = require('floating-point-regex');
var typeOf = require('kind-of');
var utils = module.exports;

/**
 * Get the last value a string or array.
 * @param {Array|string} `val`
 */

utils.last = function(val) {
  return val[val.length - 1];
};

/**
 * Returns true if `val` is a non-empty string
 * @return {Boolean}
 */

utils.isString = function(val) {
  return val && typeof val === 'string';
};

/**
 * Returns true if `val` is an object
 * @return {Boolean}
 */

utils.isObject = function(val) {
  return typeOf(val) === 'object';
};

/**
 * Cast `val` to an array
 * @return {Array}
 */

utils.arrayify = function(val) {
  return val ? (Array.isArray(val) ? val : [val]) : [];
};

/**
 * Returns true if the given comment `str` is a protected comment
 * that begins with `!`
 * @return {Boolean}
 */

utils.isProtectedComment = function(str) {
  if (str.charAt(0) === '/') {
    str = str.trim().replace(/^\s*\/\*/, '');
  }
  return str.slice(0, 2) === '*!' || str.charAt(0) === '!';
};

/**
 * Returns true if the given comment `str` is a config comment that contains
 * `eslint`, `global`, `jshint`, `jslint` etc.
 * @return {Boolean}
 */

utils.isConfigComment = function(str, names) {
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

utils.isValidBlockComment = function(comment, options) {
  var singleStar = options && options.allowSingleStar;
  if (typeof comment === 'string') {
    var re = singleStar ? /^\s*\/\*/ : /^\s*\/\*\*/;
    return re.test(comment);
  }
  switch (comment.type.toLowerCase()) {
    case 'block':
    case 'commentblock':
    case 'blockcomment':
      if (!singleStar) {
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

utils.clean = function(name) {
  if (name.slice(-1) === '.') {
    name = name.slice(0, -1);
  }
  return name.trim();
};

/**
 * Strip leading stars from a code comment
 */

utils.stripStars = function(str) {
  return str.replace(/(?:^(?:\s*\/?\*)?[ \t]?|\s*(?:\*\/)?\s*$)/gm, '');
};

utils.isFloatingPoint = function(str) {
  return regex().test(str);
};

utils.unwrap = function(ast) {
  return ast.nodes.slice(1, ast.nodes.length - 1);
};

utils.getNext = function(str, substr, startIndex) {
  var idx = str.search(substr, startIndex);
  if (str.charAt(idx - 1) === '\\') {
    return utils.getNext(str, substr, idx + 1);
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

utils.copyNode = function(node) {
  var obj = {};
  for (var key in node) {
    if (node.hasOwnProperty(key)) {
      var val = node[key];

      if (key === 'value') {
        obj.val = val;

      } else {
        obj[key] = val;
      }
    }
  }
  return obj;
};
