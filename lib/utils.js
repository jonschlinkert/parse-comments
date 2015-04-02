/*!
 * parse-comments <https://github.com/jonschlinkert/parse-comments>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var utils = module.exports = {};

utils.trimRight = function(str) {
  return str.replace(/\s+$/, '');
};

utils.stripStars = function (line) {
  var re = /^(?:\s*[\*]{1,2}\s)/;
  return utils.trimRight(line.replace(re, ''));
};
