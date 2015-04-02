/*!
 * parse-comments <https://github.com/jonschlinkert/parse-comments>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var fs = require('fs');
var should = require('should');
var comments = require('..');
var utils = require('./helpers/utils');

describe('utils:', function () {
  it('should strip banners', function () {
    var actual = comments(utils.read('params'));

    actual[0].should.have.property('param');
    actual[0].should.have.property('params');
    actual[0].params[0].should.have.property('type');
    actual[0].params[0].should.have.property('name');
  });
});