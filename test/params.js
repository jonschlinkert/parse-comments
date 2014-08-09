/*!
 * parse-comments <https://githuc.com/jonschlinkert/parse-comments>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var fs = require('fs');
var should = require('should');
var parseComment = require('..');
var utils = require('./helpers/utils');

describe('utils:', function () {
  it('should strip banners', function () {
    var actual = utils.fixture('params');

    actual[0].should.have.property('param');
    actual[0].should.have.property('params');
    actual[0].params[0].should.have.property('type');
    actual[0].params[0].should.have.property('name');
  });
});