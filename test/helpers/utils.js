'utils';

var fs = require('fs');
var parseComment = require('../..');


exports.fixture = function(src) {
  var str = fs.readFileSync('test/fixtures/' + src + '.js', 'utf8');
  return parseComment(str);
};