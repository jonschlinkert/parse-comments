'use strict';

require('mocha');
require('should');
var doctrine = require('doctrine');

/**
 * integration tests from doctrine (since we use doctrine for parsing tags)
 * https://github.com/eslint/doctrine/LICENSE.BSD
 * https://github.com/eslint/doctrine/LICENSE.closure-compiler
 * https://github.com/eslint/doctrine/LICENSE.esprima
 */

describe('parse type (doctrine)', function() {
  describe('parseType', function() {
    it('union type closure-compiler extended', function() {
      let type = doctrine.parseType('string|number');
      type.should.eql({
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

    it('empty union type', function() {
      let type = doctrine.parseType('()');
      type.should.eql({
        type: 'UnionType',
        elements: []
      });
    });

    it('comma last array type', function() {
      let type = doctrine.parseType('[string,]');
      type.should.eql({
        type: 'ArrayType',
        elements: [
          {
            type: 'NameExpression',
            name: 'string'
          }
        ]
      });
    });

    it('array type of all literal', function() {
      let type = doctrine.parseType('[*]');
      type.should.eql({
        type: 'ArrayType',
        elements: [
          {
            type: 'AllLiteral'
          }
        ]
      });
    });

    it('array type of nullable literal', function() {
      let type = doctrine.parseType('[?]');
      type.should.eql({
        type: 'ArrayType',
        elements: [
          {
            type: 'NullableLiteral'
          }
        ]
      });
    });

    it('comma last record type', function() {
      let type = doctrine.parseType('{,}');
      type.should.eql({
        type: 'RecordType',
        fields: []
      });
    });

    it('type application', function() {
      let type = doctrine.parseType('Array.<String>');
      type.should.eql({
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

    it('type application with NullableLiteral', function() {
      let type = doctrine.parseType('Array<?>');
      type.should.eql({
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

    it('type application with multiple patterns', function() {
      let type = doctrine.parseType('Array.<String, Number>');
      type.should.eql({
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

    it('type application without dot', function() {
      let type = doctrine.parseType('Array<String>');
      type.should.eql({
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

    it('array-style type application', function() {
      let type = doctrine.parseType('String[]');
      type.should.eql({
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

    it('function type simple', function() {
      let type = doctrine.parseType('function()');
      type.should.eql({
        type: 'FunctionType',
        params: [],
        result: null
      });
    });

    it('function type with name', function() {
      let type = doctrine.parseType('function(a)');
      type.should.eql({
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
    it('function type with name and type', function() {
      let type = doctrine.parseType('function(a:b)');
      type.should.eql({
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
    it('function type with optional param', function() {
      let type = doctrine.parseType('function(a=)');
      type.should.eql({
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
    it('function type with optional param name and type', function() {
      let type = doctrine.parseType('function(a:b=)');
      type.should.eql({
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
    it('function type with rest param', function() {
      let type = doctrine.parseType('function(...a)');
      type.should.eql({
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
    it('function type with rest param name and type', function() {
      let type = doctrine.parseType('function(...a:b)');
      type.should.eql({
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

    it('function type with optional rest param', function() {
      let type = doctrine.parseType('function(...a=)');
      type.should.eql({
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
    it('function type with optional rest param name and type', function() {
      let type = doctrine.parseType('function(...a:b=)');
      type.should.eql({
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

    it('string value in type', function() {
      let type;

      type = doctrine.parseType("{'ok':String}");
      type.should.eql({
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
      type.should.eql({
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

      doctrine.parseType.bind(doctrine, '{\'ok":String}').should.throw('unexpected quote');
      doctrine.parseType.bind(doctrine, "{'o\n':String}").should.throw('unexpected quote');
    });

    it('number value in type', function() {
      let type = doctrine.parseType('{20:String}');
      type.should.eql({
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
      type.should.eql({
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
      type.should.eql({
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

      doctrine.parseType.bind(doctrine, '{0x:String}').should.throw('unexpected token');
      doctrine.parseType.bind(doctrine, '{0x').should.throw('unexpected token');
      doctrine.parseType.bind(doctrine, '{0xd').should.throw('unexpected token');
      doctrine.parseType.bind(doctrine, '{0x2_:').should.throw('unexpected token');
      doctrine.parseType.bind(doctrine, '{021:').should.throw('unexpected token');
      doctrine.parseType.bind(doctrine, '{021_:').should.throw('unexpected token');
      doctrine.parseType.bind(doctrine, '{021').should.throw('unexpected token');
      doctrine.parseType.bind(doctrine, '{08').should.throw('unexpected token');
      doctrine.parseType.bind(doctrine, '{0y').should.throw('unexpected token');
      doctrine.parseType.bind(doctrine, '{0').should.throw('unexpected token');
      doctrine.parseType.bind(doctrine, '{100e2').should.throw('unexpected token');
      doctrine.parseType.bind(doctrine, '{100e-2').should.throw('unexpected token');
      doctrine.parseType.bind(doctrine, '{100e-200:').should.throw('unexpected token');
      doctrine.parseType.bind(doctrine, '{100e:').should.throw('unexpected token');
      doctrine.parseType.bind(doctrine, 'function(number=, string)').should.throw('not reach to EOF');
    });

    it('dotted type', function() {
      let type = doctrine.parseType('Cocoa.Cappuccino');
      type.should.eql({
        name: 'Cocoa.Cappuccino',
        type: 'NameExpression'
      });
    });

    it('rest array type', function() {
      let type = doctrine.parseType('[string,...string]');
      type.should.eql({
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

    it('nullable type', function() {
      let type = doctrine.parseType('string?');
      type.should.eql({
        expression: {
          name: 'string',
          type: 'NameExpression'
        },
        prefix: false,
        type: 'NullableType'
      });
    });

    it('non-nullable type', function() {
      let type = doctrine.parseType('string!');
      type.should.eql({
        expression: {
          name: 'string',
          type: 'NameExpression'
        },
        prefix: false,
        type: 'NonNullableType'
      });
    });

    it('toplevel multiple pipe type', function() {
      let type = doctrine.parseType('string|number|Test');
      type.should.eql({
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

    it('string literal type', function() {
      let type = doctrine.parseType('"Hello, World"');
      type.should.eql({
        type: 'StringLiteralType',
        value: 'Hello, World'
      });
    });

    it('numeric literal type', function() {
      let type = doctrine.parseType('32');
      type.should.eql({
        type: 'NumericLiteralType',
        value: 32
      });
      type = doctrine.parseType('-142.42');
      type.should.eql({
        type: 'NumericLiteralType',
        value: -142.42
      });
    });

    it('boolean literal type', function() {
      let type = doctrine.parseType('true');
      type.should.eql({
        type: 'BooleanLiteralType',
        value: true
      });
      type = doctrine.parseType('false');
      type.should.eql({
        type: 'BooleanLiteralType',
        value: false
      });
    });

    it('illegal tokens', function() {
      doctrine.parseType.bind(doctrine, '.').should.throw('unexpected token');
      doctrine.parseType.bind(doctrine, '.d').should.throw('unexpected token');
      doctrine.parseType.bind(doctrine, '(').should.throw('unexpected token');
      doctrine.parseType.bind(doctrine, 'Test.').should.throw('unexpected token');
    });
  });

  describe('parseParamType', function() {
    it('question', function() {
      let type = doctrine.parseParamType('?');
      type.should.eql({
        type: 'NullableLiteral'
      });
    });

    it('question option', function() {
      let type = doctrine.parseParamType('?=');
      type.should.eql({
        type: 'OptionalType',
        expression: {
          type: 'NullableLiteral'
        }
      });
    });

    it('function option parameters former', function() {
      let type = doctrine.parseParamType('function(?, number)');
      type.should.eql({
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

    it('function option parameters latter', function() {
      let type = doctrine.parseParamType('function(number, ?)');
      type.should.eql({
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

    it('function type union', function() {
      let type = doctrine.parseParamType('function(): ?|number');
      type.should.eql({
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
