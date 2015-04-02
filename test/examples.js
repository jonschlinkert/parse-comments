/*!
 * parse-comments <https://github.com/jonschlinkert/parse-comments>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var should = require('should');
var utils = require('./helpers/utils');
var comments = require('..');

describe('code examples:', function () {
  describe('comment `heading`:', function () {
    it('should get a basic heading.', function () {
      var str = utils.read('example');
      var actual = comments(str);
      actual[1].should.have.property('heading');
      actual[1].heading.text.should.equal('run');
      actual[1].name.should.equal('run');
    });
  });
});
