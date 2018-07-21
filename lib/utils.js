'use strict';

const floatingPointRegex = require('floating-point-regex');

/**
 * Return the native type of a value
 */

const typeOf = exports.typeOf = val => {
  if (val === void 0) return 'undefined';
  if (val === null) return 'null';
  if (typeof val === 'string') return 'string';
  if (Array.isArray(val)) return 'array';
  if (val instanceof RegExp) {
    return 'regexp';
  }
  if (val && typeof val === 'object') {
    return 'object';
  }
};

/**
 * Returns true if `val` is a non-empty string
 * @return {Boolean}
 */

const isString = exports.isString = val => val && typeof val === 'string';

/**
 * Returns true if `val` is an object
 * @return {Boolean}
 */

const isObject = exports.isObject = val => typeOf(val) === 'object';

/**
 * Returns true if val is a finite number.
 */

exports.isNumber = function(num) {
  if (typeof num === 'number') {
    return num - num === 0;
  }
  if (typeof num === 'string' && num.trim() !== '') {
    return Number.isFinite ? Number.isFinite(+num) : isFinite(+num);
  }
  return false;
};

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

exports.last = arr => arr[arr.length - 1];

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
  return /^\W*(?:[ej]s[hl]int|(?<!@)global)[\s-]*(['"\w])/.test(str);
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
    if (key === 'val' && val !== void 0) {
      newNode.value = val;
    } else {
      newNode[key] = val;
    }
  }
  return newNode;
};

exports.get = (data = {}, prop = '') => {
  return data[prop] == null
    ? split(prop).reduce((acc, k) => acc && acc[k], data)
    : data[prop];
};

exports.set = (data = {}, prop = '', val) => {
  return split(prop).reduce((acc, k, i, arr) => {
    let value = arr.length - 1 > i ? (acc[k] || {}) : val;
    if (!isObject(value) && i < arr.length - 1) value = {};
    return (acc[k] = value);
  }, data);
};

exports.union = (data = {}, prop = '', val) => {
  const arr = exports.get(data, prop) || [];
  val = [].concat(val);
  const res = arr.concat(val).filter((ele, i, arr) => {
    return arr.indexOf(ele) === i;
  });
  exports.set(data, prop, res);
  return res;
};

exports.del = (data = {}, prop = '') => {
  if (!prop) return false;
  if (data.hasOwnProperty(prop)) {
    delete data[prop];
    return true;
  }
  const segs = split(prop);
  const last = segs.pop();
  const val = segs.length ? exports.get(data, segs.join('.')) : data;
  if (isObject(val) && val.hasOwnProperty(last)) {
    delete val[last];
    return true;
  }
};

exports.hasOwn = (data = {}, prop = '') => {
  if (!prop) return false;
  if (data.hasOwnProperty(prop)) return true;
  if (prop.indexOf('.') === -1) return false;
  const segs = split(prop);
  const last = segs.pop();
  const val = segs.length ? exports.get(data, segs.join('.')) : data;
  return isObject(val) && val.hasOwnProperty(last);
};

function split(str) {
  const segs = str.split('.');
  for (let i = 0; i < segs.length; i++) {
    while (segs[i] && segs[i].slice(-1) === '\\') {
      segs[i] = segs[i].slice(0, -1) + '.' + segs.splice(i + 1, 1);
    }
  }
  return segs;
}
