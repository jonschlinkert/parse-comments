/*!
 * parse-comments <https://githuc.com/jonschlinkert/parse-comments>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var fs = require('fs');
var _ = require('lodash');
var inspect = _.partialRight(require('util').inspect, null, 10);
var should = require('should');
var parser = require('..');
var utils = require('./helpers/utils');

var a = [
  '/**',
  ' * @param {String} `alpha`',
  ' * @param {Object|Array} `arr` Object or array of replacement patterns to associate.',
  ' *   @property {String|RegExp} [arr] `pattern`',
  ' *   @property {String|Function} [arr] `replacement`',
  ' * @param {String} `beta`',
  ' *   @property {Array} [beta] `foo` This is foo option.',
  ' *   @property {Array} [beta] `bar` This is bar option',
  ' * @param {String} `omega`',
  ' *   @option {Array} [omega.one=foo] `a` This is option A.',
  ' *   @option {Array} [omega.two=bar] `b` This is option B.',
  ' *   @option {Array} [omega] `c` This is option C',
  ' * @return {Strings} to allow chaining',
  ' * @api public',
  ' */',
  ''
].join('\n');


describe('sub properties:', function () {
  it('should add sub-props to a parent parameter', function () {
    var actual = parser(a);
    actual[0].should.have.property('params');
    actual[0].should.have.property('properties');
    actual[0].params[1].should.have.property('properties');
    actual[0].params[2].should.have.property('properties');
  });

  it('should add sub-props to a parent parameter', function () {
    var actual = parser(a);
    actual[0].should.have.property('params');
    actual[0].should.have.property('properties');
    actual[0].params[1].should.have.property('properties');
    actual[0].params[2].should.have.property('properties');
    actual[0].params[3].should.have.property('options');
  });

  it('should not add properties object to a param that has no children', function () {
    var actual = parser(a);
    actual[0].params[0].should.not.have.property('properties');
  });
});
