/*!
 * parse-comments <https://githuc.com/jonschlinkert/parse-comments>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var fs = require('fs');
var inspect = require('util').inspect;
var should = require('should');
var jscomments = require('..');

function readFixture(src) {
  return fs.readFileSync('test/fixtures/' + src + '.js', 'utf8');
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
  it('should parse comments and return an object', function () {
    var actual = jscomments('/**\n@foo {Object} `bar`\n*/');
    actual.comments.should.be.an.object;
  });

  it('should parse comments and return an object', function () {
    var actual = jscomments(readFixture('strings'));
    actual.comments.should.be.an.object;
  });

});

