'use strict';

var fs = require('fs');
var path = require('path');

exports.files = function() {
  var cwd = path.resolve.apply(path, arguments);
  var files = fs.readdirSync(cwd);
  var res = {};

  for (var i = 0; i < files.length; i++) {
    var name = files[i];
    var fp = path.resolve(cwd, name);
    res[name.slice(0, -3)] = fs.readFileSync(fp, 'utf8');
  }
  return res;
};
