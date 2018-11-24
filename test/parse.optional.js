'use strict';

require('mocha');
const pick = require('object.pick');
const assert = require('assert');
const doctrine = require('doctrine');
const Comments = require('..');
let comments;

/**
 * some of these unit tests are based on tests from doctrine
 * https://github.com/eslint/doctrine/LICENSE.BSD
 * https://github.com/eslint/doctrine/LICENSE.closure-compiler
 * https://github.com/eslint/doctrine/LICENSE.esprima
 */

describe('parse optional', () => {
  beforeEach(function() {
    comments = new Comments();
  });

  describe('optional params', () => {
    // should fail since sloppy option not set
    it('failure 0', () => {
      let res = comments.parseComment('/** * @param {String} [val] */', {
        unwrap: true,
        strict: true
      });

      assert.equal(res.tags.length, 0);
      assert.equal(res.description, '');
    });

    it('failure 1', () => {
      let res = comments.parseComment('/** * @param [val */', {
        unwrap: true,
        strict: false
      });

      assert.deepEqual(pick(res, ['tags', 'description']), {
        'description': '',
        'tags': []
      });
    });

    it('success 1', () => {
      let res = comments.parseComment(['/**', ' * @param {String} [val]', ' */'].join('\n'), {
        unwrap: true,
        strict: false
      });

      assert.deepEqual(pick(res, ['tags', 'description']), {
        'description': '',
        'tags': [{
          'title': 'param',
          'description': '',
          'type': {
            'type': 'OptionalType',
            'expression': {
              'type': 'NameExpression',
              'name': 'String'
            }
          },
          'name': 'val'
        }]
      });
    });

    it('success 2', () => {
      let res = comments.parseComment(['/**', ' * @param {String=} val', ' */'].join('\n'), {
        unwrap: true,
        strict: false
      });
      assert.deepEqual(pick(res, ['tags', 'description']), {
        'description': '',
        'tags': [{
          'title': 'param',
          'description': '',
          'type': {
            'type': 'OptionalType',
            'expression': {
              'type': 'NameExpression',
              'name': 'String'
            }
          },
          'name': 'val'
        }]
      });
    });

    it('success 3', () => {
      let res = comments.parseComment('/** * @param {String=} [val=abc] some description */', {
        unwrap: true,
        strict: false
      });

      assert.deepEqual(pick(res, ['tags', 'description']), {
        description: '',
        tags: [
          {
            title: 'param',
            description: 'some description',
            inlineTags: [],
            type: {
              type: 'OptionalType',
              expression: {
                type: 'NameExpression',
                name: 'String'
              }
            },
            name: 'val',
            default: 'abc'
          }
        ]
      });
    });

    it('success 4', () => {
      let res = comments.parseComment(['/**', ' * @param {String=} [val = abc] some description', ' */'].join('\n'), {
        unwrap: true,
        strict: false
      });

      assert.deepEqual(pick(res, ['tags', 'description']), {
        description: '',
        tags: [
          {
            title: 'param',
            description: 'some description',
            inlineTags: [],
            type: {
              type: 'OptionalType',
              expression: {
                type: 'NameExpression',
                name: 'String'
              }
            },
            name: 'val',
            default: 'abc'
          }
        ]
      });
    });

    it('default string', () => {
      let res = comments.parseComment(['/**', ' * @param {String} [val="foo"] some description', ' */'].join('\n'), {
        unwrap: true,
        strict: false
      });

      assert.deepEqual(pick(res, ['tags', 'description']), {
        description: '',
        tags: [
          {
            title: 'param',
            description: 'some description',
            inlineTags: [],
            type: {
              type: 'OptionalType',
              expression: {
                type: 'NameExpression',
                name: 'String'
              }
            },
            name: 'val',
            default: '"foo"'
          }
        ]
      });
    });

    it('default string surrounded by whitespace', () => {
      let res = comments.parseComment(['/**', " * @param {String} [val=   'foo'  ] some description", ' */'].join('\n'), {
        unwrap: true,
        strict: false
      });

      assert.deepEqual(pick(res, ['tags', 'description']), {
        description: '',
        tags: [
          {
            title: 'param',
            description: 'some description',
            inlineTags: [],
            type: {
              type: 'OptionalType',
              expression: {
                type: 'NameExpression',
                name: 'String'
              }
            },
            name: 'val',
            default: "'foo'"
          }
        ]
      });
    });

    it('should preserve whitespace in default string', () => {
      let res = comments.parseComment(['/**', ' * @param {String} [val=   "   foo"  ] some description', ' */'].join('\n'), {
        unwrap: true,
        strict: false
      });

      assert.deepEqual(pick(res, ['tags', 'description']), {
        description: '',
        tags: [
          {
            title: 'param',
            description: 'some description',
            inlineTags: [],
            type: {
              type: 'OptionalType',
              expression: {
                type: 'NameExpression',
                name: 'String'
              }
            },
            name: 'val',
            default: '"   foo"'
          }
        ]
      });
    });

    it('default array', () => {
      let res = comments.parseComment(['/**', " * @param {String} [val=['foo']] some description", ' */'].join('\n'), {
        unwrap: true,
        strict: false
      });

      assert.deepEqual(pick(res, ['tags', 'description']), {
        description: '',
        tags: [
          {
            title: 'param',
            description: 'some description',
            inlineTags: [],
            type: {
              type: 'OptionalType',
              expression: {
                type: 'NameExpression',
                name: 'String'
              }
            },
            name: 'val',
            default: "['foo']"
          }
        ]
      });
    });

    it('default array', () => {
      let res = comments.parseComment(['/**', " * @param {String} [val=['foo']] some description", ' */'].join('\n'), {
        unwrap: true,
        strict: false
      });

      assert.deepEqual(pick(res, ['tags', 'description']), {
        description: '',
        tags: [
          {
            title: 'param',
            description: 'some description',
            inlineTags: [],
            type: {
              type: 'OptionalType',
              expression: {
                type: 'NameExpression',
                name: 'String'
              }
            },
            name: 'val',
            default: "['foo']"
          }
        ]
      });
    });

    it('default array within white spaces', () => {
      let res = comments.parseComment(['/**', " * @param {String} [val = [ 'foo' ]] some description", ' */'].join('\n'), {
        unwrap: true,
        strict: false
      });

      assert.deepEqual(pick(res, ['tags', 'description']), {
        description: '',
        tags: [
          {
            title: 'param',
            description: 'some description',
            inlineTags: [],
            type: {
              type: 'OptionalType',
              expression: {
                type: 'NameExpression',
                name: 'String'
              }
            },
            name: 'val',
            default: "[ 'foo' ]"
          }
        ]
      });
    });

    it('example caption', () => {
      let res = comments.parseComment([
        '/**',
        ' * @example <caption>hi</caption>',
        " * f('blah'); // => undefined",
        ' */'
      ].join('\n'), {
        unwrap: true,
        jsdoc: true
      });

      assert.equal(res.tags[0].description, "f('blah'); // => undefined");
      assert.equal(res.tags[0].caption, 'hi');
    });

    it('should handle \\r\\n line endings correctly', () => {
      let res = comments.parseComment([
        '/**',
        ' * @param {string} foo',
        ' * @returns {string}',
        ' *',
        ' * @example',
        " * f('blah'); // => undefined",
        ' */'
      ].join('\r\n'), {
        unwrap: true,
        jsdoc: true
      });

      assert.equal(res.tags[2].description, "f('blah'); // => undefined");
    });
  });

  describe('optional properties', () => {
    // should fail since sloppy option not set
    it('failure 0', () => {
      let res = comments.parseComment(['/**',
        ' * @property {String} [val] some description',
        ' */'
      ].join('\n'), {
        unwrap: true,
        strict: true
      });

      assert.deepEqual(pick(res, ['tags', 'description']), {
        'description': '',
        'tags': []
      });
    });

    it('failure 1', () => {
      let res = comments.parseComment(['/**', ' * @property [val', ' */'].join('\n'), {
        unwrap: true,
        strict: false
      });
      assert.deepEqual(pick(res, ['tags', 'description']), {
        'description': '',
        'tags': []
      });
    });

    it('success 1', () => {
      let res = comments.parseComment(['/**', ' * @property {String} [val]', ' */'].join('\n'), {
        unwrap: true,
        strict: false
      });

      assert.deepEqual(pick(res, ['tags', 'description']), {
        description: '',
        tags: [
          {
            title: 'property',
            description: '',
            type: {
              type: 'OptionalType',
              expression: {
                type: 'NameExpression',
                name: 'String'
              }
            },
            name: 'val'
          }
        ]
      });
    });

    it('success 2', () => {
      let res = comments.parseComment(['/**', ' * @property {String=} val', ' */'].join('\n'), {
        unwrap: true,
        strict: false
      });

      assert.deepEqual(pick(res, ['tags', 'description']), {
        description: '',
        tags: [
          {
            title: 'property',
            description: '',
            type: {
              type: 'OptionalType',
              expression: {
                type: 'NameExpression',
                name: 'String'
              }
            },
            name: 'val'
          }
        ]
      });
    });

    it('success 3', () => {
      let res = comments.parseComment(['/**', ' * @property {String=} [val=abc] some description', ' */'].join('\n'), {
        unwrap: true,
        strict: false
      });

      assert.deepEqual(pick(res, ['tags', 'description']), {
        description: '',
        tags: [
          {
            title: 'property',
            description: 'some description',
            inlineTags: [],
            type: {
              type: 'OptionalType',
              expression: {
                type: 'NameExpression',
                name: 'String'
              }
            },
            name: 'val',
            default: 'abc'
          }
        ]
      });
    });

    it('success 4', () => {
      let res = comments.parseComment(['/**', ' * @property {String=} [val = abc] some description', ' */'].join('\n'), {
        unwrap: true,
        strict: false
      });

      assert.deepEqual(pick(res, ['tags', 'description']), {
        description: '',
        tags: [
          {
            title: 'property',
            description: 'some description',
            inlineTags: [],
            type: {
              type: 'OptionalType',
              expression: {
                type: 'NameExpression',
                name: 'String'
              }
            },
            name: 'val',
            default: 'abc'
          }
        ]
      });
    });

    it('default string', () => {
      let res = comments.parseComment(['/**', ' * @property {String} [val="foo"] some description', ' */'].join('\n'), {
        unwrap: true,
        strict: false
      });

      assert.deepEqual(pick(res, ['tags', 'description']), {
        description: '',
        tags: [
          {
            title: 'property',
            description: 'some description',
            inlineTags: [],
            type: {
              type: 'OptionalType',
              expression: {
                type: 'NameExpression',
                name: 'String'
              }
            },
            name: 'val',
            default: '"foo"'
          }
        ]
      });
    });

    it('default string surrounded by whitespace', () => {
      let res = comments.parseComment(['/**', " * @property {String} [val=   'foo'  ] some description", ' */'].join('\n'), {
        unwrap: true,
        strict: false
      });

      assert.deepEqual(pick(res, ['tags', 'description']), {
        description: '',
        tags: [
          {
            title: 'property',
            description: 'some description',
            inlineTags: [],
            type: {
              type: 'OptionalType',
              expression: {
                type: 'NameExpression',
                name: 'String'
              }
            },
            name: 'val',
            default: "'foo'"
          }
        ]
      });
    });

    it('should preserve whitespace in default string', () => {
      let res = comments.parseComment(['/**', ' * @property {String} [val=   "   foo"  ] some description', ' */'].join('\n'), {
        unwrap: true,
        strict: false
      });

      assert.deepEqual(pick(res, ['tags', 'description']), {
        description: '',
        tags: [
          {
            title: 'property',
            description: 'some description',
            inlineTags: [],
            type: {
              type: 'OptionalType',
              expression: {
                type: 'NameExpression',
                name: 'String'
              }
            },
            name: 'val',
            default: '"   foo"'
          }
        ]
      });
    });

    it('default array', () => {
      let res = comments.parseComment(['/**', " * @property {String} [val=['foo']] some description", ' */'].join('\n'), {
        unwrap: true,
        strict: false
      });

      assert.deepEqual(pick(res, ['tags', 'description']), {
        description: '',
        tags: [
          {
            title: 'property',
            description: 'some description',
            inlineTags: [],
            type: {
              type: 'OptionalType',
              expression: {
                type: 'NameExpression',
                name: 'String'
              }
            },
            name: 'val',
            default: "['foo']"
          }
        ]
      });
    });

    it('default array within white spaces', () => {
      let res = comments.parseComment(['/**', " * @property {String} [val = [ 'foo' ]] some description", ' */'].join('\n'), {
        unwrap: true,
        strict: false
      });

      assert.deepEqual(pick(res, ['tags', 'description']), {
        description: '',
        tags: [
          {
            title: 'property',
            description: 'some description',
            inlineTags: [],
            type: {
              type: 'OptionalType',
              expression: {
                type: 'NameExpression',
                name: 'String'
              }
            },
            name: 'val',
            default: "[ 'foo' ]"
          }
        ]
      });
    });
  });
});
