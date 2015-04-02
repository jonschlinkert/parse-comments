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
var parser = require('..');
var utils = require('./helpers/utils');


var a = '';
var b = '/**\n@param {Object} `abc`\n@api public\n*/\n/**\n@param {Object} `abc`\n@api private\n*/';


describe('when a string is passed:', function () {
  xit('should filter out comments with `@api private`:', function () {
    var actual = parser('/**\n@param {Object} `abc`\n@api private\n@type a\n*/');
    actual.length.should.equal(0);
  });

  it('should keep comments if they match values in options.keep:', function () {
    var actual = parser(b);
    actual.length.should.equal(1);
  });

  it('should filter out comments with omitted properties:', function () {
    var str = '/**\n@param {Object} `abc`\n@api public\n@type a\n*/';
    var actual = parser(str);
    actual.length.should.equal(1);
    actual[0].should.have.property('param');
    actual[0].should.have.property('api');
  });

});

