'use strict';

require('mocha');
var assert = require('assert');
var Comments = require('..');
var comments;

describe('javadoc', () => {
  beforeEach(function() {
    comments = new Comments();
  });

  it('should tokenize javadoc code examples', () => {
    var tok = comments.tokenize([
      '/**',
      ' * foo bar baz',
      ' * ',
      ' * @example',
      ' * var foo = "bar";',
      ' *',
      ' * @param {string} something',
      ' * @param {string} else',
      ' */'
    ].join('\n'));

    assert.deepEqual(tok, {
      description: 'foo bar baz',
      footer: '',
      examples: [{
        type: 'javadoc',
        language: '',
        description: '',
        raw: '@example\nvar foo = "bar";\n',
        value: '\nvar foo = "bar";\n'
      }],
      tags: [{
        type: 'tag',
        raw: '@param {string} something',
        key: 'param',
        value: '{string} something'
      }, {
        type: 'tag',
        raw: '@param {string} else',
        key: 'param',
        value: '{string} else'
      }]
    });
  });

  it('should preserve indentation in javadoc code examples', () => {
    var tok = comments.tokenize([
      '/**',
      ' * foo bar baz',
      ' * ',
      ' * @example',
      ' *    var foo = "bar";',
      ' *    var baz = "qux";',
      ' *',
      ' * @param {string} something',
      ' * @param {string} else',
      ' */'
    ].join('\n'));

    assert.deepEqual(tok, {
      description: 'foo bar baz',
      footer: '',
      examples: [{
        type: 'javadoc',
        language: '',
        description: '',
        raw: '@example\n   var foo = "bar";\n   var baz = "qux";\n',
        value: '\n   var foo = "bar";\n   var baz = "qux";\n'
      }],
      tags: [{
        type: 'tag',
        raw: '@param {string} something',
        key: 'param',
        value: '{string} something'
      }, {
        type: 'tag',
        raw: '@param {string} else',
        key: 'param',
        value: '{string} else'
      }]
    });
  });

  it('should detect a description for a javadoc code example', () => {
    var tok = comments.tokenize([
      '/**',
      ' * foo bar baz',
      ' * ',
      ' * This is a description for an example.',
      ' * @example',
      ' * var foo = "bar";',
      ' * var baz = "qux";',
      ' *',
      ' * @param {string} something',
      ' * @param {string} else',
      ' */'
    ].join('\n'));

    assert.deepEqual(tok, {
      description: 'foo bar baz',
      footer: '',
      examples: [{
        type: 'javadoc',
        language: '',
        description: 'This is a description for an example.',
        raw: '@example\nvar foo = "bar";\nvar baz = "qux";\n',
        value: '\nvar foo = "bar";\nvar baz = "qux";\n'
      }],
      tags: [{
        type: 'tag',
        raw: '@param {string} something',
        key: 'param',
        value: '{string} something'
      }, {
        type: 'tag',
        raw: '@param {string} else',
        key: 'param',
        value: '{string} else'
      }]
    });
  });

  it('should detect a description & leading newline for a javadoc example', () => {
    var tok = comments.tokenize([
      '/**',
      ' * foo bar baz',
      ' * ',
      ' * This is a description for an example.',
      ' *',
      ' * @example',
      ' * var foo = "bar";',
      ' * var baz = "qux";',
      ' *',
      ' * @param {string} something',
      ' * @param {string} else',
      ' */'
    ].join('\n'));

    assert.deepEqual(tok, {
      description: 'foo bar baz',
      footer: '',
      examples: [{
        type: 'javadoc',
        language: '',
        description: 'This is a description for an example.',
        raw: '@example\nvar foo = "bar";\nvar baz = "qux";\n',
        value: '\nvar foo = "bar";\nvar baz = "qux";\n'
      }],
      tags: [{
        type: 'tag',
        raw: '@param {string} something',
        key: 'param',
        value: '{string} something'
      }, {
        type: 'tag',
        raw: '@param {string} else',
        key: 'param',
        value: '{string} else'
      }]
    });
  });
});
