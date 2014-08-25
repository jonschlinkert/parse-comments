/*!
 * parse-comments <https://githuc.com/jonschlinkert/parse-comments>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var utils = require('./helpers/utils');
var comments = require('..');

describe('comment `method`:', function () {

  it('should get a method param.', function () {
    var actual = comments(utils.read('method'));
    actual[0].should.have.property('name');
    actual[0].name.should.equal('propstring');
  });
});