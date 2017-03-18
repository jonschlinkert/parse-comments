'use strict';

require('mocha');
var assert = require('assert');
var support = require('./support');
var Comments = require('..');
var comments;

var fixtures = support.files(__dirname, 'fixtures');

describe('tokenize', function() {
  beforeEach(function() {
    comments = new Comments();
  });

  it('should throw an error when invalid args are passed', function(cb) {
    try {
      comments.tokenize();
      cb(new Error('expected an error'));
    } catch (err) {
      assert(err);
      assert.equal(err.message, 'expected comment to be a string');
      cb();
    }
  });

  it('should tokenize a block comment with one leading star', function() {
    var tok = comments.tokenize('/* foo */');
    assert.deepEqual(tok, { description: 'foo', footer: '', examples: [], tags: [] });
  });

  it('should tokenize a block comment with two leading stars', function() {
    var tok = comments.tokenize('/** foo */');
    assert.deepEqual(tok, { description: 'foo', footer: '', examples: [], tags: [] });
  });

  it('should tokenize a block comment with a single-line tag', function() {
    var tok = comments.tokenize('/** @constructor */');
    assert.deepEqual(tok, {
      description: '',
      footer: '',
      examples: [],
      tags: [
        {
          key: 'constructor',
          raw: '@constructor',
          type: 'tag',
          val: ''
        }
      ]
    });
  });

  it('should tokenize a comment with a multi-line description', function() {
    var tok = comments.tokenize('/* foo\nbar\nbaz */');
    assert.deepEqual(tok, { description: 'foo\nbar\nbaz', footer: '', examples: [], tags: [] });
  });

  it('should strip extraneous indentation from comments', function() {
    var tok = comments.tokenize([
      '/**',
      ' *      foo bar baz',
      ' *      ',
      ' *      ',
      ' *      @param {string} something',
      ' *      @param {string} else',
      ' */',
    ].join('\n'));

    assert.deepEqual(tok, {
      description: 'foo bar baz',
      footer: '',
      examples: [],
      tags: [
        {
          key: 'param',
          raw: '@param {string} something',
          type: 'tag',
          val: '{string} something'
        },
        {
          key: 'param',
          raw: '@param {string} else',
          type: 'tag',
          val: '{string} else'
        }
      ]
    });
  });

  it('should work with comments that already have stars stripped', function() {
    var tok1 = comments.tokenize([
      '',
      ' foo bar baz',
      ' ',
      ' ',
      ' @param {string} something',
      ' @param {string} else',
      '',
    ].join('\n'));

    assert.deepEqual(tok1, {
      description: 'foo bar baz',
      footer: '',
      examples: [],
      tags: [
        {
          key: 'param',
          raw: '@param {string} something',
          type: 'tag',
          val: '{string} something'
        },
        {
          key: 'param',
          raw: '@param {string} else',
          type: 'tag',
          val: '{string} else'
        }
      ]
    });

    var tok2 = comments.tokenize([
      'foo bar baz',
      '',
      '',
      '@param {string} something',
      '@param {string} else',
    ].join('\n'));

    assert.deepEqual(tok2, {
      description: 'foo bar baz',
      footer: '',
      examples: [],
      tags: [
        {
          key: 'param',
          raw: '@param {string} something',
          type: 'tag',
          val: '{string} something'
        },
        {
          key: 'param',
          raw: '@param {string} else',
          type: 'tag',
          val: '{string} else'
        }
      ]
    });
  });

  it('should tokenize complicated comments', function() {
    var tok1 = comments.tokenize(fixtures['example-large']);
    assert.deepEqual(tok1, {
      description: '',
      footer: '',
      examples: [{
        type: 'javadoc',
        language: '',
        description: '',
        raw: '@example\n <example name="NgModelController" module="customControl" deps="angular-sanitize.js">\n    <file name="style.css">\n      [contenteditable] {\n        border: 1px solid black;\n        background-color: white;\n        min-height: 20px;\n      }\n\n      .ng-invalid {\n        border: 1px solid red;\n      }\n\n    </file>\n    <file name="script.js">\n      angular.module(\'customControl\', [\'ngSanitize\']).\n        directive(\'contenteditable\', [\'$sce\', function($sce) {\n          return {\n            restrict: \'A\', // only activate on element attribute\n            require: \'?ngModel\', // get a hold of NgModelController\n            link: function(scope, element, attrs, ngModel) {\n              if (!ngModel) return; // do nothing if no ng-model\n\n              // Specify how UI should be updated\n              ngModel.$render = function() {\n                element.html($sce.getTrustedHtml(ngModel.$viewValue || \'\'));\n              };\n\n              // Listen for change events to enable binding\n              element.on(\'blur keyup change\', function() {\n                scope.$evalAsync(read);\n              });\n              read(); // initialize\n\n              // Write data to the model\n              function read() {\n                var html = element.html();\n                // When we clear the content editable the browser leaves a <br> behind\n                // If strip-br attribute is provided then we strip this out\n                if ( attrs.stripBr && html == \'<br>\' ) {\n                  html = \'\';\n                }\n                ngModel.$setViewValue(html);\n              }\n            }\n          };\n        }]);\n    </file>\n    <file name="index.html">\n      <form name="myForm">\n       <div contenteditable\n            name="myWidget" ng-model="userContent"\n            strip-br="true"\n            required>Change me!</div>\n        <span ng-show="myForm.myWidget.$error.required">Required!</span>\n       <hr>\n       <textarea ng-model="userContent" aria-label="Dynamic textarea"></textarea>\n      </form>\n    </file>\n    <file name="protractor.js" type="protractor">\n    it(\'should data-bind and become invalid\', function() {\n      if (browser.params.browser == \'safari\' || browser.params.browser == \'firefox\') {\n        // SafariDriver can\'t handle contenteditable\n        // and Firefox driver can\'t clear contenteditables very well\n        return;\n      }\n      var contentEditable = element(by.css(\'[contenteditable]\'));\n      var content = \'Change me!\';\n\n      expect(contentEditable.getText()).toEqual(content);\n\n      contentEditable.clear();\n      contentEditable.sendKeys(protractor.Key.BACK_SPACE);\n      expect(contentEditable.getText()).toEqual(\'\');\n      expect(contentEditable.getAttribute(\'class\')).toMatch(/ng-invalid-required/);\n    });\n    </file>\n </example>\n',
        val: '\n <example name="NgModelController" module="customControl" deps="angular-sanitize.js">\n    <file name="style.css">\n      [contenteditable] {\n        border: 1px solid black;\n        background-color: white;\n        min-height: 20px;\n      }\n\n      .ng-invalid {\n        border: 1px solid red;\n      }\n\n    </file>\n    <file name="script.js">\n      angular.module(\'customControl\', [\'ngSanitize\']).\n        directive(\'contenteditable\', [\'$sce\', function($sce) {\n          return {\n            restrict: \'A\', // only activate on element attribute\n            require: \'?ngModel\', // get a hold of NgModelController\n            link: function(scope, element, attrs, ngModel) {\n              if (!ngModel) return; // do nothing if no ng-model\n\n              // Specify how UI should be updated\n              ngModel.$render = function() {\n                element.html($sce.getTrustedHtml(ngModel.$viewValue || \'\'));\n              };\n\n              // Listen for change events to enable binding\n              element.on(\'blur keyup change\', function() {\n                scope.$evalAsync(read);\n              });\n              read(); // initialize\n\n              // Write data to the model\n              function read() {\n                var html = element.html();\n                // When we clear the content editable the browser leaves a <br> behind\n                // If strip-br attribute is provided then we strip this out\n                if ( attrs.stripBr && html == \'<br>\' ) {\n                  html = \'\';\n                }\n                ngModel.$setViewValue(html);\n              }\n            }\n          };\n        }]);\n    </file>\n    <file name="index.html">\n      <form name="myForm">\n       <div contenteditable\n            name="myWidget" ng-model="userContent"\n            strip-br="true"\n            required>Change me!</div>\n        <span ng-show="myForm.myWidget.$error.required">Required!</span>\n       <hr>\n       <textarea ng-model="userContent" aria-label="Dynamic textarea"></textarea>\n      </form>\n    </file>\n    <file name="protractor.js" type="protractor">\n    it(\'should data-bind and become invalid\', function() {\n      if (browser.params.browser == \'safari\' || browser.params.browser == \'firefox\') {\n        // SafariDriver can\'t handle contenteditable\n        // and Firefox driver can\'t clear contenteditables very well\n        return;\n      }\n      var contentEditable = element(by.css(\'[contenteditable]\'));\n      var content = \'Change me!\';\n\n      expect(contentEditable.getText()).toEqual(content);\n\n      contentEditable.clear();\n      contentEditable.sendKeys(protractor.Key.BACK_SPACE);\n      expect(contentEditable.getText()).toEqual(\'\');\n      expect(contentEditable.getAttribute(\'class\')).toMatch(/ng-invalid-required/);\n    });\n    </file>\n </example>\n'
      }],
      tags: []
    });
  });


  it('should tokenize a comment with a tag', function() {
    var tok = comments.tokenize('/* foo\nbar\nbaz\n * \n@param {string} something */');
    assert.deepEqual(tok, {
      description: 'foo\nbar\nbaz',
      footer: '',
      examples: [],
      tags: [
        {
          type: 'tag',
          raw: '@param {string} something',
          key: 'param',
          val: '{string} something'
        }
      ]
    });
  });

  it('should tokenize a comment with multiple tags', function() {
    var tok = comments.tokenize(`
      /**
       * foo bar baz
       *
       * @param {string} something
       * @param {string} else
       */
    `);

    assert.deepEqual(tok, {
      description: 'foo bar baz',
      footer: '',
      examples: [],
      tags: [
        {
          key: 'param',
          raw: '@param {string} something',
          type: 'tag',
          val: '{string} something'
        },
        {
          key: 'param',
          raw: '@param {string} else',
          type: 'tag',
          val: '{string} else'
        }
      ]
    });
  });

  it('should work with malformed tags', function() {
    var tok = comments.tokenize(fixtures['tags-malformed-middle']);

    assert.deepEqual(tok, {
      description: '',
      footer: '',
      examples: [],
      tags: [{
        type: 'tag',
        raw: '@private',
        key: 'private',
        val: ''
      }, {
        type: 'tag',
        raw: '@param {*} obj',
        key: 'param',
        val: '{*} obj'
      }, {
        type: 'tag',
        raw: '@param {*} obj true if `obj` is an array or array-like object (NodeList, Arguments,\n               String ...)',
        key: 'param',
        val: '{*} obj true if `obj` is an array or array-like object (NodeList, Arguments,\n               String ...)'
      }, {
        type: 'tag',
        raw: '@return {boolean}',
        key: 'return',
        val: '{boolean}'
      }]
    });
  });

  it('should work with trailing malformed tags', function() {
    var tok = comments.tokenize(fixtures['tags-malformed-trailing']);
    assert.deepEqual(tok, {
      description: '',
      footer: '',
      examples: [],
      tags: [
        {
          type: 'tag',
          raw: '@private',
          key: 'private',
          val: ''
        },
        {
          type: 'tag',
          raw: '@param {*} obj',
          key: 'param',
          val: '{*} obj'
        },
        {
          type: 'tag',
          raw: '@return {boolean} Returns true if `obj` is an array or array-like object (NodeList, Arguments,\n               String ...)',
          key: 'return',
          val: '{boolean} Returns true if `obj` is an array or array-like object (NodeList, Arguments,\n               String ...)'
        }
      ]
    });
  });

  it('should tokenize a comment with no tags', function() {
    var tok = comments.tokenize(fixtures['description-no-tags']);

    assert.deepEqual(tok, {
      description: 'documentMode is an IE-only property\nhttp://msdn.microsoft.com/en-us/library/ie/cc196988(v=vs.85).aspx',
      footer: '',
      examples: [],
      tags: []
    });
  });

  it('should tokenize a comment that starts with a @description tag', function() {
    var tok = comments.tokenize(fixtures['description-tag'].replace(/\/\/[^\n]+/, ''));

    assert.deepEqual(tok, {
      description: 'This object provides a utility for producing rich Error messages within\n Angular. It can be called as follows:\n\n var exampleMinErr = minErr(\'example\');\n throw exampleMinErr(\'one\', \'This {0} is {1}\', foo, bar);\n\n The above creates an instance of minErr in the example namespace. The\n resulting error will have a namespaced error code of example.one.  The\n resulting error will replace {0} with the value of foo, and {1} with the\n value of bar. The object is not restricted in the number of arguments it can\n take.\n\n If fewer arguments are specified than necessary for interpolation, the extra\n interpolation markers will be preserved in the final string.\n\n Since data will be parsed statically during a build step, some restrictions\n are applied with respect to how minErr instances are created and called.\n Instances should have names of the form namespaceMinErr for a minErr created\n using minErr(\'namespace\') . Error codes, namespaces and template strings\n should all be static strings, not variables or general expressions.',
      footer: '',
      examples: [],
      tags: [
        {
          type: 'tag',
          raw: '@param {string} module The namespace to use for the new minErr instance.',
          key: 'param',
          val: '{string} module The namespace to use for the new minErr instance.'
        },
        {
          type: 'tag',
          raw: '@param {function} ErrorConstructor Custom error constructor to be instantiated when returning\n   error from returned function, for cases when a particular type of error is useful.',
          key: 'param',
          val: '{function} ErrorConstructor Custom error constructor to be instantiated when returning\n   error from returned function, for cases when a particular type of error is useful.'
        },
        {
          type: 'tag',
          raw: '@returns {function(code:string, template:string, ...templateArgs): Error} minErr instance',
          key: 'returns',
          val: '{function(code:string, template:string, ...templateArgs): Error} minErr instance'
        }
      ]
    });
  });

  it('should tokenize a comment with a @description tag in the middle', function() {
    var tok1 = comments.tokenize(fixtures['description-tag-middle'].replace(/\/\/[^\n]+/, ''));

    assert.deepEqual(tok1, {
      description: '# ng (core module)\n The ng module is loaded by default when an AngularJS application is started. The module itself\n contains the essential components for an AngularJS application to function. The table below\n lists a high level breakdown of each of the services/factories, filters, directives and testing\n components available within this core module.\n\n <div doc-module-components="ng"></div>',
      footer: '',
      examples: [],
      tags: [
        {
          key: 'ngdoc',
          raw: '@ngdoc module',
          type: 'tag',
          val: 'module'
        },
        {
          key: 'name',
          raw: '@name ng',
          type: 'tag',
          val: 'ng'
        },
        {
          key: 'module',
          raw: '@module ng',
          type: 'tag',
          val: 'ng'
        }
      ]
    });

    var tok2 = comments.tokenize(fixtures['description-tag-middle2'].replace(/\/\/[^\n]+/, ''));

    assert.deepEqual(tok2, {
      description: 'Converts the specified string to lowercase.',
      footer: '',
      examples: [],
      tags: [
        {
          key: 'ngdoc',
          raw: '@ngdoc function',
          type: 'tag',
          val: 'function'
        },
        {
          key: 'name',
          raw: '@name angular.lowercase',
          type: 'tag',
          val: 'angular.lowercase'
        },
        {
          key: 'module',
          raw: '@module ng',
          type: 'tag',
          val: 'ng'
        },
        {
          key: 'kind',
          raw: '@kind function',
          type: 'tag',
          val: 'function'
        },
        {
          key: 'param',
          raw: '@param {string} string String to be converted to lowercase.',
          type: 'tag',
          val: '{string} string String to be converted to lowercase.'
        },
        {
          key: 'returns',
          raw: '@returns {string} Lowercased string.',
          type: 'tag',
          val: '{string} Lowercased string.'
        }
      ]
    });
  });
});
