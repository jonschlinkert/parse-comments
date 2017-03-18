'use strict';

var define = require('define-property');
var typeOf = require('kind-of');

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
