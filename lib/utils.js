/*!
 * parse-comments <https://github.com/jonschlinkert/parse-comments>
 *
 * NOTE: Although substantially changed, this was
 * originally based on https://github.com/caolan/scrawl
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var utils = module.exports = {};

utils.trimRight = function(str) {
  return str.replace(/\s+$/, '');
};

utils.stripStars = function (line) {
  return utils.trimRight(line.replace(/^\s*\*?\s?/, ''));
};
