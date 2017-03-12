'use strict';

require('mocha');
var assert = require('assert');
var extract = require('extract-comments');
var support = require('./support');
var Comments = require('..');
var comments;

var fixtures = support.files(__dirname, 'fixtures');

describe('examples', function() {
  beforeEach(function() {
    comments = new Comments();
  });

  it('should tokenize gfm, indented or javadoc examples', function() {
    var tok = comments.tokenize(fixtures['examples-multiple']);

    assert.deepEqual(tok, {
      description: 'This is a comment with\nseveral lines of text.',
      footer: '',
      examples: [
        {
          type: 'gfm',
          language: 'js',
          description: 'An example',
          raw: '```js\nvar foo = bar;\nvar foo = bar;\nvar foo = bar;\n```',
          val: '\nvar foo = bar;\nvar foo = bar;\nvar foo = bar;\n'
        },
        {
          type: 'indented',
          language: '',
          description: 'Another example',
          raw: '    var baz = fez;\n    var baz = fez;\n    var baz = fez;\n',
          val: 'var baz = fez;\nvar baz = fez;\nvar baz = fez;\n'
        },
        {
          type: 'indented',
          language: '',
          description: 'Another example',
          raw: '    var baz = fez;\n    var baz = fez;\n',
          val: 'var baz = fez;\nvar baz = fez;\n'
        },
        {
          type: 'gfm',
          language: 'js',
          description: 'And another example',
          raw: '```js\nvar foo = bar;\nvar foo = bar;\n```',
          val: '\nvar foo = bar;\nvar foo = bar;\n'
        },
        {
          type: 'javadoc',
          language: '',
          description: 'Another example',
          raw: '@example\nvar baz = fez;\n',
          val: '\nvar baz = fez;\n'
        },
        {
          type: 'javadoc',
          language: '',
          description: '',
          raw: '@example\n// this is a comment\nvar alalla = zzzz;\n',
          val: '\n// this is a comment\nvar alalla = zzzz;\n'
        }
      ],
      tags: [
        {
          type: 'tag',
          raw: '@param {String} foo bar',
          key: 'param',
          val: '{String} foo bar'
        },
        {
          type: 'tag',
          raw: '@returns {Object} Instance of Foo',
          key: 'returns',
          val: '{Object} Instance of Foo'
        },
        {
          type: 'tag',
          raw: '@api public',
          key: 'api',
          val: 'public'
        }
      ]
    });
  });

  it('should work with arbitrary markdown', function() {
    var tok = comments.tokenize(fixtures.markdown);

    assert.deepEqual(tok, {
      description: 'Set a parser that can later be used to parse any given string.',
      footer: 'This is arbitrary text.\n\n  * This is arbitrary text.\n  * This is arbitrary text.\n  * This is arbitrary text.\n\n**Example**\n\n{%= docs("example-parser.md") %}\n\nThis is a another description after the example.',
      examples: [{
        type: 'gfm',
        language: 'js',
        description: '',
        raw: '```js\n// foo.parser(name, replacements)\nfoo.parser("foo", function (a, b, c) {\n    // body...\n})\n```',
        val: '\n// foo.parser(name, replacements)\nfoo.parser("foo", function (a, b, c) {\n    // body...\n})\n'
      }],
      tags: [{
        type: 'tag',
        raw: '@param {String} `alpha`',
        key: 'param',
        val: '{String} `alpha`'
      }, {
        type: 'tag',
        raw: '@param {Object|Array} `arr` Object or array of replacement patterns to associate.',
        key: 'param',
        val: '{Object|Array} `arr` Object or array of replacement patterns to associate.'
      }, {
        type: 'tag',
        raw: '@property {String|RegExp} [arr] `pattern`',
        key: 'property',
        val: '{String|RegExp} [arr] `pattern`'
      }, {
        type: 'tag',
        raw: '@property {String|Function} [arr] `replacement`',
        key: 'property',
        val: '{String|Function} [arr] `replacement`'
      }, {
        type: 'tag',
        raw: '@param {String} `beta`',
        key: 'param',
        val: '{String} `beta`'
      }, {
        type: 'tag',
        raw: '@property {Array} [beta] `foo` This is foo option.',
        key: 'property',
        val: '{Array} [beta] `foo` This is foo option.'
      }, {
        type: 'tag',
        raw: '@property {Array} [beta] `bar` This is bar option',
        key: 'property',
        val: '{Array} [beta] `bar` This is bar option'
      }, {
        type: 'tag',
        raw: '@return {Strings} to allow chaining',
        key: 'return',
        val: '{Strings} to allow chaining'
      }, {
        type: 'tag',
        raw: '@api public',
        key: 'api',
        val: 'public'
      }]
    });
  });
});
