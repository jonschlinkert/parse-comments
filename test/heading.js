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

describe('comment `heading`:', function () {
  it('should get a basic heading.', function () {
    var str = utils.read('headings/basic');
    var actual = comments(str);
    actual[0].should.have.property('heading');
    actual[0].heading.text.should.equal('writeFile');
    actual[0].name.should.equal('writeFile');
  });

  it('should get a method name heading.', function () {
    var str = utils.read('headings/method');
    var actual = comments(str);
    actual[0].should.have.property('heading');
    actual[0].heading.text.should.equal('set');
    actual[0].name.should.equal('set');
  });

  it('explicit heading should win over function name.', function () {
    var str = utils.read('headings/class');
    var actual = comments(str);
    actual[0].should.have.property('heading');
    actual[0].heading.text.should.equal('CacheFoo');
    actual[0].name.should.equal('CacheFoo');
  });

  it('function name should win over everything but explicit.', function () {
    var str = utils.read('headings/function-name');
    var actual = comments(str);
    actual[0].should.have.property('heading');
    actual[0].heading.text.should.equal('CacheManager');
    actual[0].name.should.equal('CacheManager');
  });

  it('should extract a heading with non-word characters excluded.', function () {
    var str = utils.read('headings/non-word');
    var actual = comments(str);
    actual[0].should.have.property('heading');
    actual[0].heading.text.should.equal('Word');
    actual[0].name.should.equal('Word');
  });
});
