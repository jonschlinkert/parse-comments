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


describe('utils:', function () {
  it('should strip banners', function () {
    var actual = readFixture('params');

    actual[0].should.have.property('param');
    actual[0].should.have.property('params');
    actual[0].params[0].should.have.property('type');
    actual[0].params[0].should.have.property('name');
  });
});