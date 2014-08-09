/*!
 * parse-comments <https://githuc.com/jonschlinkert/parse-comments>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var fs = require('fs');
var should = require('should');
var parseComment = require('..');

function readFixture(src) {
  var str = fs.readFileSync('test/fixtures/' + src + '.js', 'utf8');
  return parseComment(str);
}

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
    var actual = parseComment('/**\n@foo {Object} `bar`\n*/');
    actual.length.should.equal(1);
    actual[0].should.have.property('foo');
  });

  it('should parse a string', function () {
    var actual = parseComment(comment)
    actual.length.should.equal(1);
    actual[0].should.have.property('param');
  });

  it('should parse @params', function () {
    var actual = readFixture('params');
    actual.length.should.equal(1);
    actual[0].should.have.property('param');
  });

  it('should parse @return', function () {
    var actual = readFixture('return');
    actual.length.should.equal(1);
    actual[0].should.have.property('return');
    actual[0].should.have.property('returns');
  });

  it('should parse @api', function () {
    var actual = readFixture('api');
    actual.length.should.equal(1);
    actual[0].should.have.property('api');
  });

  it('should parse @api', function () {
    var actual = readFixture('no-banner');
    // console.log(actual)

  });
});

