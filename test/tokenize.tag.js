'use strict';

require('mocha');
var assert = require('assert');
var tag = require('../lib/parse/tag');

describe('tokenize-tag', function() {
  it('should return null when an empty string is passed', function() {
    assert.deepEqual(tag(''), { description: '', rawType: '', name: '' });
    assert.deepEqual(tag(' '), { description: '', rawType: '', name: '' });
  });

  it('should tokenize type', function() {
    assert.deepEqual(tag('{String}'), {
      rawType: '{String}',
      name: '',
      description: ''
    });
  });

  it('should tokenize name', function() {
    assert.deepEqual(tag('foo'), {
      rawType: '',
      name: 'foo',
      description: ''
    });
  });

  it('should tokenize name and description', function() {
    assert.deepEqual(tag('foo bar'), {
      rawType: '',
      name: 'foo',
      description: 'bar'
    });
  });

  it('should tokenize type, name and description', function() {
    assert.deepEqual(tag('{String} foo bar'), {
      rawType: '{String}',
      name: 'foo',
      description: 'bar'
    });
  });

  it('should tokenize record type and name', function() {
    assert.deepEqual(tag('{{foo: bar, baz}} qux'), {
      rawType: '{{foo: bar, baz}}',
      name: 'qux',
      description: ''
    });
  });

  it('should tokenize union type and name', function() {
    assert.deepEqual(tag('{(string|array)} qux'), {
      rawType: '{(string|array)}',
      name: 'qux',
      description: ''
    });
  });

  it('should tokenize optional name', function() {
    assert.deepEqual(tag('{(string|array)} [qux]'), {
      rawType: '{(string|array)}',
      name: '[qux]',
      description: ''
    });
  });

  it('should tokenize name with backticks', function() {
    assert.deepEqual(tag('{String|Array} `qux`'), {
      rawType: '{String|Array}',
      name: '`qux`',
      description: ''
    });
  });

  it('should tokenize optional name with default', function() {
    assert.deepEqual(tag('{(string|array)} [qux=bar]'), {
      rawType: '{(string|array)}',
      name: '[qux=bar]',
      description: ''
    });
  });

  it('should tokenize optional name with spaces', function() {
    assert.deepEqual(tag('{(string|array)} [qux = bar]'), {
      rawType: '{(string|array)}',
      name: '[qux = bar]',
      description: ''
    });

    assert.deepEqual(tag('{(string|array)} [qux= bar]'), {
      rawType: '{(string|array)}',
      name: '[qux= bar]',
      description: ''
    });

    assert.deepEqual(tag('{(string|array)} [qux =bar]'), {
      rawType: '{(string|array)}',
      name: '[qux =bar]',
      description: ''
    });
  });

  it('should tokenize optional name with spaces and description', function() {
    assert.deepEqual(tag('{(string|array)} [qux = bar] The description'), {
      rawType: '{(string|array)}',
      name: '[qux = bar]',
      description: 'The description'
    });
  });

  it('should tokenize a multi-line tag', function() {
    assert.deepEqual(tag('{string|\n number} userName\n }}'), {
      rawType: '{string|\n number}',
      name: 'userName',
      description: ''
    });

    assert.deepEqual(tag('{string|\n number} userName\nFoo bar baz }}'), {
      rawType: '{string|\n number}',
      name: 'userName',
      description: 'Foo bar baz'
    });
  });
});
