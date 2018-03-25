'use strict';

require('mocha');
require('should');
var assert = require('assert');
var Comments = require('..');
var tag = require('../lib/parse/tag');
var type = require('../lib/parse/type');

/**
 * some of these integration tests are based on tests from doctrine
 * https://github.com/eslint/doctrine/LICENSE.BSD
 * https://github.com/eslint/doctrine/LICENSE.closure-compiler
 * https://github.com/eslint/doctrine/LICENSE.esprima
 */

describe('tagged namepaths', function() {
  it('recognize module:', function() {
    var res = tag('@alias module:Foo.bar', {});
    res.should.have.property('title', 'alias');
    res.should.have.property('name', 'module:Foo.bar');
    res.should.have.property('description', '');
  });

  it('recognize external:', function() {
    var res = tag('@param {external:Foo.bar} baz description', {});
    res.type = type(res.rawType.slice(1, -1));

    res.should.have.property('title', 'param');
    assert.deepEqual(res.type, {
      'name': 'external:Foo.bar',
      'type': 'NameExpression'
    });

    res.should.have.property('name', 'baz');
    res.should.have.property('description', 'description');
  });

  it('recognize event:', function() {
    var res = tag('@function event:Foo.bar', {});
    res.should.have.property('title', 'function');
    res.should.have.property('name', 'event:Foo.bar');
    res.should.have.property('description', '');
  });

  it('invalid bogus:', function() {
    var comments = new Comments();
    var res = comments.parse('/** @method bogus:Foo.bar */', {});
    console.log(res[0].tags);
  });
});

