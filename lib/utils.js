'use strict';

exports.last = function(arr) {
  return arr[arr.length - 1];
};

exports.isString = function(val) {
  return val && typeof val === 'string';
};

exports.copyNode = function(node) {
  var obj = {};
  for (var key in node) {
    if (node.hasOwnProperty(key)) {
      var val = node[key];
      if (key === 'loc') {
        obj.position = val;

      } else if (key === 'raw') {
        obj.raw = new Buffer(val);

      } else if (key === 'value') {
        obj.val = val;

      } else {
        obj[key] = val;
      }
    }
  }
  return obj;
};
