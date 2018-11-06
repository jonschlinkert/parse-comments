/*!
 * parse-comments <https://github.com/jonschlinkert/parse-comments>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var fs = require('fs');
var should = require('should');
var utils = require('./helpers/utils');
var parseComments = require('..');

describe('parse code context:', function () {
  it('should parse comments and merge in code context.', function () {
    var actual = parseComments(utils.read('strings'));
    actual.should.be.an.Array;
  });
});

