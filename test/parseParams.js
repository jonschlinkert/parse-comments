/*!
 * parse-comments <https://github.com/jonschlinkert/parse-comments>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var fs = require('fs');
var assert = require('assert');
var should = require('should');
var parser = require('..').parseParams;


describe('parse params:', function () {
  it('should parse @params', function () {
    var actual = parser('{Object} `bar` This is a description.');
    actual.should.have.property('type');
    actual.type.should.equal('Object');
    actual.should.have.property('name');
    actual.name.should.equal('bar');
    actual.should.have.property('description');
    actual.description.should.equal('This is a description.');
  });

  it('should parse @params when `type` is missing', function () {
    var actual = parser('`bar` This is a description.');
    actual.should.have.property('type');
    actual.should.have.property('name');
    actual.name.should.equal('bar');
    actual.should.have.property('description');
    actual.description.should.equal('This is a description.');
  });

  it.skip('should parse @params when `name` is missing', function () {
    var actual = parser('{Object} This is a description.');
    actual.should.have.property('type');
    actual.type.should.equal('Object');
    actual.should.have.property('name');
    assert.equal(actual.name, undefined);
    actual.should.have.property('description');
    actual.description.should.equal('This is a description.');
  });

  it('should parse @params when `description` is missing', function () {
    var actual = parser('{Object} `bar`');
    actual.should.have.property('type');
    actual.type.should.equal('Object');
    actual.should.have.property('name');
    actual.name.should.equal('bar');
    actual.should.have.property('description');
  });

  it('should parse @params when `description` is missing', function () {
    var actual = parser('{Object} `bar`');
    actual.should.have.property('type');
    actual.type.should.equal('Object');
    actual.should.have.property('name');
    actual.name.should.equal('bar');
    actual.should.have.property('description');
  });
});

