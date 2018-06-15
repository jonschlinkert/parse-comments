'use strict';

require('mocha');
require('should');
var assert = require('assert');
var doctrine = require('doctrine');
var parseName = require('../lib/parsers/name');

describe('parse name', function() {
  it('should parse a name passed as a string', function() {
    assert.deepEqual(parseName('foo'), {
      type: 'NameExpression',
      name: 'foo'
    });
  });

  it('should parse a name passed as an object', function() {
    assert.deepEqual(parseName({
      type: 'NameExpression',
      name: 'foo'
    }), {
      type: 'NameExpression',
      name: 'foo'
    });
  });

  it('should set OptionalType', function() {
    assert.deepEqual(parseName('[foo]'), {
      type: 'OptionalType',
      expression: {
        type: 'NameExpression',
        name: 'foo'
      }
    });
  });

  it('should strip backticks', function() {
    assert.deepEqual(parseName('`foo`'), {
      type: 'NameExpression',
      name: 'foo'
    });
  });
});
