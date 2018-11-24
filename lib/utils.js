'use strict';

const floatingPointRegex = require('floating-point-regex');

/**
 * Returns true if val is a finite number.
 */

const isNumber = exports.isNumber = num => {
  if (typeof num === 'number') {
    return num - num === 0;
  }
  if (typeof num === 'string' && num.trim() !== '') {
    return Number.isFinite ? Number.isFinite(+num) : isFinite(+num);
  }
  return false;
};

/**
 * Return the native type of a value
 */

const typeOf = exports.typeOf = val => {
  if (val === null) return 'null';
  if (val === void 0) return 'undefined';
  if (Array.isArray(val)) return 'array';
  if (isNumber(val)) return 'number';
  if (typeof val === 'string') return 'string';
  if (typeof val === 'symbol') return 'symbol';
  if (typeof val === 'boolean') return 'boolean';
  if (typeof val === 'function') return 'function';
  if (val instanceof Error) return 'error';
  if (val instanceof RegExp) return 'regexp';
  if (val instanceof Date) return 'date';
  if (val && typeof val === 'object') {
    return 'object';
  }
  return typeof val;
};

/**
 * Returns true if `val` is a non-empty string
 * @return {Boolean}
 */

exports.isString = val => val !== '' && typeof val === 'string';

/**
 * Returns true if `val` is an object
 * @return {Boolean}
 */

exports.isObject = val => typeOf(val) === 'object';

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

exports.last = (arr = [], n = 1) => arr[arr.length - n];

/**
 * Returns true if the given comment `str` is a protected comment
 * that begins with `!`
 * @return {Boolean}
 */

exports.isProtectedComment = str => /^\/\*{1,2}\s*!/.test(str);;

/**
 * Returns true if the given comment `str` is a config comment that contains
 * `eslint`, `global`, `jshint`, `jslint` etc.
 * @return {Boolean}
 */

exports.isConfigComment = (str, names = '[ej]s[hl]int') => {
  names = [].concat(names);
  let source = `\\W*(?:${names.join('|')}|(?<!@)global)[\\s-]*([\'"\\w])`;
  let regex = new RegExp(source);
  return regex.test(str);
};

/**
 * Returns true if the given `comment` is a valid block comment. A block comment is
 * valid when it begins with `**` or `*` if `options.allowSingleStar` is true.
 *
 * @param {Objects} comment
 * @param {Objects} options
 * @return {Boolean}
 */

exports.isValidBlockComment = (comment, options = {}) => {
  let regex = options.allowSingleStar ? /^\s*\/\*/ : /^\s*\/\*\*/;
  if (typeof comment === 'string') {
    return regex.test(comment);
  }
  switch (comment.type && comment.type.toLowerCase()) {
    case 'block':
    case 'commentblock':
    case 'blockcomment':
      if (!options.allowSingleStar) {
        return comment.raw[0] === '*';
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

exports.clean = (name = '') => name.trim().replace(/\.$/, '');

/**
 * Strip leading stars from a code comment
 */

exports.stripStars = str => {
  return str.replace(/(?:^(?:\s*\/?\*)?[^\S\n]?|\s*(?:\*\/)?\s*$)/gm, '');
};

exports.isFloatingPoint = str => {
  return floatingPointRegex().test(str);
};

exports.getNext = (str, substr, startIndex) => {
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

exports.copyNode = node => {
  if (!node) return {};
  let newNode = {};

  for (let key of Object.keys(node)) {
    let val = node[key];
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
    if (!exports.isObject(value) && i < arr.length - 1) value = {};
    return (acc[k] = value);
  }, data);
};

exports.union = (data = {}, prop = '', val) => {
  let arr = exports.get(data, prop) || [];
  val = [].concat(val);
  let res = arr.concat(val).filter((ele, i, arr) => {
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
  let segs = split(prop);
  let last = segs.pop();
  let val = segs.length ? exports.get(data, segs.join('.')) : data;
  if (exports.isObject(val) && val.hasOwnProperty(last)) {
    delete val[last];
    return true;
  }
};

exports.hasOwn = (data = {}, prop = '') => {
  if (!prop) return false;
  if (data.hasOwnProperty(prop)) return true;
  if (prop.indexOf('.') === -1) return false;
  let segs = split(prop);
  let last = segs.pop();
  let val = segs.length ? exports.get(data, segs.join('.')) : data;
  return exports.isObject(val) && val.hasOwnProperty(last);
};

function split(str) {
  let segs = str.split('.');
  for (let i = 0; i < segs.length; i++) {
    while (segs[i] && segs[i].slice(-1) === '\\') {
      segs[i] = segs[i].slice(0, -1) + '.' + segs.splice(i + 1, 1);
    }
  }
  return segs;
}
