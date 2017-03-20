'use strict';

var regex = require('floating-point-regex');
var define = require('define-property');
var typeOf = require('kind-of');

exports.clean = function(name) {
  if (exports.isString(name)) {
    return name.replace(/^([,|]|\.(?!\.))*|([,|]|\.(?!\.))*$/g, '');
  }
};

exports.isFloatingPoint = function(str) {
  return regex().test(str);
};

exports.unwrap = function(ast) {
  return ast.nodes.slice(1, ast.nodes.length - 1);
};

exports.getClose = function(str, substr, startIndex) {
  var idx = str.indexOf(substr, startIndex);
  if (str.charAt(idx - 1) === '\\') {
    return exports.getClose(str, substr, idx + 1);
  }
  return idx;
};

exports.last = function(arr) {
  return arr[arr.length - 1];
};

exports.isString = function(val) {
  return val && typeof val === 'string';
};

exports.arrayify = function(val) {
  return val ? (Array.isArray(val) ? val : [val]) : [];
};

exports.isObject = function(val) {
  return typeOf(val) === 'object';
};

exports.copyNode = function(node) {
  var obj = {};
  for (var key in node) {
    if (node.hasOwnProperty(key)) {
      var val = node[key];

      if (key === 'raw' || key === 'loc' || key === 'range') {
        define(obj, key, val);

      } else if (key === 'value') {
        obj.val = val;

      } else {
        obj[key] = val;
      }
    }
  }
  return obj;
};
