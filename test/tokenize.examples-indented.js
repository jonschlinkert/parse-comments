'use strict';

require('mocha');
var assert = require('assert');
var Comments = require('..');
var comments;

describe('indented', () => {
  beforeEach(function() {
    comments = new Comments();
  });

  it('should tokenize indented code examples', () => {
    var tok = comments.tokenize([
      '/**',
      ' * Code:',
      ' *     @foo',
      ' *     @bar',
      ' *     @baz',
      ' */'
    ].join('\n'));

    assert.deepEqual(tok, {
      description: 'Code:',
      footer: '',
      examples: [{
        type: 'indented',
        language: '',
        description: '',
        raw: '    @foo\n    @bar\n    @baz\n',
        value: '@foo\n@bar\n@baz\n'
      }],
      tags: []
    });
  });

  it('should work with extra indentation', () => {
    var tok = comments.tokenize([
      '/**',
      ' *   Code:',
      ' *       @foo',
      ' *       @bar',
      ' *       @baz',
      ' */'
    ].join('\n'));

    assert.deepEqual(tok, {
      description: 'Code:',
      footer: '',
      examples: [{
        type: 'indented',
        language: '',
        description: '',
        raw: '    @foo\n    @bar\n    @baz\n',
        value: '@foo\n@bar\n@baz\n'
      }],
      tags: []
    });
  });

  it('should work with comments not prefixed by stars', () => {
    var tok = comments.tokenize([
      '',
      ' Code:',
      '     @foo',
      '     @bar',
      '     @baz',
      ''
    ].join('\n'));

    assert.deepEqual(tok, {
      description: 'Code:',
      footer: '',
      examples: [{
        type: 'indented',
        language: '',
        description: '',
        raw: '    @foo\n    @bar\n    @baz\n',
        value: '@foo\n@bar\n@baz\n'
      }],
      tags: []
    });
  });

  it('should tokenize single-line indented code examples', () => {
    var tok = comments.tokenize([
      '/**',
      ' * foo bar baz',
      ' * ',
      ' *     var foo = "bar";',
      ' *',
      ' * @param {string} something',
      ' * @param {string} else',
      ' */'
    ].join('\n'));

    assert.deepEqual(tok, {
      description: 'foo bar baz',
      footer: '',
      examples: [{
        type: 'indented',
        language: '',
        description: '',
        raw: '    var foo = "bar";\n',
        value: 'var foo = "bar";\n'
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

  it('should tokenize multi-line indented code examples', () => {
    var tok = comments.tokenize([
      '/**',
      ' * foo bar baz',
      ' * ',
      ' *     var foo = "bar";',
      ' *     var baz = "qux";',
      ' *',
      ' * @param {string} something',
      ' * @param {string} else',
      ' */'
    ].join('\n'));

    assert.deepEqual(tok, {
      description: 'foo bar baz',
      footer: '',
      examples: [{
        type: 'indented',
        language: '',
        description: '',
        raw: '    var foo = "bar";\n    var baz = "qux";\n',
        value: 'var foo = "bar";\nvar baz = "qux";\n'
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

  it('should work with multiple newlines', () => {
    var tok = comments.tokenize([
      '/**',
      ' * foo bar baz',
      ' * ',
      ' *     var foo = "bar";',
      ' * ',
      ' * ',
      ' * ',
      ' *     var baz = "qux";',
      ' *',
      ' * @param {string} something',
      ' * @param {string} else',
      ' */'
    ].join('\n'));

    assert.deepEqual(tok, {
      description: 'foo bar baz',
      footer: '',
      examples: [{
        type: 'indented',
        language: '',
        description: '',
        raw: '    var foo = \"bar\";\n\n\n\n    var baz = \"qux\";\n',
        value: 'var foo = \"bar\";\n\n\n\nvar baz = \"qux\";\n'
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

  it('should preserve indentation in indented code examples', () => {
    var tok = comments.tokenize([
      '/**',
      ' * foo bar baz',
      ' * ',
      ' *        var foo = "bar";',
      ' *        var baz = "qux";',
      ' *',
      ' * @param {string} something',
      ' * @param {string} else',
      ' */'
    ].join('\n'));

    assert.deepEqual(tok, {
      description: 'foo bar baz',
      footer: '',
      examples: [{
        type: 'indented',
        language: '',
        description: '',
        raw: '       var foo = "bar";\n       var baz = "qux";\n',
        value: '   var foo = "bar";\n   var baz = "qux";\n'
      }],
      tags: [{
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

  it('should detect a description for a indented code example', () => {
    var tok = comments.tokenize([
      '/**',
      ' * foo bar baz',
      ' * ',
      ' * This is a description for an example.',
      ' *     var foo = "bar";',
      ' *     var baz = "qux";',
      ' *',
      ' * @param {string} something',
      ' * @param {string} else',
      ' */'
    ].join('\n'));

    assert.deepEqual(tok, {
      description: 'foo bar baz',
      footer: '',
      examples: [{
        type: 'indented',
        language: '',
        description: 'This is a description for an example.',
        raw: '    var foo = "bar";\n    var baz = "qux";\n',
        value: 'var foo = "bar";\nvar baz = "qux";\n'
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

  it('should detect a description & leading newline for a indented example', () => {
    var tok = comments.tokenize([
      '/**',
      ' * foo bar baz',
      ' * ',
      ' * This is a description for an example.',
      ' *',
      ' *     var foo = "bar";',
      ' *     var baz = "qux";',
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
          type: 'indented',
          language: '',
          description: 'This is a description for an example.',
          raw: '    var foo = \"bar\";\n    var baz = \"qux\";\n',
          value: 'var foo = "bar";\nvar baz = "qux";\n'
        }
      ],
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
