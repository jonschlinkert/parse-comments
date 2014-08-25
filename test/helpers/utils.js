'utils';

var fs = require('fs');
var path = require('path');


exports.read = function(filepath) {
  var file = path.join('test/fixtures', filepath + '.js');
  return fs.readFileSync(file, 'utf8');
};
