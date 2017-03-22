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
        sloppy: true
      })

      assert.deepEqual(pick(res, ['tags', 'description']), {
        'description': '',
        'tags': []
      });
    });

    it('success 1', function() {
      var res = comments.parseComment(['/**', ' * @param {String} [val]', ' */'].join('\n'), {
        unwrap: true,
        sloppy: true
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
        sloppy: true
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
        sloppy: true
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
        sloppy: true
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
        sloppy: true
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
        sloppy: true
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
        sloppy: true
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
        sloppy: true
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

    it.skip('default array', function() {
      var res = comments.parseComment(['/**', " * @param {String} [val=['foo']] some description", ' */'].join('\n'), {
        unwrap: true,
        sloppy: true
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

  //   it('default array within white spaces', function() {
  //     var res = comments.parseComment(['/**', " * @param {String} [val = [ 'foo' ]] some description", ' */'].join('\n'), {
  //       unwrap: true,
  //       sloppy: true
  //     });

  //     assert.deepEqual(pick(res, ['tags', 'description']), {
  //       'description': '',
  //       'tags': [{
  //         'title': 'param',
  //         'description': 'some description',
  //         'type': {
  //           'type': 'OptionalType',
  //           'expression': {
  //             'type': 'NameExpression',
  //             'name': 'String'
  //           }
  //         },
  //         'name': 'val',
  //         'default': "['foo']"
  //       }]
  //     });
  //   });

  //   it('line numbers', function() {
  //     var res = comments.parseComment([
  //       '/**',
  //       ' * @constructor',
  //       ' * @param {string} foo',
  //       ' * @returns {string}',
  //       ' *',
  //       ' * @example',
  //       " * f('blah'); // => undefined",
  //       ' */'
  //     ].join('\n'), {
  //       unwrap: true,
  //       lineNumbers: true
  //     });

  //     res.tags[0].should.have.property('lineNumber', 1);
  //     res.tags[1].should.have.property('lineNumber', 2);
  //     res.tags[2].should.have.property('lineNumber', 3);
  //     res.tags[3].should.have.property('lineNumber', 5);
  //   });

  //   it('example caption', function() {
  //     var res = comments.parseComment([
  //       '/**',
  //       ' * @example <caption>hi</caption>',
  //       " * f('blah'); // => undefined",
  //       ' */'
  //     ].join('\n'), {
  //       unwrap: true,
  //       lineNumbers: true
  //     });

  //     assert.deepEqual(pick(res, ['tags', 'description']),       res.tags[0].description;
  //                      assert.deepEqual(pick(res, ['tags', 'description']), "f('blah'); // => undefined");
  //     res.tags[0].caption;
  //     assert.deepEqual(pick(res, ['tags', 'description']), 'hi');
  //   });

  //   it('should handle \\r\\n line endings correctly', function() {
  //     var res = comments.parseComment([
  //       '/**',
  //       ' * @param {string} foo',
  //       ' * @returns {string}',
  //       ' *',
  //       ' * @example',
  //       " * f('blah'); // => undefined",
  //       ' */'
  //     ].join('\r\n'), {
  //       unwrap: true,
  //       lineNumbers: true
  //     });

  //     assert.deepEqual(pick(res, ['tags', 'description']),       res.tags[0].should.have.property('lineNumber', 1);
  //     res.tags[1].should.have.property('lineNumber', 2);
  //     res.tags[2].should.have.property('lineNumber', 4);
  //   });
  // });

  // describe('optional properties', function() {

  //   // should fail since sloppy option not set
  //   it('failure 0', function() {
  //     var res = comments.parseComment(['/**',
  //         ' * @property {String} [val] some description',
  //         ' */'
  //       ].join('\n'), {
  //         unwrap: true
  //       });
  //     assert.deepEqual(pick(res, ['tags', 'description']), {
  //         'description': '',
  //         'tags': []
  //       });
  //   });

  //   it('failure 1', function() {
  //     var res = comments.parseComment(['/**', ' * @property [val', ' */'].join('\n'), {
  //       unwrap: true,
  //       sloppy: true
  //     });
  //     assert.deepEqual(pick(res, ['tags', 'description']), {
  //       'description': '',
  //       'tags': []
  //     });
  //   });

  //   it('success 1', function() {
  //     var res = comments.parseComment(['/**', ' * @property {String} [val]', ' */'].join('\n'), {
  //       unwrap: true,
  //       sloppy: true
  //     });
  //     assert.deepEqual(pick(res, ['tags', 'description']), {
  //       'description': '',
  //       'tags': [{
  //         'title': 'property',
  //         'description': '',
  //         'type': {
  //           'type': 'OptionalType',
  //           'expression': {
  //             'type': 'NameExpression',
  //             'name': 'String'
  //           }
  //         },
  //         'name': 'val'
  //       }]
  //     });
  //   });

  //   it('success 2', function() {
  //     var res = comments.parseComment(['/**', ' * @property {String=} val', ' */'].join('\n'), {
  //       unwrap: true,
  //       sloppy: true
  //     });
  //     assert.deepEqual(pick(res, ['tags', 'description']), {
  //       'description': '',
  //       'tags': [{
  //         'title': 'property',
  //         'description': '',
  //         'type': {
  //           'type': 'OptionalType',
  //           'expression': {
  //             'type': 'NameExpression',
  //             'name': 'String'
  //           }
  //         },
  //         'name': 'val'
  //       }]
  //     });
  //   });

  //   it('success 3', function() {
  //     var res = comments.parseComment(['/**', ' * @property {String=} [val=abc] some description', ' */'].join('\n'), {
  //       unwrap: true,
  //       sloppy: true
  //     });

  //     assert.deepEqual(pick(res, ['tags', 'description']), {
  //       'description': '',
  //       'tags': [{
  //         'title': 'property',
  //         'description': 'some description',
  //         'type': {
  //           'type': 'OptionalType',
  //           'expression': {
  //             'type': 'NameExpression',
  //             'name': 'String'
  //           }
  //         },
  //         'name': 'val',
  //         'default': 'abc'
  //       }]
  //     });
  //   });

  //   it('success 4', function() {
  //     var res = comments.parseComment(['/**', ' * @property {String=} [val = abc] some description', ' */'].join('\n'), {
  //       unwrap: true,
  //       sloppy: true
  //     });

  //     assert.deepEqual(pick(res, ['tags', 'description']), {
  //       'description': '',
  //       'tags': [{
  //         'title': 'property',
  //         'description': 'some description',
  //         'type': {
  //           'type': 'OptionalType',
  //           'expression': {
  //             'type': 'NameExpression',
  //             'name': 'String'
  //           }
  //         },
  //         'name': 'val',
  //         'default': 'abc'
  //       }]
  //     });
  //   });

  //   it('default string', function() {
  //     var res = comments.parseComment(['/**', ' * @property {String} [val="foo"] some description', ' */'].join('\n'), {
  //       unwrap: true,
  //       sloppy: true
  //     });

  //     assert.deepEqual(pick(res, ['tags', 'description']), {
  //       'description': '',
  //       'tags': [{
  //         'title': 'property',
  //         'description': 'some description',
  //         'type': {
  //           'type': 'OptionalType',
  //           'expression': {
  //             'type': 'NameExpression',
  //             'name': 'String'
  //           }
  //         },
  //         'name': 'val',
  //         'default': '"foo"'
  //       }]
  //     });
  //   });

  //   it('default string surrounded by whitespace', function() {
  //     var res = comments.parseComment(['/**', " * @property {String} [val=   'foo'  ] some description", ' */'].join('\n'), {
  //       unwrap: true,
  //       sloppy: true
  //     });

  //     assert.deepEqual(pick(res, ['tags', 'description']), {
  //       'description': '',
  //       'tags': [{
  //         'title': 'property',
  //         'description': 'some description',
  //         'type': {
  //           'type': 'OptionalType',
  //           'expression': {
  //             'type': 'NameExpression',
  //             'name': 'String'
  //           }
  //         },
  //         'name': 'val',
  //         'default': "'foo'"
  //       }]
  //     });
  //   });

  //   it('should preserve whitespace in default string', function() {
  //     var res = comments.parseComment(['/**', ' * @property {String} [val=   "   foo"  ] some description', ' */'].join('\n'), {
  //       unwrap: true,
  //       sloppy: true
  //     });

  //     assert.deepEqual(pick(res, ['tags', 'description']), {
  //       'description': '',
  //       'tags': [{
  //         'title': 'property',
  //         'description': 'some description',
  //         'type': {
  //           'type': 'OptionalType',
  //           'expression': {
  //             'type': 'NameExpression',
  //             'name': 'String'
  //           }
  //         },
  //         'name': 'val',
  //         'default': '"   foo"'
  //       }]
  //     });
  //   });

  //   it('default array', function() {
  //     var res = comments.parseComment(['/**', " * @property {String} [val=['foo']] some description", ' */'].join('\n'), {
  //       unwrap: true,
  //       sloppy: true
  //     });

  //     assert.deepEqual(pick(res, ['tags', 'description']), {
  //       'description': '',
  //       'tags': [{
  //         'title': 'property',
  //         'description': 'some description',
  //         'type': {
  //           'type': 'OptionalType',
  //           'expression': {
  //             'type': 'NameExpression',
  //             'name': 'String'
  //           }
  //         },
  //         'name': 'val',
  //         'default': "['foo']"
  //       }]
  //     });
  //   });

  //   it('default array within white spaces', function() {
  //     var res = comments.parseComment(['/**', " * @property {String} [val = [ 'foo' ]] some description", ' */'].join('\n'), {
  //       unwrap: true,
  //       sloppy: true
  //     });

  //     assert.deepEqual(pick(res, ['tags', 'description']), {
  //       'description': '',
  //       'tags': [{
  //         'title': 'property',
  //         'description': 'some description',
  //         'type': {
  //           'type': 'OptionalType',
  //           'expression': {
  //             'type': 'NameExpression',
  //             'name': 'String'
  //           }
  //         },
  //         'name': 'val',
  //         'default': "['foo']"
  //       }]
  //     });
  //   });
  });
});
