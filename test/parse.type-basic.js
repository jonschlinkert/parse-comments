// 'use strict';

// require('mocha');
// var assert = require('assert');
// var doctrine = require('doctrine');
// var parseTypes = require('../lib/parse/type');

// function parse(str, options) {
//   var tag = {};
//   tag.types = parseTypes(str, tag, options);
//   return tag;
// }

// describe('parseTypes', function() {
//   describe('empty', function() {
//     it('should parse an empty entries object', function() {
//       assert.deepEqual(parse('{}'), { types: [ { name: 'boolean' } ] });
//     });
//   });

//   describe('types', function() {
//     it('should parse a single type', function() {
//       assert.deepEqual(parse('boolean'), { types: [ { name: 'boolean' } ] });
//       assert.deepEqual(parse('Window'), { types: [ { name: 'Window' } ] });
//       assert.deepEqual(parse('number'), { types: [ { name: 'number' } ] });
//       assert.deepEqual(parse('_'), { types: [ { name: '_' } ] });
//       assert.deepEqual(parse('$'), { types: [ { name: '$' } ] });
//     });

//     it('should parse a type with dot-notation', function() {
//       assert.deepEqual(parse('foo.bar'), { types: [ { name: 'foo.bar' } ] });
//       assert.deepEqual(parse('a.b.c'), { types: [ { name: 'a.b.c' } ] });
//     });

//     it('should parse multiple types', function() {
//       assert.deepEqual(parse('boolean|string'), {
//         types: [
//           { name: 'boolean' },
//           { name: 'string' }
//         ]
//       });
//     });
//   });

//   describe('parens', function() {
//     it('should parse a type in parens', function() {
//       assert.deepEqual(parse('(boolean)'), { types: [ { name: 'boolean' } ] });
//       assert.deepEqual(parse('(Window)'), { types: [ { name: 'Window' } ] });
//     });

//     it('should parse multiple types in parens', function() {
//       assert.deepEqual(parse('(boolean|string)'), {
//         types: [
//           { name: 'boolean' },
//           { name: 'string' }
//         ]
//       });

//       assert.deepEqual(parse('(boolean|string|array)'), {
//         types: [
//           { name: 'boolean' },
//           { name: 'string' },
//           { name: 'array' }
//         ]
//       });
//     });
//   });

//   describe('any', function() {
//     it('should set tag.any to true when * is defined', function() {
//       assert.deepEqual(parse('(*)'), { types: [], any: true });
//       assert.deepEqual(parse('*'), { types: [], any: true });
//     });

//     it('should set tag.any to true when tag.name is "all"', function() {
//       assert.deepEqual(parse('(all)'), { types: [], any: true });
//       assert.deepEqual(parse('all'), { types: [], any: true });
//     });

//     it('should set tag.any to true when tag.name is "any"', function() {
//       assert.deepEqual(parse('(any)'), { types: [], any: true });
//       assert.deepEqual(parse('any'), { types: [], any: true });
//     });
//   });

//   describe('unknown', function() {
//     it('should set tag.unknown to true when ? is defined', function() {
//       assert.deepEqual(parse('(?)'), { types: [], unknown: true });
//       assert.deepEqual(parse('?'), { types: [], unknown: true });
//     });

//     it('should set tag.unknown to true when tag.name is "unknown"', function() {
//       assert.deepEqual(parse('(unknown)'), { types: [], unknown: true });
//       assert.deepEqual(parse('unknown'), { types: [], unknown: true });
//     });
//   });

//   describe('variadic', function() {
//     it('should set variadic to "true" when an argument is ...', function() {
//       assert.deepEqual(parse('boolean|string|...'), {
//         types: [
//           { name: 'boolean' },
//           { name: 'string' }
//         ],
//         variadic: true
//       });

//       assert.deepEqual(parse('(boolean|string)...'), {
//         types: [
//           { name: 'boolean' },
//           { name: 'string' }
//         ],
//         variadic: true
//       });

//       assert.deepEqual(parse('(boolean|...|string)'), {
//         types: [
//           { name: 'boolean' },
//           { name: 'string' }
//         ],
//         variadic: true
//       });

//       assert.deepEqual(parse('(boolean|string|...)'), {
//         types: [
//           { name: 'boolean' },
//           { name: 'string' }
//         ],
//         variadic: true
//       });
//     });

//     it('should set variadic to "true" when param has ...', function() {
//       assert.deepEqual(parse('boolean...'), {
//         types: [
//           { name: 'boolean' }
//         ],
//         variadic: true
//       });

//       assert.deepEqual(parse('...number'), {
//         types: [
//           { name: 'number' }
//         ],
//         variadic: true
//       });

//       assert.deepEqual(parse('...number|string'), {
//         types: [
//           { name: 'number' },
//           { name: 'string' }
//         ],
//         variadic: true
//       });
//     });
//   });

//   describe('optional', function() {
//     it('should set optional to "true" when trailing = is defined', function() {
//       assert.deepEqual(parse('boolean|string='), {
//         types: [
//           { name: 'boolean' },
//           { name: 'string' }
//         ],
//         optional: true
//       });

//       assert.deepEqual(parse('(boolean|string=)'), {
//         types: [
//           { name: 'boolean' },
//           { name: 'string' }
//         ],
//         optional: true
//       });

//       assert.deepEqual(parse('(boolean=|string)'), {
//         types: [
//           { name: 'boolean' },
//           { name: 'string' }
//         ],
//         optional: true
//       });
//     });

//     it('should set optional to "true" when leading = is defined', function() {
//       assert.deepEqual(parse('boolean|=string'), {
//         types: [
//           { name: 'boolean' },
//           { name: 'string' }
//         ],
//         optional: true
//       });

//       assert.deepEqual(parse('(boolean|=string)'), {
//         types: [
//           { name: 'boolean' },
//           { name: 'string' }
//         ],
//         optional: true
//       });

//       assert.deepEqual(parse('(=boolean|string)'), {
//         types: [
//           { name: 'boolean' },
//           { name: 'string' }
//         ],
//         optional: true
//       });
//     });

//     it('should work when multiple equals are defined', function() {
//       assert.deepEqual(parse('boolean|=string='), {
//         types: [
//           { name: 'boolean' },
//           { name: 'string' }
//         ],
//         optional: true
//       });

//       assert.deepEqual(parse('(=boolean=|=string)'), {
//         types: [
//           { name: 'boolean' },
//           { name: 'string' }
//         ],
//         optional: true
//       });

//       assert.deepEqual(parse('(=boolean=|=string=)'), {
//         types: [
//           { name: 'boolean' },
//           { name: 'string' }
//         ],
//         optional: true
//       });
//     });
//   });

//   describe('nullable', function() {
//     it('should parse nullable types', function() {
//       assert.deepEqual(parse('?number'), {
//         types: [
//           { name: 'number' }
//         ],
//         nullable: true
//       });

//       assert.deepEqual(parse('?number|string'), {
//         types: [
//           { name: 'number' },
//           { name: 'string' }
//         ],
//         nullable: true
//       });
//     });

//     it('should parse optional nullable types', function() {
//       assert.deepEqual(parse('?number|string='), {
//         types: [
//           { name: 'number' },
//           { name: 'string' }
//         ],
//         nullable: true,
//         optional: true
//       });

//       assert.deepEqual(parse('?number=|string='), {
//         types: [
//           { name: 'number' },
//           { name: 'string' }
//         ],
//         nullable: true,
//         optional: true
//       });

//       assert.deepEqual(parse('?number=|?string='), {
//         types: [
//           { name: 'number' },
//           { name: 'string' }
//         ],
//         nullable: true,
//         optional: true
//       });
//     });

//     it('should support trailing question marks', function() {
//       assert.deepEqual(parse('number?'), {
//         nullable: true,
//         types: [
//           { name: 'number' }
//         ]
//       });

//       assert.deepEqual(parse('number?|string?'), {
//         nullable: true,
//         types: [
//           { name: 'number' },
//           { name: 'string' }
//         ]
//       });
//     });
//   });

//   describe('non-nullable', function() {
//     it('should parse non-nullable types', function() {
//       assert.deepEqual(parse('!number'), {
//         types: [
//           { name: 'number' }
//         ],
//         nullable: false
//       });

//       assert.deepEqual(parse('!number|string'), {
//         types: [
//           { name: 'number' },
//           { name: 'string' }
//         ],
//         nullable: false
//       });
//     });

//     it('should parse optional nullable types', function() {
//       assert.deepEqual(parse('!number|string='), {
//         types: [
//           { name: 'number' },
//           { name: 'string' }
//         ],
//         nullable: false,
//         optional: true
//       });

//       assert.deepEqual(parse('!number=|string='), {
//         types: [
//           { name: 'number' },
//           { name: 'string' }
//         ],
//         nullable: false,
//         optional: true
//       });

//       assert.deepEqual(parse('!number=|!string='), {
//         types: [
//           { name: 'number' },
//           { name: 'string' }
//         ],
//         nullable: false,
//         optional: true
//       });
//     });
//   });

//   describe('parameterTypeUnions', function() {
//     it('should parse function union types', function() {
//       assert.deepEqual(parse('function()'), {
//         types: [{
//           parameterTypeUnions: []
//         }]
//       });

//       assert.deepEqual(parse('function(string)'), {
//         types: [{
//           parameterTypeUnions: [{
//             types: [
//               {name: 'string'}
//             ]
//           }]
//         }]
//       });

//       assert.deepEqual(parse('function(string|array)'), {
//         types: [{
//           parameterTypeUnions: [{
//             types: [
//               {name: 'string'},
//               {name: 'array'}
//             ]
//           }]
//         }]
//       });

//       assert.deepEqual(parse('function(string|array=)'), {
//         types: [{
//           parameterTypeUnions: [{
//             types: [
//               {name: 'string'},
//               {name: 'array', optional: true}
//             ]
//           }]
//         }]
//       });

//       assert.deepEqual(parse('function(string|array=)'), {
//         types: [{
//           parameterTypeUnions: [{
//             types: [
//               {name: 'string'},
//               {name: 'array', optional: true}
//             ]
//           }]
//         }]
//       });

//       assert.deepEqual(parse('function(string|!array)'), {
//         types: [{
//           parameterTypeUnions: [{
//             types: [
//               {name: 'string'},
//               {name: 'array', nullable: false}
//             ]
//           }]
//         }]
//       });

//       assert.deepEqual(parse('function(?string=, number=)'), {
//         types: [{
//           parameterTypeUnions: [{
//             types: [
//               {name: 'string', nullable: true, optional: true}
//             ]
//           }, {
//             types: [
//               {name: 'number', optional: true}
//             ]
//           }]
//         }]
//       });

//       assert.deepEqual(parse('function(string, boolean)'), {
//         types: [{
//           parameterTypeUnions: [{
//             types: [{
//               name: 'string'
//             }]
//           }, {
//             types: [{
//               name: 'boolean'
//             }]
//           }]
//         }]
//       });

//       assert.deepEqual(parse('function(string, boolean=)'), {
//         types: [{
//           parameterTypeUnions: [{
//             types: [{
//               name: 'string'
//             }]
//           }, {
//             types: [{
//               name: 'boolean',
//               optional: true
//             }]
//           }]
//         }]
//       });
//     });

//     it('should parse union types', function() {
//       assert.deepEqual(parse('string[]'), {
//         types: [{
//           parameterTypeUnions: [{
//             types: [{
//               name: 'string'
//             }]
//           }],
//           genericTypeName: {
//             name: 'Array'
//           }
//         }]
//       });

//       assert.deepEqual(parse('Array[]'), {
//         types: [{
//           parameterTypeUnions: [{
//             types: [{
//               name: 'Array'
//             }]
//           }],
//           genericTypeName: {
//             name: 'Array'
//           }
//         }]
//       });

//       assert.deepEqual(parse('(String|Array)[]'), {
//         types: [{
//           parameterTypeUnions: [{
//             types: [{
//               name: 'String'
//             }, {
//               name: 'Array'
//             }]
//           }],
//           genericTypeName: {
//             name: 'Array'
//           }
//         }]
//       });
//     });
//   });

//   describe('returnTypeUnion', function() {
//     it('should parse variable return types', function() {
//       assert.deepEqual(parse('function(string|object): number'), {
//         types: [{
//           parameterTypeUnions: [{
//             types: [{
//               name: 'string'
//             },
//             {
//               name: 'object'
//             }]
//           }],
//           returnTypeUnion: {
//             types: [{
//               name: 'number'
//             }]
//           }
//         }]
//       });

//       let fixture = 'function(string|object, array): number';
//       assert.deepEqual(parse(fixture), doctrine.parseType(fixture));
//       // assert.deepEqual(parse(fixture), catharsis.parse(fixture));
//       assert.deepEqual(parse(fixture), {
//         types: [{
//           parameterTypeUnions: [{
//             types: [{
//               name: 'string'
//             },
//             {
//               name: 'object'
//             }]
//           }, {
//             types: [{
//               name: 'array'
//             }]
//           }],
//           returnTypeUnion: {
//             types: [{
//               name: 'number'
//             }]
//           }
//         }]
//       });

//       // assert.deepEqual(parse('function((string|object), array): number'), {
//       //   types: [{
//       //     parameterTypeUnions: [{
//       //       types: [{
//       //         name: 'string'
//       //       },
//       //       {
//       //         name: 'object'
//       //       }]
//       //     }, {
//       //       types: [{
//       //         name: 'array'
//       //       }]
//       //     }],
//       //     returnTypeUnion: {
//       //       types: [{
//       //         name: 'number'
//       //       }]
//       //     }
//       //   }]
//       // });
//     });

//     it('should parse return types', function() {
//       assert.deepEqual(parse('function(string, object): number'), {
//         types: [{
//           parameterTypeUnions: [{
//             types: [{
//               name: 'string'
//             }]
//           }, {
//             types: [{
//               name: 'object'
//             }]
//           }],
//           returnTypeUnion: {
//             types: [{
//               name: 'number'
//             }]
//           }
//         }]
//       });

//       assert.deepEqual(parse('function(string, object): number|string'), {
//         types: [{
//           parameterTypeUnions: [{
//             types: [{
//               name: 'string'
//             }]
//           }, {
//             types: [{
//               name: 'object'
//             }]
//           }],
//           returnTypeUnion: {
//             types: [{
//               name: 'number'
//             }, {
//               name: 'string'
//             }]
//           }
//         }]
//       });

//       assert.deepEqual(parse('function(string, object): (number|string)'), {
//         types: [{
//           parameterTypeUnions: [{
//             types: [{
//               name: 'string'
//             }]
//           }, {
//             types: [{
//               name: 'object'
//             }]
//           }],
//           returnTypeUnion: {
//             types: [{
//               name: 'number'
//             }, {
//               name: 'string'
//             }]
//           }
//         }]
//       });

//       assert.deepEqual(parse('function(string, object): (number|string=)'), {
//         types: [{
//           parameterTypeUnions: [{
//             types: [{
//               name: 'string'
//             }]
//           }, {
//             types: [{
//               name: 'object'
//             }]
//           }],
//           returnTypeUnion: {
//             optional: true,
//             types: [{
//               name: 'number'
//             }, {
//               name: 'string'
//             }]
//           }
//         }]
//       });
//     });
//   });

//   describe('entries', function() {
//     it('should parse entries', function() {
//       var expected = {
//         types: [
//           {
//             entries: [
//               {
//                 name: 'stream',
//                 typeUnion: {types: [{name: 'Writable'}, {name: 'Foo'}]}
//               }
//             ]
//           },
//           {name: 'String'},
//           {name: 'Array'}
//         ]
//       };

//       assert.deepEqual(parse('{stream: (Writable|Foo)}|(String|Array)'), expected);
//       assert.deepEqual(parse('({stream: Writable|Foo}|String|Array)'), expected);
//       assert.deepEqual(parse('{stream: (Writable|Foo)}|String|Array'), expected);
//       assert.deepEqual(parse('{stream: Writable|Foo}|String|Array'), expected);

//       assert.deepEqual(parse('{foo: number|bar}'), {
//         types: [{
//           entries: [{
//             name: 'foo',
//             typeUnion: {
//               types: [{
//                 name: 'number'
//               }, {
//                 name: 'bar'
//               }]
//             }
//           }]
//         }]
//       });
//     });

//     it('should parse comma-separated entries', function() {
//       assert.deepEqual(parse('{foo: number, string}'), {
//         types: [{
//           entries: [{
//             name: 'foo',
//             typeUnion: {
//               types: [{
//                 name: 'number'
//               }]
//             }
//           }, {
//             name: 'string',
//             typeUnion: {
//               types: [],
//               all: true
//             }
//           }]
//         }]
//       });

//       assert.deepEqual(parse('{foo: number, string, array}'), {
//         types: [{
//           entries: [{
//             name: 'foo',
//             typeUnion: {
//               types: [{
//                 name: 'number'
//               }]
//             }
//           }, {
//             name: 'string',
//             typeUnion: {
//               types: [],
//               all: true
//             }
//           }, {
//             name: 'array',
//             typeUnion: {
//               types: [],
//               all: true
//             }
//           }]
//         }]
//       });
//     });

//     it.skip('should parse multiple comma-separated entries', function() {
//       assert.deepEqual(doctrine.parseType('{foo: number, bar: string, array}'), {
//         types: [{
//           entries: [{
//             name: 'foo',
//             typeUnion: {
//               types: [{
//                 name: 'number'
//               }]
//             }
//           }, {
//             name: 'bar',
//             typeUnion: {
//               types: [{
//                 name: 'string'
//               }]
//             }
//           }, {
//             name: 'array',
//             typeUnion: {
//               types: [],
//               all: true
//             }
//           }]
//         }]
//       });
//     });
//   });

//   describe('options.jsdoc', function() {
//     describe('all', function() {
//       it('should set tag.all to true when * is defined', function() {
//         assert.deepEqual(parse('(*)', {jsdoc: true}), { types: [], all: true });
//         assert.deepEqual(parse('*', {jsdoc: true}), { types: [], all: true });
//       });

//       it('should set tag.all to true when tag.name is "all"', function() {
//         assert.deepEqual(parse('(all)', {jsdoc: true}), { types: [], all: true });
//         assert.deepEqual(parse('all', {jsdoc: true}), { types: [], all: true });
//       });

//       it('should set tag.all to true when tag.name is "any"', function() {
//         assert.deepEqual(parse('(any)', {jsdoc: true}), { types: [], all: true });
//         assert.deepEqual(parse('any', {jsdoc: true}), { types: [], all: true });
//       });
//     });

//     describe('variable', function() {
//       it('should set variable to "true" when an argument is ...', function() {
//         assert.deepEqual(parse('boolean|string|...', {jsdoc: true}), {
//           types: [
//             { name: 'boolean' },
//             { name: 'string' }
//           ],
//           variable: true
//         });

//         assert.deepEqual(parse('(boolean|string)...', {jsdoc: true}), {
//           types: [
//             { name: 'boolean' },
//             { name: 'string' }
//           ],
//           variable: true
//         });

//         assert.deepEqual(parse('(boolean|...|string)', {jsdoc: true}), {
//           types: [
//             { name: 'boolean' },
//             { name: 'string' }
//           ],
//           variable: true
//         });

//         assert.deepEqual(parse('(boolean|string|...)', {jsdoc: true}), {
//           types: [
//             { name: 'boolean' },
//             { name: 'string' }
//           ],
//           variable: true
//         });
//       });

//       it('should set variable to "true" when an argument has ...', function() {
//         assert.deepEqual(parse('boolean...', {jsdoc: true}), {
//           types: [
//             { name: 'boolean' }
//           ],
//           variable: true
//         });

//         assert.deepEqual(parse('...number', {jsdoc: true}), {
//           types: [
//             { name: 'number' }
//           ],
//           variable: true
//         });

//         assert.deepEqual(parse('...number|string', {jsdoc: true}), {
//           types: [
//             { name: 'number' },
//             { name: 'string' }
//           ],
//           variable: true
//         });
//       });
//     });
//   });

//   describe('errors', function() {
//     it('should throw when a paren is unclosed', function() {
//       assert.throws(function() {
//         parse('(boolean=|string');
//       }, /unclosed paren: \(boolean=\|string/);
//     });
//   });
// });
