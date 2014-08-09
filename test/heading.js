/*!
 * parse-comments <https://githuc.com/jonschlinkert/parse-comments>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var utils = require('./helpers/utils');


describe('comment `heading`:', function () {

  it('should get a basic heading.', function () {
    var actual = utils.fixture('headings/basic');
    actual.comments[0].should.have.property('heading');
    actual.comments[0].heading.text.should.equal('.writeFile');
    actual.comments[0].name.should.equal('.writeFile');
  });

  it('should get a method name heading.', function () {
    var actual = utils.fixture('headings/method');
    actual.comments[0].should.have.property('heading');
    actual.comments[0].heading.text.should.equal('.set');
    actual.comments[0].name.should.equal('.set');
  });

  it('should get a class name heading.', function () {
    var actual = utils.fixture('headings/class');
    actual.comments[0].should.have.property('heading');
    actual.comments[0].heading.text.should.equal('CacheFoo');
    actual.comments[0].name.should.equal('CacheFoo');
  });

  it('should extract a heading with non-word characters excluded.', function () {
    var actual = utils.fixture('headings/non-word');
    actual.comments[0].should.have.property('heading');
    actual.comments[0].heading.text.should.equal('Word');
    actual.comments[0].name.should.equal('Word');
  });

});