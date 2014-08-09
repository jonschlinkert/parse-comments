'utils';

var fs = require('fs');
var path = require('path');
var parseComment = require('../..');


exports.read = function(filepath) {
  var file = path.join('test/fixtures', filepath + '.js');
  return fs.readFileSync(file, 'utf8');
};

exports.fixture = function(str) {
  return parseComment(exports.read(str));
};