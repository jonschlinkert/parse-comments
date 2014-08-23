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
    // console.log(actual.comments[1])

    // actual.comments[0].should.have.property('param');
    // actual.comments[0].should.have.property('params');
    // actual.comments[0].params[0].should.have.property('type');
    // actual.comments[0].params[0].should.have.property('name');
  });
});