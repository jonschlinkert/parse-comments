'use strict';

require('mocha');
const assert = require('assert');
const Comments = require('..');
let comments;

/**
 * Some of these tests are based on tests from doctrine
 * https://github.com/eslint/doctrine/LICENSE.BSD
 * https://github.com/eslint/doctrine/LICENSE.closure-compiler
 * https://github.com/eslint/doctrine/LICENSE.esprima
 */

describe('parse inline tags', () => {
  beforeEach(function() {
    comments = new Comments();
  });

  describe('comment description', () => {
    it('should ignore inline tags that are wrapped with backticks', () => {
      let res = comments.parse([
          '/**',
          ' * Prevents the default action. It is equivalent to',
          ' * `{@code e.preventDefault()}`, but can be used as the callback argument of',
          ' * `{@link goog.events.listen}` without declaring another function.',
          ' * @param {!goog.events.Event} e An event.',
          ' */'
        ].join('\n'), { unwrap: true });

      assert.equal(res[0].description, 'Prevents the default action. It is equivalent to\n`{@code e.preventDefault()}`, but can be used as the callback argument of\n`{@link goog.events.listen}` without declaring another function.');
      assert.deepEqual(res[0].tags, [
        {
          title: 'param',
          description: 'An event.',
          inlineTags: [],
          type: {
            type: 'NonNullableType',
            expression: {
              type: 'NameExpression',
              name: 'goog.events.Event'
            },
            prefix: true
          },
          name: 'e'
        }
      ]);

      assert.deepEqual(res[0].inlineTags, []);
    });

    it('should parse inline tags from comment description', () => {
      let res = comments.parse(['/**',
        ' * Prevents the default action. It is equivalent to',
        ' * {@code e.preventDefault()}, but can be used as the callback argument of',
        ' * {@link goog.events.listen} without declaring another function.',
        ' * @param {!goog.events.Event} e An event.',
        ' */'
      ].join('\n'), {unwrap: true });

      assert.equal(res[0].description, 'Prevents the default action. It is equivalent to\n{@code e.preventDefault()}, but can be used as the callback argument of\n{@link goog.events.listen} without declaring another function.');
      assert.deepEqual(res[0].tags, [
        {
          title: 'param',
          description: 'An event.',
          inlineTags: [],
          type: {
            type: 'NonNullableType',
            expression: {
              type: 'NameExpression',
              name: 'goog.events.Event'
            },
            prefix: true
          },
          name: 'e'
        }
      ]);

      assert.deepEqual(res[0].inlineTags, [
        {
          raw: '{@code e.preventDefault()}',
          name: 'code',
          value: 'e.preventDefault()'
        },
        {
          raw: '{@link goog.events.listen}',
          name: 'link',
          value: 'goog.events.listen'
        }
      ]);
    });

    it('should use custom replacer to update description', () => {
      let res = comments.parse([
          '/**',
          ' * Prevents the default action. It is equivalent to',
          ' * {@code e.preventDefault()}, but can be used as the callback argument of',
          ' * {@link goog.events.listen} without declaring another function.',
          ' * @param {!goog.events.Event} e An event.',
          ' */'
        ].join('\n'), {
          unwrap: true,
          replaceInlineTag: function(tag) {
            return '{{' + tag.name + ' "' + tag.value + '"}}';
          }
        });

      assert.equal(res[0].description, 'Prevents the default action. It is equivalent to\n{{code "e.preventDefault()"}}, but can be used as the callback argument of\n{{link "goog.events.listen"}} without declaring another function.');

      assert.deepEqual(res[0].tags, [
        {
          title: 'param',
          description: 'An event.',
          inlineTags: [],
          type: {
            type: 'NonNullableType',
            expression: {
              type: 'NameExpression',
              name: 'goog.events.Event'
            },
            prefix: true
          },
          name: 'e'
        }
      ]);

      assert.deepEqual(res[0].inlineTags, [
        {
          raw: '{@code e.preventDefault()}',
          name: 'code',
          value: 'e.preventDefault()'
        },
        {
          raw: '{@link goog.events.listen}',
          name: 'link',
          value: 'goog.events.listen'
        }
      ]);
    });

    it('should use specified replacer to update description', () => {
      let res = comments.parse([
          '/**',
          ' * Prevents the default action. It is equivalent to',
          ' * {@code e.preventDefault()}, but can be used as the callback argument of',
          ' * {@link goog.events.listen} without declaring another function.',
          ' * @param {!goog.events.Event} e An event.',
          ' */'
        ].join('\n'), {
          unwrap: true,
          replaceInlineTag: 'handlebars'
        });

      assert.equal(res[0].description, 'Prevents the default action. It is equivalent to\n{{code "e.preventDefault()"}}, but can be used as the callback argument of\n{{link "goog.events.listen"}} without declaring another function.');

      assert.deepEqual(res[0].tags, [
        {
          title: 'param',
          description: 'An event.',
          inlineTags: [],
          type: {
            type: 'NonNullableType',
            expression: {
              type: 'NameExpression',
              name: 'goog.events.Event'
            },
            prefix: true
          },
          name: 'e'
        }
      ]);

      assert.deepEqual(res[0].inlineTags, [
        {
          raw: '{@code e.preventDefault()}',
          name: 'code',
          value: 'e.preventDefault()'
        },
        {
          raw: '{@link goog.events.listen}',
          name: 'link',
          value: 'goog.events.listen'
        }
      ]);
    });
  });

  describe('tag description', () => {
    it('should parse inline tags in tag descriptions', () => {
      let res = comments.parse([
          '/**',
          ' * Prevents the default action. It is equivalent to',
          ' * @param {!goog.events.Event} e An event.',
          ' * {@code e.preventDefault()}, but can be used as the callback argument of',
          ' * {@link goog.events.listen} without declaring another function.',
          ' */'
        ].join('\n'), { unwrap: true });

      assert.equal(res[0].description, 'Prevents the default action. It is equivalent to');
      assert.deepEqual(res[0].tags, [
        {
          title: 'param',
          description:
            'An event.\n{@code e.preventDefault()}, but can be used as the callback argument of\n{@link goog.events.listen} without declaring another function.',
          inlineTags: [
            {
              name: 'code',
              raw: '{@code e.preventDefault()}',
              value: 'e.preventDefault()'
            },
            {
              name: 'link',
              raw: '{@link goog.events.listen}',
              value: 'goog.events.listen'
            }
          ],
          type: {
            type: 'NonNullableType',
            expression: {
              type: 'NameExpression',
              name: 'goog.events.Event'
            },
            prefix: true
          },
          name: 'e'
        }
      ]);
    });

    it('should use specified replacer function to update tag description', () => {
      let res = comments.parse([
          '/**',
          ' * Prevents the default action. It is equivalent to',
          ' * @param {!goog.events.Event} e An event.',
          ' * {@code e.preventDefault()}, but can be used as the callback argument of',
          ' * {@link goog.events.listen} without declaring another function.',
          ' */'
        ].join('\n'), {
          unwrap: true,
          replaceInlineTag: 'handlebars'
        });

      assert.equal(res[0].description, 'Prevents the default action. It is equivalent to');
      assert.deepEqual(res[0].tags, [
        {
          title: 'param',
          description:
            'An event.\n{{code "e.preventDefault()"}}, but can be used as the callback argument of\n{{link "goog.events.listen"}} without declaring another function.',
          inlineTags: [
            {
              name: 'code',
              raw: '{@code e.preventDefault()}',
              value: 'e.preventDefault()'
            },
            {
              name: 'link',
              raw: '{@link goog.events.listen}',
              value: 'goog.events.listen'
            }
          ],
          type: {
            type: 'NonNullableType',
            expression: {
              type: 'NameExpression',
              name: 'goog.events.Event'
            },
            prefix: true
          },
          name: 'e'
        }
      ]);
    });

    it('should use custom replacer function to update tag description', () => {
      const res = comments.parse([
          '/**',
          ' * Prevents the default action. It is equivalent to',
          ' * @param {!goog.events.Event} e An event.',
          ' * {@code e.preventDefault()}, but can be used as the callback argument of',
          ' * {@link goog.events.listen} without declaring another function.',
          ' */'
        ].join('\n'), {
          unwrap: true,
          replaceInlineTag: function(tag) {
            return `{{${tag.name} "${tag.value}"}}`;
          }
        });

      assert.equal(res[0].description, 'Prevents the default action. It is equivalent to');
      assert.deepEqual(res[0].tags, [
        {
          title: 'param',
          description:
            'An event.\n{{code "e.preventDefault()"}}, but can be used as the callback argument of\n{{link "goog.events.listen"}} without declaring another function.',
          inlineTags: [
            {
              name: 'code',
              raw: '{@code e.preventDefault()}',
              value: 'e.preventDefault()'
            },
            {
              name: 'link',
              raw: '{@link goog.events.listen}',
              value: 'goog.events.listen'
            }
          ],
          type: {
            type: 'NonNullableType',
            expression: {
              type: 'NameExpression',
              name: 'goog.events.Event'
            },
            prefix: true
          },
          name: 'e'
        }
      ]);
    });
  });
});
