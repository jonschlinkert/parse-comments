'use strict';

require('mocha');
const assert = require('assert');
const doctrine = require('doctrine');

/**
 * integration tests from doctrine (since we use doctrine for parsing tags)
 * https://github.com/eslint/doctrine/LICENSE.BSD
 * https://github.com/eslint/doctrine/LICENSE.closure-compiler
 * https://github.com/eslint/doctrine/LICENSE.esprima
 */

describe('parse type (doctrine)', () => {
  describe('parseType', () => {
    it('union type closure-compiler extended', () => {
      let type = doctrine.parseType('string|number');
      assert.deepEqual(type, {
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
    });

    it('empty union type', () => {
      let type = doctrine.parseType('()');
      assert.deepEqual(type, {
        type: 'UnionType',
        elements: []
      });
    });

    it('comma last array type', () => {
      let type = doctrine.parseType('[string,]');
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
      let type = doctrine.parseType('[*]');
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
      let type = doctrine.parseType('[?]');
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
      let type = doctrine.parseType('{,}');
      assert.deepEqual(type, {
        type: 'RecordType',
        fields: []
      });
    });

    it('type application', () => {
      let type = doctrine.parseType('Array.<String>');
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
      let type = doctrine.parseType('Array<?>');
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
      let type = doctrine.parseType('Array.<String, Number>');
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
      let type = doctrine.parseType('Array<String>');
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
      let type = doctrine.parseType('String[]');
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
      let type = doctrine.parseType('function()');
      assert.deepEqual(type, {
        type: 'FunctionType',
        params: [],
        result: null
      });
    });

    it('function type with name', () => {
      let type = doctrine.parseType('function(a)');
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
      let type = doctrine.parseType('function(a:b)');
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
      let type = doctrine.parseType('function(a=)');
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
      let type = doctrine.parseType('function(a:b=)');
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
      let type = doctrine.parseType('function(...a)');
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
      let type = doctrine.parseType('function(...a:b)');
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
      let type = doctrine.parseType('function(...a=)');
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
      let type = doctrine.parseType('function(...a:b=)');
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
      let type;

      type = doctrine.parseType("{'ok':String}");
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

      type = doctrine.parseType('{"\\r\\n\\t\\u2028\\x20\\u20\\b\\f\\v\\\r\n\\\n\\0\\07\\012\\o":String}');
      assert.deepEqual(type, {
        fields: [
          {
            key: '\r\n\t\u2028\x20u20\b\f\v\0\u0007\u000ao',
            type: 'FieldType',
            value: {
              name: 'String',
              type: 'NameExpression'
            }
          }
        ],
        type: 'RecordType'
      });

      assert.throws(() => doctrine.parseType('{\'ok":String}'), /unexpected quote/);
      assert.throws(() => doctrine.parseType("{'o\n':String}"), /unexpected quote/);
    });

    it('number value in type', () => {
      let type = doctrine.parseType('{20:String}');
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

      type = doctrine.parseType('{.2:String, 30:Number, 0x20:String}');
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

      type = doctrine.parseType('{0X2:String, 0:Number, 100e200:String, 10e-20:Number}');
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

      assert.throws(() => doctrine.parseType('{0x:String}'), /unexpected token/);
      assert.throws(() => doctrine.parseType('{0x'), /unexpected token/);
      assert.throws(() => doctrine.parseType('{0xd'), /unexpected token/);
      assert.throws(() => doctrine.parseType('{0x2_:'), /unexpected token/);
      assert.throws(() => doctrine.parseType('{021:'), /unexpected token/);
      assert.throws(() => doctrine.parseType('{021_:'), /unexpected token/);
      assert.throws(() => doctrine.parseType('{021'), /unexpected token/);
      assert.throws(() => doctrine.parseType('{08'), /unexpected token/);
      assert.throws(() => doctrine.parseType('{0y'), /unexpected token/);
      assert.throws(() => doctrine.parseType('{0'), /unexpected token/);
      assert.throws(() => doctrine.parseType('{100e2'), /unexpected token/);
      assert.throws(() => doctrine.parseType('{100e-2'), /unexpected token/);
      assert.throws(() => doctrine.parseType('{100e-200:'), /unexpected token/);
      assert.throws(() => doctrine.parseType('{100e:'), /unexpected token/);
      assert.throws(() => doctrine.parseType('function(number=, string)'), /not reach to EOF/);
    });

    it('dotted type', () => {
      let type = doctrine.parseType('Cocoa.Cappuccino');
      assert.deepEqual(type, {
        name: 'Cocoa.Cappuccino',
        type: 'NameExpression'
      });
    });

    it('rest array type', () => {
      let type = doctrine.parseType('[string,...string]');
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
      let type = doctrine.parseType('string?');
      assert.deepEqual(type, {
        expression: {
          name: 'string',
          type: 'NameExpression'
        },
        prefix: false,
        type: 'NullableType'
      });
    });

    it('non-nullable type', () => {
      let type = doctrine.parseType('string!');
      assert.deepEqual(type, {
        expression: {
          name: 'string',
          type: 'NameExpression'
        },
        prefix: false,
        type: 'NonNullableType'
      });
    });

    it('toplevel multiple pipe type', () => {
      let type = doctrine.parseType('string|number|Test');
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
      let type = doctrine.parseType('"Hello, World"');
      assert.deepEqual(type, {
        type: 'StringLiteralType',
        value: 'Hello, World'
      });
    });

    it('numeric literal type', () => {
      let type = doctrine.parseType('32');
      assert.deepEqual(type, {
        type: 'NumericLiteralType',
        value: 32
      });
      type = doctrine.parseType('-142.42');
      assert.deepEqual(type, {
        type: 'NumericLiteralType',
        value: -142.42
      });
    });

    it('boolean literal type', () => {
      let type = doctrine.parseType('true');
      assert.deepEqual(type, {
        type: 'BooleanLiteralType',
        value: true
      });
      type = doctrine.parseType('false');
      assert.deepEqual(type, {
        type: 'BooleanLiteralType',
        value: false
      });
    });

    it('illegal tokens', () => {
      assert.throws(() => doctrine.parseType('.', /unexpected token/));
      assert.throws(() => doctrine.parseType('.d', /unexpected token/));
      assert.throws(() => doctrine.parseType('(', /unexpected token/));
      assert.throws(() => doctrine.parseType('Test.', /unexpected token/));
    });
  });

  describe('parseParamType', () => {
    it('question', () => {
      let type = doctrine.parseParamType('?');
      assert.deepEqual(type, {
        type: 'NullableLiteral'
      });
    });

    it('question option', () => {
      let type = doctrine.parseParamType('?=');
      assert.deepEqual(type, {
        type: 'OptionalType',
        expression: {
          type: 'NullableLiteral'
        }
      });
    });

    it('function option parameters former', () => {
      let type = doctrine.parseParamType('function(?, number)');
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
      let type = doctrine.parseParamType('function(number, ?)');
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

    it('function type union', () => {
      let type = doctrine.parseParamType('function(): ?|number');
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
