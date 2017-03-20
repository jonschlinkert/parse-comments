'use strict';

require('mocha');
require('should');
var assert = require('assert');
var doctrine = require('doctrine');
var parseType = require('../lib/parse/typed');

describe('parse type', function() {
  describe('empty', function() {
    it('should parse an empty entries object', function() {
      assert.deepEqual(parseType('{}'), doctrine.parseType('{}'));
    });
  });

  describe('types', function() {
    it('should parse a single type', function() {
      assert.deepEqual(parseType('boolean'), doctrine.parseType('boolean'));
      assert.deepEqual(parseType('Window'), doctrine.parseType('Window'));
      assert.deepEqual(parseType('number'), doctrine.parseType('number'));
      assert.deepEqual(parseType('_'), doctrine.parseType('_'));
      assert.deepEqual(parseType('$'),  doctrine.parseType('$'));
    });

    it('should parse a type with dot-notation', function() {
      assert.deepEqual(parseType('foo.bar'), doctrine.parseType('foo.bar'));
      assert.deepEqual(parseType('a.b.c'), doctrine.parseType('a.b.c'));
    });

    it('should parse multiple types', function() {
      assert.deepEqual(parseType('boolean|string'), doctrine.parseType('boolean|string'));
    });

    it('should parse string literal union types', function() {
      assert.deepEqual(parseType("('public'|'protected'|'private')"), doctrine.parseType("('public'|'protected'|'private')"));
    });
  });

  describe('parens', function() {
    it('should parse a type in parens', function() {
      assert.deepEqual(parseType('(boolean)'), doctrine.parseType('(boolean)'));
      assert.deepEqual(parseType('(Window)'), doctrine.parseType('(Window)'));
    });

    it('should parse multiple types in parens', function() {
      assert.deepEqual(parseType('(boolean|string)'), doctrine.parseType('(boolean|string)'));

      assert.deepEqual(parseType('(boolean|string|array)'), doctrine.parseType('(boolean|string|array)'));
    });
  });

  /**
   * Some of these following unit tests are based on tests from doctrine
   * https://github.com/eslint/doctrine
   * https://github.com/eslint/doctrine/LICENSE.BSD
   * https://github.com/eslint/doctrine/LICENSE.closure-compiler
   * https://github.com/eslint/doctrine/LICENSE.esprima
   */

  describe('parseType', function() {
    it('should parse jsdoc expressions', function() {
      assert.deepEqual(parseType('number'), {
        type: 'NameExpression',
        name: 'number'
      });
    });

    it('should parse jsdoc "all" expressions', function() {
      assert.deepEqual(parseType('*'), {
        type: 'AllLiteral'
      });
    });

    it('should parse jsdoc "?"', function() {
      assert.deepEqual(parseType('?'), {
        type: 'NullableLiteral'
      });
    });

    it('should parse jsdoc "!"', function() {
      assert.deepEqual(parseType('!'), {
        type: 'NonNullableLiteral'
      });
    });

    it('union type closure-compiler extended', function() {
      assert.deepEqual(parseType('string|number'), {
        type: 'UnionType',
        elements: [{
          type: 'NameExpression',
          name: 'string'
        }, {
          type: 'NameExpression',
          name: 'number'
        }]
      });

      assert.deepEqual(parseType('(string|number)'), {
        type: 'UnionType',
        elements: [{
          type: 'NameExpression',
          name: 'string'
        }, {
          type: 'NameExpression',
          name: 'number'
        }]
      });

      assert.deepEqual(parseType('string|array|number'), {
        type: 'UnionType',
        elements: [{
          type: 'NameExpression',
          name: 'string'
        }, {
          type: 'NameExpression',
          name: 'array'
        }, {
          type: 'NameExpression',
          name: 'number'
        }]
      });
    });

    it('empty union type', function() {
      var type = parseType('()');
      assert.deepEqual(type, {
        type: 'UnionType',
        elements: []
      });
    });

    it('array type', function() {
      var type = parseType('[string]');
      assert.deepEqual(type, {
        type: 'ArrayType',
        elements: [{
          type: 'NameExpression',
          name: 'string'
        }]
      });
    });

    it('comma last array type', function() {
      var type = parseType('[string,]');
      assert.deepEqual(type, {
        type: 'ArrayType',
        elements: [{
          type: 'NameExpression',
          name: 'string'
        }]
      });
    });

    it('array type of all literal', function() {
      var type = parseType('[*]');
      assert.deepEqual(type, {
        type: 'ArrayType',
        elements: [{
          type: 'AllLiteral'
        }]
      });
    });

    it('array type of nullable literal', function() {
      var type = parseType('[?]');
      assert.deepEqual(type, {
        type: 'ArrayType',
        elements: [{
          type: 'NullableLiteral'
        }]
      });
    });

    it('comma last record type', function() {
      var type = parseType('{,}');
      assert.deepEqual(type, {
        type: 'RecordType',
        fields: []
      });
    });

    it('should parse record types', function() {
      var fixture = '{ a: number, b: string }';
      assert.deepEqual(parseType(fixture), doctrine.parseType(fixture));
      fixture = '{a: number, b: string}';
      assert.deepEqual(parseType(fixture), doctrine.parseType(fixture));
      fixture = '{a: number, b: string, c}';
      assert.deepEqual(parseType(fixture), doctrine.parseType(fixture));
      fixture = '{ a: number, b : string, c }';
      assert.deepEqual(parseType(fixture), doctrine.parseType(fixture));
      fixture = '{ a : number, b : string, c }';
      assert.deepEqual(parseType(fixture), doctrine.parseType(fixture));
    });

    it('type application', function() {
      var type = parseType('Array.<String>');
      assert.deepEqual(type, {
        type: 'TypeApplication',
        expression: {
          type: 'NameExpression',
          name: 'Array'
        },
        applications: [{
          type: 'NameExpression',
          name: 'String'
        }]
      });
    });

    it('type application with NullableLiteral', function() {
      var type = parseType('Array<?>');
      assert.deepEqual(type, {
        type: 'TypeApplication',
        expression: {
          type: 'NameExpression',
          name: 'Array'
        },
        applications: [{
          type: 'NullableLiteral'
        }]
      });
    });

    it('type application with multiple patterns', function() {
      var type = parseType('Array.<String, Number>');
      assert.deepEqual(type, {
        type: 'TypeApplication',
        expression: {
          type: 'NameExpression',
          name: 'Array'
        },
        applications: [{
          type: 'NameExpression',
          name: 'String'
        }, {
          type: 'NameExpression',
          name: 'Number'
        }]
      });
    });

    it('type application without dot', function() {
      var type = parseType('Array<String>');
      assert.deepEqual(type, {
        type: 'TypeApplication',
        expression: {
          type: 'NameExpression',
          name: 'Array'
        },
        applications: [{
          type: 'NameExpression',
          name: 'String'
        }]
      });
    });

    it('array-style type application', function() {
      var type = parseType('String[]');
      assert.deepEqual(type, {
        type: 'TypeApplication',
        expression: {
          type: 'NameExpression',
          name: 'Array'
        },
        applications: [{
          type: 'NameExpression',
          name: 'String'
        }]
      });
    });

    it('function type simple', function() {
      var type = parseType('function()');
      assert.deepEqual(type, {
        'type': 'FunctionType',
        'params': [],
        'result': null
      });
    });

    it('function type with name', function() {
      var type = parseType('function(a)');
      assert.deepEqual(type, {
        'type': 'FunctionType',
        'params': [
          {
            'type': 'NameExpression',
            'name': 'a'
          }
        ],
        'result': null
      });
    });

    it('function type with name and type', function() {
      var type = parseType('function(a:b)');
      assert.deepEqual(type, {
        'type': 'FunctionType',
        'params': [
          {
            'type': 'ParameterType',
            'name': 'a',
            'expression': {
              'type': 'NameExpression',
              'name': 'b'
            }
          }
        ],
        'result': null
      });
    });

    it('function type with optional param', function() {
      var type = parseType('function(a=)');
      assert.deepEqual(type, {
        'type': 'FunctionType',
        'params': [
          {
            'type': 'OptionalType',
            'expression': {
              'type': 'NameExpression',
              'name': 'a'
            }
          }
        ],
        'result': null
      });
    });

    it('function type with optional param name and type', function() {
      var type = parseType('function(a:b=)');
      assert.deepEqual(type, {
        'type': 'FunctionType',
        'params': [
          {
            'type': 'OptionalType',
            'expression': {
              'type': 'ParameterType',
              'name': 'a',
              'expression': {
                'type': 'NameExpression',
                'name': 'b'
              }
            }
          }
        ],
        'result': null
      });
    });

    it('function type with rest param', function() {
      var type = parseType('function(...a)');
      assert.deepEqual(type, {
        'type': 'FunctionType',
        'params': [
          {
            'type': 'RestType',
            'expression': {
              'type': 'NameExpression',
              'name': 'a'
            }
          }
        ],
        'result': null
      });
    });

    it('function type with rest param name and type', function() {
      var type = parseType('function(...a:b)');
      assert.deepEqual(type, {
        'type': 'FunctionType',
        'params': [
          {
            'type': 'RestType',
            'expression': {
              'type': 'ParameterType',
              'name': 'a',
              'expression': {
                'type': 'NameExpression',
                'name': 'b'
              }
            }
          }
        ],
        'result': null
      });
    });

    it('function type with optional rest param', function() {
      var type = parseType('function(...a=)');
      assert.deepEqual(type, {
        'type': 'FunctionType',
        'params': [
          {
            'type': 'RestType',
            'expression': {
              'type': 'OptionalType',
              'expression': {
                'type': 'NameExpression',
                'name': 'a'
              }
            }
          }
        ],
        'result': null
      });
    });

    it('function type with optional rest param name and type', function() {
      var type = parseType('function(...a:b=)');
      assert.deepEqual(type, {
        'type': 'FunctionType',
        'params': [
          {
            type: 'RestType',

            expression: {
              type: 'OptionalType',

              expression: {
                type: 'ParameterType',
                name: 'a',

                expression: {
                  type: 'NameExpression',
                  name: 'b'
                }
              }
            }
          }],
        'result': null
      });
    });

    it('string value in type', function() {
      var type;

      type = parseType("{'ok':String}");
      assert.deepEqual(type, {
        'fields': [
          {
            'key': 'ok',
            'type': 'FieldType',
            'value': {
              'name': 'String',
              'type': 'NameExpression'
            }
          }
        ],
        'type': 'RecordType'
      });

      // type = parseType('{"\\r\\n\\t\\u2028\\x20\\u20\\b\\f\\v\\\r\n\\\n\\0\\07\\012\\o":String}');
      // assert.deepEqual(type, {
      //   'fields': [
      //     {
      //       'key': '\r\n\t\u2028\x20u20\b\f\v\0\u0007\u000ao',
      //       'type': 'FieldType',
      //       'value': {
      //         'name': 'String',
      //         'type': 'NameExpression'
      //       }
      //     }
      //   ],
      //   'type': 'RecordType'
      // });

      parseType.bind(doctrine, "{'ok\":String}").should.throw();
      // parseType.bind(doctrine, "{'o\n':String}").should.throw();
    });

    it('number value in type', function() {
      var type;

      type = parseType('{20:String}');
      assert.deepEqual(type, {
        'fields': [
          {
            'key': '20',
            'type': 'FieldType',
            'value': {
              'name': 'String',
              'type': 'NameExpression'
            }
          }
        ],
        'type': 'RecordType'
      });

      type = parseType('{.2:String, 30:Number, 0x20:String}');
      assert.deepEqual(type, {
        'fields': [
          {
            'key': '0.2',
            'type': 'FieldType',
            'value': {
              'name': 'String',
              'type': 'NameExpression'
            }
          },
          {
            'key': '30',
            'type': 'FieldType',
            'value': {
              'name': 'Number',
              'type': 'NameExpression'
            }
          },
          {
            'key': '32',
            'type': 'FieldType',
            'value': {
              'name': 'String',
              'type': 'NameExpression'
            }
          }
        ],
        'type': 'RecordType'
      });

      type = parseType('{0X2:String, 0:Number, 100e200:String, 10e-20:Number}');
      assert.deepEqual(type, {
        'fields': [
          {
            'key': '2',
            'type': 'FieldType',
            'value': {
              'name': 'String',
              'type': 'NameExpression'
            }
          },
          {
            'key': '0',
            'type': 'FieldType',
            'value': {
              'name': 'Number',
              'type': 'NameExpression'
            }
          },
          {
            'key': '1e+202',
            'type': 'FieldType',
            'value': {
              'name': 'String',
              'type': 'NameExpression'
            }
          },
          {
            'key': '1e-19',
            'type': 'FieldType',
            'value': {
              'name': 'Number',
              'type': 'NameExpression'
            }
          }
        ],
        'type': 'RecordType'
      });

      // parseType.bind(doctrine, '{0x:String}').should.throw('unexpected token');
      // parseType.bind(doctrine, '{0x').should.throw('unexpected token');
      // parseType.bind(doctrine, '{0xd').should.throw('unexpected token');
      // parseType.bind(doctrine, '{0x2_:').should.throw('unexpected token');
      // parseType.bind(doctrine, '{021:').should.throw('unexpected token');
      // parseType.bind(doctrine, '{021_:').should.throw('unexpected token');
      // parseType.bind(doctrine, '{021').should.throw('unexpected token');
      // parseType.bind(doctrine, '{08').should.throw('unexpected token');
      // parseType.bind(doctrine, '{0y').should.throw('unexpected token');
      // parseType.bind(doctrine, '{0').should.throw('unexpected token');
      // parseType.bind(doctrine, '{100e2').should.throw('unexpected token');
      // parseType.bind(doctrine, '{100e-2').should.throw('unexpected token');
      // parseType.bind(doctrine, '{100e-200:').should.throw('unexpected token');
      // parseType.bind(doctrine, '{100e:').should.throw('unexpected token');
      // parseType.bind(doctrine, 'function(number=, string)').should.throw('not reach to EOF');
    });

    it('dotted type', function() {
      var type = parseType('Cocoa.Cappuccino');
      assert.deepEqual(type, {
        'name': 'Cocoa.Cappuccino',
        'type': 'NameExpression'
      });
    });

    it('rest array type', function() {
      var type = parseType('[string,...string]');
      assert.deepEqual(type, {
        'elements': [
          {
            'name': 'string',
            'type': 'NameExpression'
          },
          {
            'expression': {
              'name': 'string',
              'type': 'NameExpression'
            },
            'type': 'RestType'
          }
        ],
        'type': 'ArrayType'
      });
    });

    it('nullable type', function() {
      assert.deepEqual(parseType('string?'), doctrine.parseType('string?'));
      assert.deepEqual(parseType('string?'), {
        'expression': {
          'name': 'string',
          'type': 'NameExpression'
        },
        'prefix': false,
        'type': 'NullableType'
      });

      assert.deepEqual(parseType('?string'), doctrine.parseType('?string'));
      assert.deepEqual(parseType('?string'), {
        'expression': {
          'name': 'string',
          'type': 'NameExpression'
        },
        'prefix': true,
        'type': 'NullableType'
      });
    });

    it('non-nullable type', function() {
      assert.deepEqual(parseType('!string'), doctrine.parseType('!string'));
      assert.deepEqual(parseType('!string'), {
        'expression': {
          'name': 'string',
          'type': 'NameExpression'
        },
        'prefix': true,
        'type': 'NonNullableType'
      });

      assert.deepEqual(parseType('string!'), doctrine.parseType('string!'));
      assert.deepEqual(parseType('string!'), {
        'expression': {
          'name': 'string',
          'type': 'NameExpression'
        },
        'prefix': false,
        'type': 'NonNullableType'
      });
    });

    it('toplevel multiple pipe type', function() {
      var type = parseType('string|number|Test');
      assert.deepEqual(type, {
        'elements': [
          {
            'name': 'string',
            'type': 'NameExpression'
          },
          {
            'name': 'number',
            'type': 'NameExpression'
          },
          {
            'name': 'Test',
            'type': 'NameExpression'
          }
        ],
        'type': 'UnionType'
      });
    });

    it('string literal type', function() {
      var type = parseType('"Hello, World"');
      assert.deepEqual(type, {
        type: 'StringLiteralType',
        value: 'Hello, World'
      });
    });

    it('numeric literal type', function() {
      var type = parseType('32');
      assert.deepEqual(type, {
        type: 'NumericLiteralType',
        value: 32
      });
      type = parseType('-142.42');
      assert.deepEqual(type, {
        type: 'NumericLiteralType',
        value: -142.42
      });
    });

    it('boolean literal type', function() {
      var type = parseType('true');
      assert.deepEqual(type, {
        type: 'BooleanLiteralType',
        value: true
      });
      type = parseType('false');
      assert.deepEqual(type, {
        type: 'BooleanLiteralType',
        value: false
      });
    });

    // it('illegal tokens', function() {
    //   parseType.bind(doctrine, '.').should.throw('unexpected token');
    //   parseType.bind(doctrine, '.d').should.throw('unexpected token');
    //   parseType.bind(doctrine, '(').should.throw('unexpected token');
    //   parseType.bind(doctrine, 'Test.').should.throw('unexpected token');
    // });
  });

  describe('parseParamType', function() {
    it('question', function() {
      var type = parseType('?');
      assert.deepEqual(type, {
        type: 'NullableLiteral'
      });
    });

    it('function option parameters former', function() {
      var type = parseType('function(?, number)');
      assert.deepEqual(type, {
        type: 'FunctionType',
        params: [{
          type: 'NullableLiteral'
        }, {
          type: 'NameExpression',
          name: 'number'
        }],
        result: null
      });
    });

    it('function option parameters latter', function() {
      var type = parseType('function(number, ?)');
      assert.deepEqual(type, {
        type: 'FunctionType',
        params: [{
          type: 'NameExpression',
          name: 'number'
        }, {
          type: 'NullableLiteral'
        }],
        result: null
      });
    });

    it('function type union', function() {
      var type = parseType('function(): ?|number');
      assert.deepEqual(type, {
        type: 'UnionType',
        elements: [
          {
            type: 'FunctionType',
            params: [],
            result: {
              type: 'NullableLiteral'
            }
          },
          {
            type: 'NameExpression',
            name: 'number'
          }
        ]
      });
    });
  });
});
