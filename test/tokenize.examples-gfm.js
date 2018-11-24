'use strict';

require('mocha');
var assert = require('assert');
var support = require('./support');
var Comments = require('..');
var comments;

var fixtures = support.files(__dirname, 'fixtures');

describe('gfm', () => {
  beforeEach(function() {
    comments = new Comments();
  });

  it('should tokenize gfm code examples', () => {
    var tok = comments.tokenize([
      '/**',
      ' * foo bar baz',
      ' * ',
      ' * ```js',
      ' * var foo = "bar";',
      ' * ```',
      ' *',
      ' * @param {string} something',
      ' * @param {string} else',
      ' */'
    ].join('\n'));

    assert.deepEqual(tok, {
      description: 'foo bar baz',
      footer: '',
      examples: [
        {
          type: 'gfm',
          language: 'js',
          description: '',
          raw: '```js\nvar foo = "bar";\n```',
          value: '\nvar foo = "bar";\n'
        }
      ],
      tags: [
        {
          type: 'tag',
          raw: '@param {string} something',
          key: 'param',
          value: '{string} something'
        },
        {
          type: 'tag',
          raw: '@param {string} else',
          key: 'param',
          value: '{string} else'
        }
      ]
    });
  });

  it('should preserve indentation in gfm code examples', () => {
    var tok = comments.tokenize([
      '/**',
      ' * foo bar baz',
      ' * ',
      ' * ```js',
      ' *    var foo = "bar";',
      ' *    var baz = "qux";',
      ' * ```',
      ' *',
      ' * @param {string} something',
      ' * @param {string} else',
      ' */'
    ].join('\n'));

    assert.deepEqual(tok, {
      description: 'foo bar baz',
      footer: '',
      examples: [
        {
          type: 'gfm',
          language: 'js',
          description: '',
          raw: '```js\n   var foo = "bar";\n   var baz = "qux";\n```',
          value: '\n   var foo = "bar";\n   var baz = "qux";\n'
        }
      ],
      tags: [
        {
          type: 'tag',
          raw: '@param {string} something',
          key: 'param',
          value: '{string} something'
        },
        {
          type: 'tag',
          raw: '@param {string} else',
          key: 'param',
          value: '{string} else'
        }
      ]
    });
  });

  it('should detect a description for a gfm code example', () => {
    var tok = comments.tokenize([
      '/**',
      ' * foo bar baz',
      ' * ',
      ' * This is a description for an example.',
      ' * ```js',
      ' * var foo = "bar";',
      ' * var baz = "qux";',
      ' * ```',
      ' *',
      ' * @param {string} something',
      ' * @param {string} else',
      ' */'
    ].join('\n'));

    assert.deepEqual(tok, {
      description: 'foo bar baz',
      footer: '',
      examples: [
        {
          type: 'gfm',
          language: 'js',
          description: 'This is a description for an example.',
          raw: '```js\nvar foo = "bar";\nvar baz = "qux";\n```',
          value: '\nvar foo = "bar";\nvar baz = "qux";\n'
        }
      ],
      tags: [
        {
          type: 'tag',
          raw: '@param {string} something',
          key: 'param',
          value: '{string} something'
        },
        {
          type: 'tag',
          raw: '@param {string} else',
          key: 'param',
          value: '{string} else'
        }
      ]
    });
  });

  it('should detect a description & leading newline for a gfm example', () => {
    var tok = comments.tokenize([
      '/**',
      ' * foo bar baz',
      ' * ',
      ' * This is a description for an example.',
      ' *',
      ' * ```js',
      ' * var foo = "bar";',
      ' * var baz = "qux";',
      ' * ```',
      ' *',
      ' * @param {string} something',
      ' * @param {string} else',
      ' */'
    ].join('\n'));

    assert.deepEqual(tok, {
      description: 'foo bar baz',
      footer: '',
      examples: [
        {
          type: 'gfm',
          language: 'js',
          description: 'This is a description for an example.',
          raw: '```js\nvar foo = "bar";\nvar baz = "qux";\n```',
          value: '\nvar foo = "bar";\nvar baz = "qux";\n'
        }
      ],
      tags: [
        {
          type: 'tag',
          raw: '@param {string} something',
          key: 'param',
          value: '{string} something'
        },
        {
          type: 'tag',
          raw: '@param {string} else',
          key: 'param',
          value: '{string} else'
        }
      ]
    });
  });

  it('should support gfm examples without extra leading/trailing newlines', () => {
    var tok = comments.tokenize([
      '/**',
      ' * foo bar baz',
      ' * ',
      ' * This is a description for an example.',
      ' * ```js',
      ' * var foo = "bar";',
      ' * var baz = "qux";',
      ' * ```',
      ' * @param {string} something',
      ' * @param {string} else',
      ' */'
    ].join('\n'));

    assert.deepEqual(tok, {
      description: 'foo bar baz',
      footer: '',
      examples: [
        {
          type: 'gfm',
          language: 'js',
          description: 'This is a description for an example.',
          raw: '```js\nvar foo = "bar";\nvar baz = "qux";\n```',
          value: '\nvar foo = "bar";\nvar baz = "qux";\n'
        }
      ],
      tags: [
        {
          type: 'tag',
          raw: '@param {string} something',
          key: 'param',
          value: '{string} something'
        },
        {
          type: 'tag',
          raw: '@param {string} else',
          key: 'param',
          value: '{string} else'
        }
      ]
    });
  });

  it('should work when no stars prefix the gfm example', () => {
    var tok = comments.tokenize(fixtures['examples-gfm-no-stars']);

    assert.deepEqual(tok, {
      description: 'Invokes the `iterator` function once for each item in `obj` collection, which can be either an\n object or an array. The `iterator` function is invoked with `iterator(value, key, obj)`, where `value`\n is the value of an object property or an array element, `key` is the object property key or\n array element index and obj is the `obj` itself. Specifying a `context` for the function is optional.\n\n It is worth noting that `.forEach` does not iterate over inherited properties because it filters\n using the `hasOwnProperty` method.',
      footer: '',
      examples: [{
        type: 'gfm',
        language: 'js',
        description: 'Unlike ES262\'s\n [Array.prototype.forEach](http://www.ecma-international.org/ecma-262/5.1/#sec-15.4.4.18),\n Providing \'undefined\' or \'null\' values for `obj` will not throw a TypeError, but rather just\n return the value provided.',
        raw: '   ```js\n     var values = {name: \'misko\', gender: \'male\'};\n     var log = [];\n     angular.forEach(values, function(value, key) {\n       this.push(key + \': \' + value);\n     }, log);\n     expect(log).toEqual([\'name: misko\', \'gender: male\']);\n   ```',
        value: '\n  var values = {name: \'misko\', gender: \'male\'};\n  var log = [];\n  angular.forEach(values, function(value, key) {\n    this.push(key + \': \' + value);\n  }, log);\n  expect(log).toEqual([\'name: misko\', \'gender: male\']);\n'
      }],
      tags: [{
        type: 'tag',
        raw: '@ngdoc function',
        key: 'ngdoc',
        value: 'function'
      }, {
        type: 'tag',
        raw: '@name angular.forEach',
        key: 'name',
        value: 'angular.forEach'
      }, {
        type: 'tag',
        raw: '@module ng',
        key: 'module',
        value: 'ng'
      }, {
        type: 'tag',
        raw: '@kind function',
        key: 'kind',
        value: 'function'
      }, {
        type: 'tag',
        raw: '@param {Object|Array} obj Object to iterate over.',
        key: 'param',
        value: '{Object|Array} obj Object to iterate over.'
      }, {
        type: 'tag',
        raw: '@param {Function} iterator Iterator function.',
        key: 'param',
        value: '{Function} iterator Iterator function.'
      }, {
        type: 'tag',
        raw: '@param {Object=} context Object to become context (`this`) for the iterator function.',
        key: 'param',
        value: '{Object=} context Object to become context (`this`) for the iterator function.'
      }, {
        type: 'tag',
        raw: '@returns {Object|Array} Reference to `obj`.',
        key: 'returns',
        value: '{Object|Array} Reference to `obj`.'
      }]
    });
  });
});
