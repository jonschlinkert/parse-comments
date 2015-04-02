/*!
 * parse-comments <https://github.com/jonschlinkert/parse-comments>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var fs = require('fs');
var _ = require('lodash');
var inspect = _.partialRight(require('util').inspect, null, 10);
var should = require('should');
var comments = require('..');
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
  ' * @param {String} `alpha`',
  ' * @param {Object|Array} `arr` Object or array of replacement patterns to associate.',
  ' *   @property {String|RegExp} [arr] `pattern`',
  ' *   @property {String|Function} [arr] `replacement`',
  ' * @param {String} `beta`',
  ' *   @property {Array} [beta] `foo` This is foo option.',
  ' *   @property {Array} [beta] `bar` This is bar option',
  ' * @return {Strings} to allow chaining',
  ' * @api public',
  ' */'
].join('\n');


describe('when a string is passed:', function () {
  it('should parse a string', function () {
    var actual = comments('/**\n@param {Object} `abc`\n@api public\n*/');
    actual.length.should.equal(1);
    actual[0].should.have.property('param');
    actual[0].should.have.property('api');
  });

  it('should parse a string', function () {
    var actual = comments(comment)
    actual.length.should.equal(1);
    actual[0].should.have.property('param');
  });

  it('should parse @params', function () {
    var actual = comments(utils.read('params'));
    actual.length.should.equal(1);
    actual[0].should.have.property('param');
  });

  it('should parse @return', function () {
    var actual = comments(utils.read('ret'));
    actual.length.should.equal(1);
    actual[0].should.have.property('return');
    actual[0].should.have.property('returns');
  });

  it('should parse @api', function () {
    var actual = comments(utils.read('api'));
    actual.length.should.equal(1);
    actual[0].should.have.property('api');
  });
});

