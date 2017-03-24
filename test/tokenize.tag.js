'use strict';

require('mocha');
var assert = require('assert');
var tag = require('../lib/parse/tag');

describe('tokenize-tag', function() {
  describe('empty', function() {
    it('should return null when an empty string is passed', function() {
      assert.deepEqual(tag(''), {
        description: '',
        key: '',
        rawType: '',
        name: ''
      });

      assert.deepEqual(tag(' '), {
        description: '',
        key: '',
        rawType: '',
        name: ''
      });
    });
  });

  describe('tags', function() {
    it('should tokenize a tag', function() {
      assert.deepEqual(tag('@param {String|Array} foo This is a description'), {
        key: '@param',
        rawType: '{String|Array}',
        name: 'foo',
        description: 'This is a description'
      });
    });

    it('should tokenize tag with nested optional name with default', function() {
      assert.deepEqual(tag('@param {String|Array} [val=[\'foo\']] some description'), {
        key: '@param',
        rawType: '{String|Array}',
        name: '[val=[\'foo\']]',
        description: 'some description'
      });

      assert.deepEqual(tag('{String|Array} [val=[\'foo\']] some description'), {
        key: '',
        rawType: '{String|Array}',
        name: '[val=[\'foo\']]',
        description: 'some description'
      });

      assert.deepEqual(tag('{(String|Array)} [val=[\'foo\']] some description'), {
        key: '',
        rawType: '{(String|Array)}',
        name: '[val=[\'foo\']]',
        description: 'some description'
      });

      assert.deepEqual(tag("@param {(String|Array<foo>)} [val=['foo']] some description"), {
        key: '@param',
        rawType: '{(String|Array<foo>)}',
        name: '[val=[\'foo\']]',
        description: 'some description'
      });
    });

    it('should tokenize a multi-line tag', function() {
      assert.deepEqual(tag('{string|\n number} userName\n }}'), {
        key: '',
        rawType: '{string|\n number}',
        name: 'userName',
        description: ''
      });

      assert.deepEqual(tag('{string|\n number} userName\nFoo bar baz }}'), {
        key: '',
        rawType: '{string|\n number}',
        name: 'userName',
        description: 'Foo bar baz '
      });
    });
  });

  describe('type', function() {
    it('should tokenize type', function() {
      assert.deepEqual(tag('{String}'), {
        key: '',
        rawType: '{String}',
        name: '',
        description: ''
      });

      assert.deepEqual(tag("{foo}"), {
        key: '',
        rawType: '{foo}',
        name: '',
        description: ''
      });
    });
  });

  describe('name', function() {
    it('should tokenize name', function() {
      assert.deepEqual(tag('foo'), {
        key: '',
        rawType: '',
        name: 'foo',
        description: ''
      });
    });

    it('should tokenize nested optional name with default', function() {
      assert.deepEqual(tag("[val=['foo']]"), {
        key: '',
        rawType: '',
        name: '[val=[\'foo\']]',
        description: ''
      });
    });

    it('should tokenize optional name', function() {
      assert.deepEqual(tag("[val=['foo']]"), {
        key: '',
        rawType: '',
        name: '[val=[\'foo\']]',
        description: ''
      });

      assert.deepEqual(tag("[val=foo]"), {
        key: '',
        rawType: '',
        name: '[val=foo]',
        description: ''
      });

      assert.deepEqual(tag("[val = foo]"), {
        key: '',
        rawType: '',
        name: '[val = foo]',
        description: ''
      });

      assert.deepEqual(tag("(val=foo)"), {
        key: '',
        rawType: '',
        name: '(val=foo)',
        description: ''
      });

      assert.deepEqual(tag("([val={foo}])"), {
        key: '',
        rawType: '',
        name: '([val={foo}])',
        description: ''
      });

      assert.deepEqual(tag("[val={foo}]"), {
        key: '',
        rawType: '',
        name: '[val={foo}]',
        description: ''
      });

      assert.deepEqual(tag("`val=foo`"), {
        key: '',
        rawType: '',
        name: '`val=foo`',
        description: ''
      });

      assert.deepEqual(tag("`val = foo`"), {
        key: '',
        rawType: '',
        name: '`val = foo`',
        description: ''
      });
    });
  });

  describe('type and name', function() {
    it('should tokenize record type and name', function() {
      assert.deepEqual(tag('{{foo: bar, baz}} qux'), {
        key: '',
        rawType: '{{foo: bar, baz}}',
        name: 'qux',
        description: ''
      });
    });

    it('should tokenize union type and name', function() {
      assert.deepEqual(tag('{(string|array)} qux'), {
        key: '',
        rawType: '{(string|array)}',
        name: 'qux',
        description: ''
      });
    });

    it('should tokenize type and optional name', function() {
      assert.deepEqual(tag('{(string|array)} [qux]'), {
        key: '',
        rawType: '{(string|array)}',
        name: '[qux]',
        description: ''
      });
    });

    it('should tokenize name with backticks', function() {
      assert.deepEqual(tag('{String|Array} `qux`'), {
        key: '',
        rawType: '{String|Array}',
        name: '`qux`',
        description: ''
      });
    });

    it('should tokenize type and optional name with default', function() {
      assert.deepEqual(tag('{(string|array)} [qux=bar]'), {
        key: '',
        rawType: '{(string|array)}',
        name: '[qux=bar]',
        description: ''
      });
    });

    it('should tokenize type and optional name with spaces', function() {
      assert.deepEqual(tag('{(string|array)} [qux = bar]'), {
        key: '',
        rawType: '{(string|array)}',
        name: '[qux = bar]',
        description: ''
      });

      assert.deepEqual(tag('{(string|array)} [qux= bar]'), {
        key: '',
        rawType: '{(string|array)}',
        name: '[qux= bar]',
        description: ''
      });

      assert.deepEqual(tag('{(string|array)} [qux =bar]'), {
        key: '',
        rawType: '{(string|array)}',
        name: '[qux =bar]',
        description: ''
      });
    });
  });

  describe('name and description', function() {
    it('should tokenize name and description', function() {
      assert.deepEqual(tag('some description'), {
        key: '',
        rawType: '',
        name: 'some',
        description: 'description'
      });

      assert.deepEqual(tag('foo bar'), {
        key: '',
        rawType: '',
        name: 'foo',
        description: 'bar'
      });

      assert.deepEqual(tag('foo some description'), {
        key: '',
        rawType: '',
        name: 'foo',
        description: 'some description'
      });
    });

    it('should tokenize optional name and description', function() {
      assert.deepEqual(tag('[qux = bar] The description'), {
        key: '',
        rawType: '',
        name: '[qux = bar]',
        description: 'The description'
      });

      assert.deepEqual(tag('[qux=bar] The description'), {
        key: '',
        rawType: '',
        name: '[qux=bar]',
        description: 'The description'
      });
    });
  });

  describe('type, name and description', function() {
    it('should tokenize type, name and description', function() {
      assert.deepEqual(tag('{String} foo bar'), {
        key: '',
        rawType: '{String}',
        name: 'foo',
        description: 'bar'
      });
    });

    it('should tokenize type, optional name with spaces and description', function() {
      assert.deepEqual(tag('{(string|array)} [qux = bar] The description'), {
        key: '',
        rawType: '{(string|array)}',
        name: '[qux = bar]',
        description: 'The description'
      });

      assert.deepEqual(tag("{Array<String>} [val= foo] some description"), {
        key: '',
        rawType: '{Array<String>}',
        name: '[val= foo]',
        description: 'some description'
      });
    });
  });
});
