/*!
 * parse-comments <https://githuc.com/jonschlinkert/parse-comments>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var fs = require('fs');
var should = require('should');
var parseComments = require('..');
var utils = require('./helpers/utils');


var comment = [
  '/**',
  ' * ## .parser',
  ' *',
  ' * Set a parser that can later be used to parse any given string.',
  ' *',
  ' * ```js',
  ' * strings.parser (name, replacements)',
  ' * ```',
  ' *',
  ' * **Example**',
  ' *',
  ' * {%= docs("example-parser.md") %}',
  ' *',
  ' * @param {String} `name`',
  ' * @param {Object|Array} `arr` Object or array of replacement patterns to associate.',
  ' *   @property {String|RegExp} `pattern`',
  ' *   @property {String|Function} `replacement`',
  ' * @return {Strings} to allow chaining',
  ' *   @property {Array} `foo`',
  ' * @api public',
  ' */'
].join('\n');


describe('when a string is passed:', function () {
  it('should parse a string', function () {
    var actual = parseComments('/**\n@foo {Object} `bar`\n*/');
    console.log(actual)
    actual.length.should.equal(1);
    actual[0].should.have.property('foo');
  });

  // it('should parse a string', function () {
  //   var actual = parseComments(comment)
  //   actual.length.should.equal(1);
  //   actual[0].should.have.property('param');
  // });

  // it('should parse @params', function () {
  //   var actual = utils.fixture('params');
  //   actual.length.should.equal(1);
  //   actual[0].should.have.property('param');
  // });

  // it('should parse @return', function () {
  //   var actual = utils.fixture('return');
  //   actual.length.should.equal(1);
  //   actual[0].should.have.property('return');
  //   actual[0].should.have.property('returns');
  // });

  // it('should parse @api', function () {
  //   var actual = utils.fixture('api');
  //   actual.length.should.equal(1);
  //   actual[0].should.have.property('api');
  // });
});

