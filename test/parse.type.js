'use strict';

require('mocha');
const assert = require('assert');
const doctrine = require('doctrine');
const parseType = require('../lib/parse/type');
const parse = (...args) => {
  let ast = parseType(...args);
  return ast.value;
};

describe('parse type', () => {
  describe('empty', () => {
    it('should parse an empty entries object', () => {
      assert.deepEqual(parse('{}'), doctrine.parseType('{}'));
    });
  });

  describe('types', () => {
    it('should parse a single type', () => {
      assert.deepEqual(parse('boolean'), doctrine.parseType('boolean'));
      assert.deepEqual(parse('Window'), doctrine.parseType('Window'));
      assert.deepEqual(parse('number'), doctrine.parseType('number'));
      assert.deepEqual(parse('_'), doctrine.parseType('_'));
      assert.deepEqual(parse('$'), doctrine.parseType('$'));
    });

    it('should parse a type with dot-notation', () => {
      assert.deepEqual(parse('foo.bar'), doctrine.parseType('foo.bar'));
      assert.deepEqual(parse('a.b.c'), doctrine.parseType('a.b.c'));
    });

    it('should parse multiple types', () => {
      assert.deepEqual(parse('boolean|string'), doctrine.parseType('boolean|string'));
    });

    it('should parse string literal union types', () => {
      assert.deepEqual(
        parse('(\'public\'|\'protected\'|\'private\')'),
        doctrine.parseType('(\'public\'|\'protected\'|\'private\')')
      );
    });
  });

  describe('parens', () => {
    it('should parse a type in parens', () => {
      assert.deepEqual(parse('(boolean)'), doctrine.parseType('(boolean)'));
      assert.deepEqual(parse('(Window)'), doctrine.parseType('(Window)'));
    });

    it('should parse multiple types in parens', () => {
      assert.deepEqual(parse('(boolean|string)'), doctrine.parseType('(boolean|string)'));
      assert.deepEqual(parse('(boolean|string|array)'), doctrine.parseType('(boolean|string|array)'));
    });
  });

  /**
   * Some of these following unit tests are based on tests from doctrine
   * https://github.com/eslint/doctrine
   * https://github.com/eslint/doctrine/LICENSE.BSD
   * https://github.com/eslint/doctrine/LICENSE.closure-compiler
   * https://github.com/eslint/doctrine/LICENSE.esprima
   */

  describe('parse', () => {
    it('should parse jsdoc expressions', () => {
      assert.deepEqual(parse('number'), {
        type: 'NameExpression',
        name: 'number'
      });
    });

    it('should parse jsdoc "all" expressions', () => {
      assert.deepEqual(parse('*'), {
        type: 'AllLiteral'
      });
    });

    it('should parse jsdoc "?"', () => {
      assert.deepEqual(parse('?'), {
        type: 'NullableLiteral'
      });
    });

    it('should parse jsdoc "!"', () => {
      assert.deepEqual(parse('!'), {
        type: 'NonNullableLiteral'
      });
    });

    it('union type closure-compiler extended', () => {
      assert.deepEqual(parse('string|number'), {
        type: 'UnionType',
        elements: [
          {
            type: 'NameExpression',
            name: 'string'
          },
          {
            type: 'NameExpression',
            name: 'number'
          }
        ]
      });

      assert.deepEqual(parse('(string|number)'), {
        type: 'UnionType',
        elements: [
          {
            type: 'NameExpression',
            name: 'string'
          },
          {
            type: 'NameExpression',
            name: 'number'
          }
        ]
      });

      assert.deepEqual(parse('string|array|number'), {
        type: 'UnionType',
        elements: [
          {
            type: 'NameExpression',
            name: 'string'
          },
          {
            type: 'NameExpression',
            name: 'array'
          },
          {
            type: 'NameExpression',
            name: 'number'
          }
        ]
      });
    });

    it('empty union type', () => {
      var type = parse('()');
      assert.deepEqual(type, {
        type: 'UnionType',
        elements: []
      });
    });

    it('array type', () => {
      var type = parse('[string]');
      assert.deepEqual(type, {
        type: 'ArrayType',
        elements: [
          {
            type: 'NameExpression',
            name: 'string'
          }
        ]
      });
    });

    it('comma last array type', () => {
      var type = parse('[string,]');
      assert.deepEqual(type, {
        type: 'ArrayType',
        elements: [
          {
            type: 'NameExpression',
            name: 'string'
          }
        ]
      });
    });

    it('array type of all literal', () => {
      var type = parse('[*]');
      assert.deepEqual(type, {
        type: 'ArrayType',
        elements: [
          {
            type: 'AllLiteral'
          }
        ]
      });
    });

    it('array type of nullable literal', () => {
      var type = parse('[?]');
      assert.deepEqual(type, {
        type: 'ArrayType',
        elements: [
          {
            type: 'NullableLiteral'
          }
        ]
      });
    });

    it('comma last record type', () => {
      var type = parse('{,}');
      assert.deepEqual(type, {
        type: 'RecordType',
        fields: []
      });
    });

    it('should parse record types', () => {
      var fixture = '{ a: number, b: string }';
      assert.deepEqual(parse(fixture), doctrine.parseType(fixture));
      fixture = '{a: number, b: string}';
      assert.deepEqual(parse(fixture), doctrine.parseType(fixture));
      fixture = '{a: number, b: string, c}';
      assert.deepEqual(parse(fixture), doctrine.parseType(fixture));
      fixture = '{ a: number, b : string, c }';
      assert.deepEqual(parse(fixture), doctrine.parseType(fixture));
      fixture = '{ a : number, b : string, c }';
      assert.deepEqual(parse(fixture), doctrine.parseType(fixture));
    });

    it('type application', () => {
      var type = parse('Array.<String>');
      assert.deepEqual(type, {
        type: 'TypeApplication',
        expression: {
          type: 'NameExpression',
          name: 'Array'
        },
        applications: [
          {
            type: 'NameExpression',
            name: 'String'
          }
        ]
      });
    });

    it('type application with NullableLiteral', () => {
      var type = parse('Array<?>');
      assert.deepEqual(type, {
        type: 'TypeApplication',
        expression: {
          type: 'NameExpression',
          name: 'Array'
        },
        applications: [
          {
            type: 'NullableLiteral'
          }
        ]
      });
    });

    it('type application with multiple patterns', () => {
      var type = parse('Array.<String, Number>');
      assert.deepEqual(type, {
        type: 'TypeApplication',
        expression: {
          type: 'NameExpression',
          name: 'Array'
        },
        applications: [
          {
            type: 'NameExpression',
            name: 'String'
          },
          {
            type: 'NameExpression',
            name: 'Number'
          }
        ]
      });
    });

    it('type application without dot', () => {
      var type = parse('Array<String>');
      assert.deepEqual(type, {
        type: 'TypeApplication',
        expression: {
          type: 'NameExpression',
          name: 'Array'
        },
        applications: [
          {
            type: 'NameExpression',
            name: 'String'
          }
        ]
      });
    });

    it('array-style type application', () => {
      const type = parse('String[]');
      assert.deepEqual(type, {
        type: 'TypeApplication',
        expression: {
          type: 'NameExpression',
          name: 'Array'
        },
        applications: [
          {
            type: 'NameExpression',
            name: 'String'
          }
        ]
      });
    });

    it('function type simple', () => {
      var type = parse('function()');
      assert.deepEqual(type, {
        type: 'FunctionType',
        params: [],
        result: null
      });
    });

    it('function type with name', () => {
      var type = parse('function(a)');
      assert.deepEqual(type, {
        type: 'FunctionType',
        params: [
          {
            type: 'NameExpression',
            name: 'a'
          }
        ],
        result: null
      });
    });

    it('function type with name and type', () => {
      var type = parse('function(a:b)');
      assert.deepEqual(type, {
        type: 'FunctionType',
        params: [
          {
            type: 'ParameterType',
            name: 'a',
            expression: {
              type: 'NameExpression',
              name: 'b'
            }
          }
        ],
        result: null
      });
    });

    it('function type with optional param', () => {
      var type = parse('function(a=)');
      assert.deepEqual(type, {
        type: 'FunctionType',
        params: [
          {
            type: 'OptionalType',
            expression: {
              type: 'NameExpression',
              name: 'a'
            }
          }
        ],
        result: null
      });
    });

    it('function type with optional param name and type', () => {
      var type = parse('function(a:b=)');
      assert.deepEqual(type, {
        type: 'FunctionType',
        params: [
          {
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
        ],
        result: null
      });
    });

    it('function type with rest param', () => {
      var type = parse('function(...a)');
      assert.deepEqual(type, {
        type: 'FunctionType',
        params: [
          {
            type: 'RestType',
            expression: {
              type: 'NameExpression',
              name: 'a'
            }
          }
        ],
        result: null
      });
    });

    it('function type with rest param name and type', () => {
      var type = parse('function(...a:b)');
      assert.deepEqual(type, {
        type: 'FunctionType',
        params: [
          {
            type: 'RestType',
            expression: {
              type: 'ParameterType',
              name: 'a',
              expression: {
                type: 'NameExpression',
                name: 'b'
              }
            }
          }
        ],
        result: null
      });
    });

    it('function type with optional rest param', () => {
      var type = parse('function(...a=)');
      assert.deepEqual(type, {
        type: 'FunctionType',
        params: [
          {
            type: 'RestType',
            expression: {
              type: 'OptionalType',
              expression: {
                type: 'NameExpression',
                name: 'a'
              }
            }
          }
        ],
        result: null
      });
    });

    it('function type with optional rest param name and type', () => {
      var type = parse('function(...a:b=)');
      assert.deepEqual(type, {
        type: 'FunctionType',
        params: [
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
          }
        ],
        result: null
      });
    });

    it('string value in type', () => {
      var type;

      type = parse("{'ok':String}");
      assert.deepEqual(type, {
        fields: [
          {
            key: 'ok',
            type: 'FieldType',
            value: {
              name: 'String',
              type: 'NameExpression'
            }
          }
        ],
        type: 'RecordType'
      });

      // type = parse('{"\\r\\n\\t\\u2028\\x20\\u20\\b\\f\\v\\\r\n\\\n\\0\\07\\012\\o":String}');
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

      assert.throws(() => parse('{\'ok":String}'));
      // parse.bind(doctrine, "{'o\n':String}").should.throw();
    });

    it('number value in type', () => {
      let type = parse('{20:String}');
      assert.deepEqual(type, {
        fields: [
          {
            key: '20',
            type: 'FieldType',
            value: {
              name: 'String',
              type: 'NameExpression'
            }
          }
        ],
        type: 'RecordType'
      });
    });

    it('multiple number values in type', () => {
      let type = parse('{.2:String, 30:Number, 0x20:String}');
      assert.deepEqual(type, {
        fields: [
          {
            key: '0.2',
            type: 'FieldType',
            value: {
              name: 'String',
              type: 'NameExpression'
            }
          },
          {
            key: '30',
            type: 'FieldType',
            value: {
              name: 'Number',
              type: 'NameExpression'
            }
          },
          {
            key: '32',
            type: 'FieldType',
            value: {
              name: 'String',
              type: 'NameExpression'
            }
          }
        ],
        type: 'RecordType'
      });

      type = parse('{0X2:String, 0:Number, 100e200:String, 10e-20:Number}');
      assert.deepEqual(type, {
        fields: [
          {
            key: '2',
            type: 'FieldType',
            value: {
              name: 'String',
              type: 'NameExpression'
            }
          },
          {
            key: '0',
            type: 'FieldType',
            value: {
              name: 'Number',
              type: 'NameExpression'
            }
          },
          {
            key: '1e+202',
            type: 'FieldType',
            value: {
              name: 'String',
              type: 'NameExpression'
            }
          },
          {
            key: '1e-19',
            type: 'FieldType',
            value: {
              name: 'Number',
              type: 'NameExpression'
            }
          }
        ],
        type: 'RecordType'
      });

      // parse.bind(doctrine, '{0x:String}').should.throw('unexpected token');
      // parse.bind(doctrine, '{0x').should.throw('unexpected token');
      // parse.bind(doctrine, '{0xd').should.throw('unexpected token');
      // parse.bind(doctrine, '{0x2_:').should.throw('unexpected token');
      // parse.bind(doctrine, '{021:').should.throw('unexpected token');
      // parse.bind(doctrine, '{021_:').should.throw('unexpected token');
      // parse.bind(doctrine, '{021').should.throw('unexpected token');
      // parse.bind(doctrine, '{08').should.throw('unexpected token');
      // parse.bind(doctrine, '{0y').should.throw('unexpected token');
      // parse.bind(doctrine, '{0').should.throw('unexpected token');
      // parse.bind(doctrine, '{100e2').should.throw('unexpected token');
      // parse.bind(doctrine, '{100e-2').should.throw('unexpected token');
      // parse.bind(doctrine, '{100e-200:').should.throw('unexpected token');
      // parse.bind(doctrine, '{100e:').should.throw('unexpected token');
      // parse.bind(doctrine, 'function(number=, string)').should.throw('not reach to EOF');
    });

    it('dotted type', () => {
      var type = parse('Cocoa.Cappuccino');
      assert.deepEqual(type, {
        name: 'Cocoa.Cappuccino',
        type: 'NameExpression'
      });
    });

    it('rest array type', () => {
      var type = parse('[string,...string]');
      assert.deepEqual(type, {
        elements: [
          {
            name: 'string',
            type: 'NameExpression'
          },
          {
            expression: {
              name: 'string',
              type: 'NameExpression'
            },
            type: 'RestType'
          }
        ],
        type: 'ArrayType'
      });
    });

    it('nullable type', () => {
      assert.deepEqual(parse('string?'), doctrine.parseType('string?'));
      assert.deepEqual(parse('string?'), {
        expression: {
          name: 'string',
          type: 'NameExpression'
        },
        prefix: false,
        type: 'NullableType'
      });

      assert.deepEqual(parse('?string'), doctrine.parseType('?string'));
      assert.deepEqual(parse('?string'), {
        expression: {
          name: 'string',
          type: 'NameExpression'
        },
        prefix: true,
        type: 'NullableType'
      });
    });

    it('non-nullable type', () => {
      assert.deepEqual(parse('!string'), doctrine.parseType('!string'));
      assert.deepEqual(parse('!string'), {
        expression: {
          name: 'string',
          type: 'NameExpression'
        },
        prefix: true,
        type: 'NonNullableType'
      });

      assert.deepEqual(parse('string!'), doctrine.parseType('string!'));
      assert.deepEqual(parse('string!'), {
        expression: {
          name: 'string',
          type: 'NameExpression'
        },
        prefix: false,
        type: 'NonNullableType'
      });
    });

    it('toplevel multiple pipe type', () => {
      var type = parse('string|number|Test');
      assert.deepEqual(type, {
        elements: [
          {
            name: 'string',
            type: 'NameExpression'
          },
          {
            name: 'number',
            type: 'NameExpression'
          },
          {
            name: 'Test',
            type: 'NameExpression'
          }
        ],
        type: 'UnionType'
      });
    });

    it('string literal type', () => {
      var type = parse('"Hello, World"');
      assert.deepEqual(type, {
        type: 'StringLiteralType',
        value: 'Hello, World'
      });
    });

    it('numeric literal type', () => {
      var type = parse('32');
      assert.deepEqual(type, {
        type: 'NumericLiteralType',
        value: 32
      });
      type = parse('-142.42');
      assert.deepEqual(type, {
        type: 'NumericLiteralType',
        value: -142.42
      });
    });

    it('boolean literal type', () => {
      var type = parse('true');
      assert.deepEqual(type, {
        type: 'BooleanLiteralType',
        value: true
      });
      type = parse('false');
      assert.deepEqual(type, {
        type: 'BooleanLiteralType',
        value: false
      });
    });

    // it('illegal tokens', () => {
    //   parse.bind(doctrine, '.').should.throw('unexpected token');
    //   parse.bind(doctrine, '.d').should.throw('unexpected token');
    //   parse.bind(doctrine, '(').should.throw('unexpected token');
    //   parse.bind(doctrine, 'Test.').should.throw('unexpected token');
    // });
  });

  describe('parseParamType', () => {
    it('question', () => {
      var type = parse('?');
      assert.deepEqual(type, {
        type: 'NullableLiteral'
      });
    });

    it('function option parameters former', () => {
      var type = parse('function(?, number)');
      assert.deepEqual(type, {
        type: 'FunctionType',
        params: [
          {
            type: 'NullableLiteral'
          },
          {
            type: 'NameExpression',
            name: 'number'
          }
        ],
        result: null
      });
    });

    it('function option parameters latter', () => {
      var type = parse('function(number, ?)');
      assert.deepEqual(type, {
        type: 'FunctionType',
        params: [
          {
            type: 'NameExpression',
            name: 'number'
          },
          {
            type: 'NullableLiteral'
          }
        ],
        result: null
      });
    });

    // the following unit test differs from doctrine. I (jon schlinkert) think
    // doctrine's result is wrong, and parse-comments is correct. If my assumption
    // is wrong, please create an issue to discuss.
    it('function type union', () => {
      const type = parse('function(): ?|number');
      const expected = {
        type: 'FunctionType',
        params: [],
        result: {
          type: 'TypeUnion',
          elements: [{ type: 'NullableLiteral' }, { type: 'NameExpression', name: 'number' }]
        }
      };

      assert.deepEqual(type, expected);

      // the following is the result from doctrine

      // assert.deepEqual(type, {
      //   type: 'UnionType',
      //   elements: [
      //     { type: 'FunctionType', params: [], result: { type: 'NullableLiteral' } },
      //     { type: 'NameExpression', name: 'number' }
      //   ]
      // });
    });
  });
});
