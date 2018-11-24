'use strict';

require('mocha');
const assert = require('assert');
const doctrine = require('doctrine');
const parseName = require('../lib/parse/name');

describe('parse name', () => {
  it('should parse a name passed as a string', () => {
    assert.deepEqual(parseName('foo'), {
      type: 'NameExpression',
      name: 'foo'
    });
  });

  it('should parse a name passed as an object', () => {
    assert.deepEqual(parseName({
      type: 'NameExpression',
      name: 'foo'
    }), {
      type: 'NameExpression',
      name: 'foo'
    });
  });

  it('should set OptionalType', () => {
    assert.deepEqual(parseName('[foo]'), {
      type: 'OptionalType',
      expression: {
        type: 'NameExpression',
        name: 'foo'
      }
    });
  });

  it('should strip backticks', () => {
    assert.deepEqual(parseName('`foo`'), {
      type: 'NameExpression',
      name: 'foo'
    });
  });
});
