/*!
 * parse-comments <https://githuc.com/jonschlinkert/parse-comments>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var utils = require('./helpers/utils');


describe('comment lead:', function () {

  it('should get a basic lead from a comment.', function () {
    var actual = utils.fixture('lead/basic');
    actual.comments[0].should.have.property('lead');
    actual.comments[0].lead.should.equal('Get or set a propstring.');
  });

  it('should get a lead from a comment with a heading.', function () {
    var actual = utils.fixture('lead/basic');
    actual.comments[0].should.have.property('lead');
    actual.comments[0].lead.should.equal('Get or set a propstring.');
  });

  it('should get a lead that spans multiple lines.', function () {
    var actual = utils.fixture('lead/lines');
    actual.comments[0].should.have.property('lead');
    actual.comments[0].lead.should.equal('Get or set a propstring.');
  });

  it('should get a long lead that spans multiple lines.', function () {
    var actual = utils.fixture('lead/long');
    actual.comments[0].should.have.property('lead');
    actual.comments[0].lead.should.equal('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum');
  });

  it('should get a badly formatted lead from a comment.', function () {
    var actual = utils.fixture('lead/b');
    actual.comments[0].should.have.property('lead');
    actual.comments[0].lead.should.equal('Get or set a propstring.');
  });

  it('should get a badly formatted lead from a comment.', function () {
    var actual = utils.fixture('lead/c');
    actual.comments[0].should.have.property('lead');
    actual.comments[0].lead.should.equal('Get or set a propstring.');
  });
});