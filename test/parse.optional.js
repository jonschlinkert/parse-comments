'use strict';

require('mocha');
require('should');
var pick = require('object.pick');
var assert = require('assert');
var doctrine = require('doctrine');
var Comments = require('..');
var comments;

/**
 * some of these integration tests are based on tests from doctrine
 * https://github.com/eslint/doctrine/LICENSE.BSD
 * https://github.com/eslint/doctrine/LICENSE.closure-compiler
 * https://github.com/eslint/doctrine/LICENSE.esprima
 */

describe('parse optional', function() {
  beforeEach(function() {
    comments = new Comments();
  });

  describe('optional params', function() {
    // should fail since sloppy option not set
    it('failure 0', function() {
      var res = comments.parseComment('/** * @param {String} [val] */', {
        unwrap: true,
        strict: true
      });

      res.tags.length.should.equal(0);
      res.description.should.equal('');
    });

    it('failure 1', function() {
      var res = comments.parseComment('/** * @param [val */', {
        unwrap: true,
        strict: false
      })

      assert.deepEqual(pick(res, ['tags', 'description']), {
        'description': '',
        'tags': []
      });
    });

    it('success 1', function() {
      var res = comments.parseComment(['/**', ' * @param {String} [val]', ' */'].join('\n'), {
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

    it('success 2', function() {
      var res = comments.parseComment(['/**', ' * @param {String=} val', ' */'].join('\n'), {
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

    it('success 3', function() {
      var res = comments.parseComment('/** * @param {String=} [val=abc] some description */', {
        unwrap: true,
        strict: false
      });

      assert.deepEqual(pick(res, ['tags', 'description']), {
        'description': '',
        'tags': [{
          'title': 'param',
          'description': 'some description',
          'type': {
            'type': 'OptionalType',
            'expression': {
              'type': 'NameExpression',
              'name': 'String'
            }
          },
          'name': 'val',
          'default': 'abc'
        }]
      });
    });

    it('success 4', function() {
      var res = comments.parseComment(['/**', ' * @param {String=} [val = abc] some description', ' */'].join('\n'), {
        unwrap: true,
        strict: false
      });

      assert.deepEqual(pick(res, ['tags', 'description']), {
        'description': '',
        'tags': [{
          'title': 'param',
          'description': 'some description',
          'type': {
            'type': 'OptionalType',
            'expression': {
              'type': 'NameExpression',
              'name': 'String'
            }
          },
          'name': 'val',
          'default': 'abc'
        }]
      });
    });

    it('default string', function() {
      var res = comments.parseComment(['/**', ' * @param {String} [val="foo"] some description', ' */'].join('\n'), {
        unwrap: true,
        strict: false
      });

      assert.deepEqual(pick(res, ['tags', 'description']), {
        'description': '',
        'tags': [{
          'title': 'param',
          'description': 'some description',
          'type': {
            'type': 'OptionalType',
            'expression': {
              'type': 'NameExpression',
              'name': 'String'
            }
          },
          'name': 'val',
          'default': '"foo"'
        }]
      });
    });

    it('default string surrounded by whitespace', function() {
      var res = comments.parseComment(['/**', " * @param {String} [val=   'foo'  ] some description", ' */'].join('\n'), {
        unwrap: true,
        strict: false
      });

      assert.deepEqual(pick(res, ['tags', 'description']), {
        'description': '',
        'tags': [{
          'title': 'param',
          'description': 'some description',
          'type': {
            'type': 'OptionalType',
            'expression': {
              'type': 'NameExpression',
              'name': 'String'
            }
          },
          'name': 'val',
          'default': "'foo'"
        }]
      });
    });

    it('should preserve whitespace in default string', function() {
      var res = comments.parseComment(['/**', ' * @param {String} [val=   "   foo"  ] some description', ' */'].join('\n'), {
        unwrap: true,
        strict: false
      });

      assert.deepEqual(pick(res, ['tags', 'description']), {
        'description': '',
        'tags': [{
          'title': 'param',
          'description': 'some description',
          'type': {
            'type': 'OptionalType',
            'expression': {
              'type': 'NameExpression',
              'name': 'String'
            }
          },
          'name': 'val',
          'default': '"   foo"'
        }]
      });
    });

    it('default array', function() {
      var res = comments.parseComment(['/**', " * @param {String} [val=['foo']] some description", ' */'].join('\n'), {
        unwrap: true,
        strict: false
      });

      assert.deepEqual(pick(res, ['tags', 'description']), {
        'description': '',
        'tags': [{
          'title': 'param',
          'description': 'some description',
          'type': {
            'type': 'OptionalType',
            'expression': {
              'type': 'NameExpression',
              'name': 'String'
            }
          },
          'name': 'val',
          'default': "['foo']"
        }]
      });
    });

    it('default array', function() {
      var res = comments.parseComment(['/**', " * @param {String} [val=['foo']] some description", ' */'].join('\n'), {
        unwrap: true,
        strict: false
      });

      assert.deepEqual(pick(res, ['tags', 'description']), {
        'description': '',
        'tags': [{
          'title': 'param',
          'description': 'some description',
          'type': {
            'type': 'OptionalType',
            'expression': {
              'type': 'NameExpression',
              'name': 'String'
            }
          },
          'name': 'val',
          'default': "['foo']"
        }]
      });
    });

    it('default array within white spaces', function() {
      var res = comments.parseComment(['/**', " * @param {String} [val = [ 'foo' ]] some description", ' */'].join('\n'), {
        unwrap: true,
        strict: false
      });

      assert.deepEqual(pick(res, ['tags', 'description']), {
        'description': '',
        'tags': [{
          'title': 'param',
          'description': 'some description',
          'type': {
            'type': 'OptionalType',
            'expression': {
              'type': 'NameExpression',
              'name': 'String'
            }
          },
          'name': 'val',
          'default': "[ 'foo' ]"
        }]
      });
    });

    it('example caption', function() {
      var res = comments.parseComment([
        '/**',
        ' * @example <caption>hi</caption>',
        " * f('blah'); // => undefined",
        ' */'
      ].join('\n'), {
        unwrap: true,
        jsdoc: true
      });

      res.tags[0].description.should.eql("f('blah'); // => undefined");
      res.tags[0].caption.should.eql("hi");
    });

    it('should handle \\r\\n line endings correctly', function() {
      var res = comments.parseComment([
        "/**",
        " * @param {string} foo",
        " * @returns {string}",
        " *",
        " * @example",
        " * f('blah'); // => undefined",
        " */"
      ].join('\r\n'), {
        unwrap: true,
        jsdoc: true
      });

      res.tags[2].description.should.eql("f('blah'); // => undefined");
    });
  });

  describe('optional properties', function() {
    // should fail since sloppy option not set
    it('failure 0', function() {
      var res = comments.parseComment(['/**',
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

    it('failure 1', function() {
      var res = comments.parseComment(['/**', ' * @property [val', ' */'].join('\n'), {
        unwrap: true,
        strict: false
      });
      assert.deepEqual(pick(res, ['tags', 'description']), {
        'description': '',
        'tags': []
      });
    });

    it('success 1', function() {
      var res = comments.parseComment(['/**', ' * @property {String} [val]', ' */'].join('\n'), {
        unwrap: true,
        strict: false
      });
      assert.deepEqual(pick(res, ['tags', 'description']), {
        'description': '',
        'tags': [{
          'title': 'property',
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

    it('success 2', function() {
      var res = comments.parseComment(['/**', ' * @property {String=} val', ' */'].join('\n'), {
        unwrap: true,
        strict: false
      });
      assert.deepEqual(pick(res, ['tags', 'description']), {
        'description': '',
        'tags': [{
          'title': 'property',
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

    it('success 3', function() {
      var res = comments.parseComment(['/**', ' * @property {String=} [val=abc] some description', ' */'].join('\n'), {
        unwrap: true,
        strict: false
      });

      assert.deepEqual(pick(res, ['tags', 'description']), {
        'description': '',
        'tags': [{
          'title': 'property',
          'description': 'some description',
          'type': {
            'type': 'OptionalType',
            'expression': {
              'type': 'NameExpression',
              'name': 'String'
            }
          },
          'name': 'val',
          'default': 'abc'
        }]
      });
    });

    it('success 4', function() {
      var res = comments.parseComment(['/**', ' * @property {String=} [val = abc] some description', ' */'].join('\n'), {
        unwrap: true,
        strict: false
      });

      assert.deepEqual(pick(res, ['tags', 'description']), {
        'description': '',
        'tags': [{
          'title': 'property',
          'description': 'some description',
          'type': {
            'type': 'OptionalType',
            'expression': {
              'type': 'NameExpression',
              'name': 'String'
            }
          },
          'name': 'val',
          'default': 'abc'
        }]
      });
    });

    it('default string', function() {
      var res = comments.parseComment(['/**', ' * @property {String} [val="foo"] some description', ' */'].join('\n'), {
        unwrap: true,
        strict: false
      });

      assert.deepEqual(pick(res, ['tags', 'description']), {
        'description': '',
        'tags': [{
          'title': 'property',
          'description': 'some description',
          'type': {
            'type': 'OptionalType',
            'expression': {
              'type': 'NameExpression',
              'name': 'String'
            }
          },
          'name': 'val',
          'default': '"foo"'
        }]
      });
    });

    it('default string surrounded by whitespace', function() {
      var res = comments.parseComment(['/**', " * @property {String} [val=   'foo'  ] some description", ' */'].join('\n'), {
        unwrap: true,
        strict: false
      });

      assert.deepEqual(pick(res, ['tags', 'description']), {
        'description': '',
        'tags': [{
          'title': 'property',
          'description': 'some description',
          'type': {
            'type': 'OptionalType',
            'expression': {
              'type': 'NameExpression',
              'name': 'String'
            }
          },
          'name': 'val',
          'default': "'foo'"
        }]
      });
    });

    it('should preserve whitespace in default string', function() {
      var res = comments.parseComment(['/**', ' * @property {String} [val=   "   foo"  ] some description', ' */'].join('\n'), {
        unwrap: true,
        strict: false
      });

      assert.deepEqual(pick(res, ['tags', 'description']), {
        'description': '',
        'tags': [{
          'title': 'property',
          'description': 'some description',
          'type': {
            'type': 'OptionalType',
            'expression': {
              'type': 'NameExpression',
              'name': 'String'
            }
          },
          'name': 'val',
          'default': '"   foo"'
        }]
      });
    });

    it('default array', function() {
      var res = comments.parseComment(['/**', " * @property {String} [val=['foo']] some description", ' */'].join('\n'), {
        unwrap: true,
        strict: false
      });

      assert.deepEqual(pick(res, ['tags', 'description']), {
        'description': '',
        'tags': [{
          'title': 'property',
          'description': 'some description',
          'type': {
            'type': 'OptionalType',
            'expression': {
              'type': 'NameExpression',
              'name': 'String'
            }
          },
          'name': 'val',
          'default': "['foo']"
        }]
      });
    });

    it('default array within white spaces', function() {
      var res = comments.parseComment(['/**', " * @property {String} [val = [ 'foo' ]] some description", ' */'].join('\n'), {
        unwrap: true,
        strict: false
      });

      assert.deepEqual(pick(res, ['tags', 'description']), {
        'description': '',
        'tags': [{
          'title': 'property',
          'description': 'some description',
          'type': {
            'type': 'OptionalType',
            'expression': {
              'type': 'NameExpression',
              'name': 'String'
            }
          },
          'name': 'val',
          'default': "[ 'foo' ]"
        }]
      });
    });
  });
});
