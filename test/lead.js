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

describe('comment lead:', function () {

  it('should get a basic lead from a comment.', function () {
    var actual = comments(utils.read('lead/basic'));
    actual[0].should.have.property('lead');
    actual[0].lead.should.equal('Get or set a propstring.');
  });

  it('should get a lead from a comment with a heading.', function () {
    var actual = comments(utils.read('lead/basic'));
    actual[0].should.have.property('lead');
    actual[0].lead.should.equal('Get or set a propstring.');
  });

  it('should get a lead that spans multiple lines.', function () {
    var actual = comments(utils.read('lead/lines'));
    actual[0].should.have.property('lead');
    actual[0].lead.should.equal('Get or set a propstring.');
  });

  it('should get a long lead that spans multiple lines.', function () {
    var actual = comments(utils.read('lead/long'));
    actual[0].should.have.property('lead');
    actual[0].lead.should.equal('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum');
  });

  it('should get a badly formatted lead from a comment.', function () {
    var actual = comments(utils.read('lead/b'));
    actual[0].should.have.property('lead');
    actual[0].lead.should.equal('Get or set a propstring.');
  });

  it('should get a badly formatted lead from a comment.', function () {
    var actual = comments(utils.read('lead/c'));
    actual[0].should.have.property('lead');
    actual[0].lead.should.equal('Get or set a propstring.');
  });
});