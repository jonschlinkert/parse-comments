/*!
 * parse-comments <https://githuc.com/jonschlinkert/parse-comments>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var fs = require('fs');
var assert = require('assert');
var should = require('should');
var parse = require('..').parseParams;


describe('parse params:', function () {

  it('should parse @params', function () {
    var actual = parse('{Object} `bar` This is a description.');
    actual.should.have.property('type');
    actual.type.should.equal('Object');
    actual.should.have.property('name');
    actual.name.should.equal('bar');
    actual.should.have.property('description');
    actual.description.should.equal('This is a description.');
  });

  it('should parse @params when `type` is missing', function () {
    var actual = parse('`bar` This is a description.');
    actual.should.have.property('type');
    actual.should.have.property('name');
    actual.name.should.equal('bar');
    actual.should.have.property('description');
    actual.description.should.equal('This is a description.');
  });

  it('should parse @params when `name` is missing', function () {
    var actual = parse('{Object} This is a description.');
    actual.should.have.property('type');
    actual.type.should.equal('Object');
    actual.should.have.property('name');
    assert.equal(actual.name, undefined);
    actual.should.have.property('description');
    actual.description.should.equal('This is a description.');
  });

  it('should parse @params when `description` is missing', function () {
    var actual = parse('{Object} `bar`');
    actual.should.have.property('type');
    actual.type.should.equal('Object');
    actual.should.have.property('name');
    actual.name.should.equal('bar');
    actual.should.have.property('description');
  });

  it('should parse @params when `description` is missing', function () {
    var actual = parse('{Object} `bar`');
    actual.should.have.property('type');
    actual.type.should.equal('Object');
    actual.should.have.property('name');
    actual.name.should.equal('bar');
    actual.should.have.property('description');
  });
});

