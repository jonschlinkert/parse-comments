'use strict';

require('mocha');
var assert = require('assert');
var tag = require('../lib/parse/tag');

describe('tokenize-tag', () => {
  describe('empty', () => {
    it('should return null when an empty string is passed', () => {
      assert.deepEqual(tag(''), {
        description: '',
        key: '',
        title: '',
        rawType: '',
        name: ''
      });

      assert.deepEqual(tag(' '), {
        description: '',
        key: '',
        title: '',
        rawType: '',
        name: ''
      });
    });
  });

  describe('tags', () => {
    it('should tokenize a tag', () => {
      assert.deepEqual(tag('@param {String|Array} foo This is a description'), {
        key: '@param',
        title: 'param',
        rawType: '{String|Array}',
        name: 'foo',
        description: 'This is a description'
      });
    });

    it('should tokenize tag with nested optional name with default', () => {
      assert.deepEqual(tag('@param {String|Array} [val=[\'foo\']] some description'), {
        key: '@param',
        title: 'param',
        rawType: '{String|Array}',
        name: '[val=[\'foo\']]',
        description: 'some description'
      });

      assert.deepEqual(tag('{String|Array} [val=[\'foo\']] some description'), {
        key: '',
        title: '',
        rawType: '{String|Array}',
        name: '[val=[\'foo\']]',
        description: 'some description'
      });

      assert.deepEqual(tag('{(String|Array)} [val=[\'foo\']] some description'), {
        key: '',
        title: '',
        rawType: '{(String|Array)}',
        name: '[val=[\'foo\']]',
        description: 'some description'
      });

      assert.deepEqual(tag("@param {(String|Array<foo>)} [val=['foo']] some description"), {
        key: '@param',
        title: 'param',
        rawType: '{(String|Array<foo>)}',
        name: '[val=[\'foo\']]',
        description: 'some description'
      });
    });

    it('should tokenize a multi-line tag', () => {
      assert.deepEqual(tag('{string|\n number} userName\n }}'), {
        key: '',
        title: '',
        rawType: '{string|\n number}',
        name: 'userName',
        description: ''
      });

      assert.deepEqual(tag('{string|\n number} userName\nFoo bar baz }}'), {
        key: '',
        title: '',
        rawType: '{string|\n number}',
        name: 'userName',
        description: 'Foo bar baz '
      });
    });
  });

  describe('type', () => {
    it('should tokenize type', () => {
      assert.deepEqual(tag('{String}'), {
        key: '',
        title: '',
        rawType: '{String}',
        name: '',
        description: ''
      });

      assert.deepEqual(tag('{foo}'), {
        key: '',
        title: '',
        rawType: '{foo}',
        name: '',
        description: ''
      });
    });
  });

  describe('name', () => {
    it('should tokenize name', () => {
      assert.deepEqual(tag('foo'), {
        key: '',
        title: '',
        rawType: '',
        name: 'foo',
        description: ''
      });
    });

    it('should tokenize nested optional name with default', () => {
      assert.deepEqual(tag("[val=['foo']]"), {
        key: '',
        title: '',
        rawType: '',
        name: '[val=[\'foo\']]',
        description: ''
      });
    });

    it('should tokenize optional name', () => {
      assert.deepEqual(tag("[val=['foo']]"), {
        key: '',
        title: '',
        rawType: '',
        name: '[val=[\'foo\']]',
        description: ''
      });

      assert.deepEqual(tag('[val=foo]'), {
        key: '',
        title: '',
        rawType: '',
        name: '[val=foo]',
        description: ''
      });

      assert.deepEqual(tag('[val = foo]'), {
        key: '',
        title: '',
        rawType: '',
        name: '[val = foo]',
        description: ''
      });

      assert.deepEqual(tag('(val=foo)'), {
        key: '',
        title: '',
        rawType: '',
        name: '(val=foo)',
        description: ''
      });

      assert.deepEqual(tag('([val={foo}])'), {
        key: '',
        title: '',
        rawType: '',
        name: '([val={foo}])',
        description: ''
      });

      assert.deepEqual(tag('[val={foo}]'), {
        key: '',
        title: '',
        rawType: '',
        name: '[val={foo}]',
        description: ''
      });

      assert.deepEqual(tag('`val=foo`'), {
        key: '',
        title: '',
        rawType: '',
        name: '`val=foo`',
        description: ''
      });

      assert.deepEqual(tag('`val = foo`'), {
        key: '',
        title: '',
        rawType: '',
        name: '`val = foo`',
        description: ''
      });
    });
  });

  describe('type and name', () => {
    it('should tokenize record type and name', () => {
      assert.deepEqual(tag('{{foo: bar, baz}} qux'), {
        key: '',
        title: '',
        rawType: '{{foo: bar, baz}}',
        name: 'qux',
        description: ''
      });
    });

    it('should tokenize union type and name', () => {
      assert.deepEqual(tag('{(string|array)} qux'), {
        key: '',
        title: '',
        rawType: '{(string|array)}',
        name: 'qux',
        description: ''
      });
    });

    it('should tokenize type and optional name', () => {
      assert.deepEqual(tag('{(string|array)} [qux]'), {
        key: '',
        title: '',
        rawType: '{(string|array)}',
        name: '[qux]',
        description: ''
      });
    });

    it('should tokenize name with backticks', () => {
      assert.deepEqual(tag('{String|Array} `qux`'), {
        key: '',
        title: '',
        rawType: '{String|Array}',
        name: '`qux`',
        description: ''
      });
    });

    it('should tokenize type and optional name with default', () => {
      assert.deepEqual(tag('{(string|array)} [qux=bar]'), {
        key: '',
        title: '',
        rawType: '{(string|array)}',
        name: '[qux=bar]',
        description: ''
      });
    });

    it('should tokenize type and optional name with spaces', () => {
      assert.deepEqual(tag('{(string|array)} [qux = bar]'), {
        key: '',
        title: '',
        rawType: '{(string|array)}',
        name: '[qux = bar]',
        description: ''
      });

      assert.deepEqual(tag('{(string|array)} [qux= bar]'), {
        key: '',
        title: '',
        rawType: '{(string|array)}',
        name: '[qux= bar]',
        description: ''
      });

      assert.deepEqual(tag('{(string|array)} [qux =bar]'), {
        key: '',
        title: '',
        rawType: '{(string|array)}',
        name: '[qux =bar]',
        description: ''
      });
    });
  });

  describe('name and description', () => {
    it('should tokenize name and description', () => {
      assert.deepEqual(tag('some description'), {
        key: '',
        title: '',
        rawType: '',
        name: 'some',
        description: 'description'
      });

      assert.deepEqual(tag('foo bar'), {
        key: '',
        title: '',
        rawType: '',
        name: 'foo',
        description: 'bar'
      });

      assert.deepEqual(tag('foo some description'), {
        key: '',
        title: '',
        rawType: '',
        name: 'foo',
        description: 'some description'
      });
    });

    it('should tokenize optional name and description', () => {
      assert.deepEqual(tag('[qux = bar] The description'), {
        key: '',
        title: '',
        rawType: '',
        name: '[qux = bar]',
        description: 'The description'
      });

      assert.deepEqual(tag('[qux=bar] The description'), {
        key: '',
        title: '',
        rawType: '',
        name: '[qux=bar]',
        description: 'The description'
      });
    });
  });

  describe('type, name and description', () => {
    it('should tokenize type, name and description', () => {
      assert.deepEqual(tag('{String} foo bar'), {
        key: '',
        title: '',
        rawType: '{String}',
        name: 'foo',
        description: 'bar'
      });
    });

    it('should tokenize type, optional name with spaces and description', () => {
      assert.deepEqual(tag('{(string|array)} [qux = bar] The description'), {
        key: '',
        title: '',
        rawType: '{(string|array)}',
        name: '[qux = bar]',
        description: 'The description'
      });

      assert.deepEqual(tag('{Array<String>} [val= foo] some description'), {
        key: '',
        title: '',
        rawType: '{Array<String>}',
        name: '[val= foo]',
        description: 'some description'
      });
    });
  });
});
