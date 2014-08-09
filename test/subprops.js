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
  ' *   @option {Array} [omega] `a` This is option A.',
  ' *   @option {Array} [omega] `b` This is option B',
  ' * @return {Strings} to allow chaining',
  ' * @api public',
  ' */'
].join('\n');


var b = [
  '/**',
  ' * @param {String} `alpha`',
  ' * @param {Object|Array} `arr` Object or array of replacement patterns to associate.',
  ' *   @a {String|RegExp} [arr] `pattern`',
  ' *   @a {String|Function} [arr] `replacement`',
  ' * @param {String} `beta`',
  ' *   @b {Array} [beta] `foo` This is foo option.',
  ' *   @b {Array} [beta] `bar` This is bar option',
  ' * @param {String} `omega`',
  ' *   @c {Array} [omega] `a` This is option A.',
  ' *   @c {Array} [omega] `b` This is option B',
  ' * @return {Strings} to allow chaining',
  ' * @api public',
  ' */'
].join('\n');


describe('sub properties:', function () {
  it('should add sub-props to a parent parameter', function () {
    var actual = parser(a);
    actual.comments[0].should.have.property('params');
    actual.comments[0].should.have.property('properties');
    actual.comments[0].params[1].should.have.property('properties');
    actual.comments[0].params[2].should.have.property('properties');
  });

  it('should add sub-props to a parent parameter', function () {
    var actual = parser(a);
    actual.comments[0].should.have.property('params');
    actual.comments[0].should.have.property('properties');
    actual.comments[0].params[1].should.have.property('properties');
    actual.comments[0].params[2].should.have.property('properties');
    actual.comments[0].params[3].should.have.property('options');
  });

  it('should not add properties object to a param that has no children', function () {
    var actual = parser(a);
    actual.comments[0].params[0].should.not.have.property('properties');
  });


  it('should allow custom sub-props to be defined.', function () {
    var actual = parser(b, {
      subprops: {
        a: 'aa',
        b: 'bb',
        c: 'cc'
      }
    });
    // console.log(JSON.stringify(actual, null, 2))

    // actual.comments[0].should.have.property('params');
    // actual.comments[0].should.have.property('properties');
    // actual.comments[0].params[1].should.have.property('properties');
    // actual.comments[0].params[2].should.have.property('properties');
    // actual.comments[0].params[3].should.have.property('options');
  });

});

