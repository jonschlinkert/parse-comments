'use strict';

require('mocha');
const assert = require('assert');
const doctrine = require('doctrine');
const Comments = require('..');
let comments;

/**
 * Some of these tests are based on tests from doctrine
 * https://github.com/eslint/doctrine/LICENSE.BSD
 * https://github.com/eslint/doctrine/LICENSE.closure-compiler
 * https://github.com/eslint/doctrine/LICENSE.esprima
 */

const hasProperty = (obj, key, value) => {
  if (Array.isArray(obj)) {
    if (!obj.includes(key)) return false;
    return true;
  }
  if (!obj.hasOwnProperty(key)) return false;
  return true;
};

const containEqual = (obj, key, value) => {
  return true;
};

describe('parse tag', () => {
  beforeEach(function() {
    comments = new Comments({
      allowSingleStar: true,
      parse: {
        type(str, tag, options) {
          return doctrine.parseType(str, options);
        },
        paramType(str, options) {
          return doctrine.parseParamType(str, options);
        },
        comment(comment, options) {
          return doctrine.parse(comment, options);
        }
      },
      format(comment, options) {
        return comment;
      }
    });
  });

  describe('parse', () => {
    it('alias', () => {
      let res = comments.parseComment('/** @alias */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 0);
    });

    it('alias with name', () => {
      let res = comments.parseComment('/** @alias aliasName */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'alias'));
      assert(hasProperty(res.tags[0], 'name', 'aliasName'));
    });

    it('alias with namepath', () => {
      let res = comments.parseComment('/** @alias aliasName.OK */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'alias'));
      assert(hasProperty(res.tags[0], 'name', 'aliasName.OK'));
    });

    it('alias with namepath', () => {
      let res = comments.parseComment('/** @alias module:mymodule/mymodule.init */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'alias'));
      assert(hasProperty(res.tags[0], 'name', 'module:mymodule/mymodule.init'));
    });

    it('alias with namepath with hyphen in it', () => {
      let res = comments.parseComment('/** @alias module:mymodule/my-module */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'alias'));
      assert(hasProperty(res.tags[0], 'name', 'module:mymodule/my-module'));
    });

    it('const', () => {
      let res = comments.parseComment('/** @const */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'const'));
    });

    it('const with name', () => {
      let res = comments.parseComment('/** @const constname */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'const'));
      assert(hasProperty(res.tags[0], 'name', 'constname'));
    });

    it('constant with name', () => {
      let res = comments.parseComment('/** @constant constname */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'constant'));
      assert(hasProperty(res.tags[0], 'name', 'constname'));
    });

    it('const with type and name', () => {
      let res = comments.parseComment('/** @const {String} constname */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'const'));
      assert(hasProperty(res.tags[0], 'name', 'constname'));
      assert(hasProperty(res.tags[0], 'type'));
      assert.deepEqual(res.tags[0].type, {
        type: 'NameExpression',
        name: 'String'
      });
    });

    it('Const with type and name', () => {
      let res = comments.parseComment('/** @Const {String} constname */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'Const'));
      assert(hasProperty(res.tags[0], 'name', 'constname'));
      assert(hasProperty(res.tags[0], 'type'));
      assert.deepEqual(res.tags[0].type, {
        type: 'NameExpression',
        name: 'String'
      });
    });

    it('constant with type and name', () => {
      let res = comments.parseComment('/** @constant {String} constname */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'constant'));
      assert(hasProperty(res.tags[0], 'name', 'constname'));
      assert(hasProperty(res.tags[0], 'type'));
      assert.deepEqual(res.tags[0].type, {
        type: 'NameExpression',
        name: 'String'
      });
    });

    it('const multiple', () => {
      let res = comments.parseComment('/**@const\n @const*/', {
        unwrap: true
      });
      assert.equal(res.tags.length, 2);
      assert(hasProperty(res.tags[0], 'title', 'const'));
      assert(hasProperty(res.tags[1], 'title', 'const'));
    });

    it('const double', () => {
      let res = comments.parseComment('/**@const\n @const*/', {
        unwrap: true
      });
      assert.equal(res.tags.length, 2);
      assert(hasProperty(res.tags[0], 'title', 'const'));
      assert(hasProperty(res.tags[1], 'title', 'const'));
    });

    it('const triple', () => {
      let res = comments.parseComment(
        ['/**', ' * @const @const', ' * @const @const', ' * @const @const', ' */'].join('\n'),
        {
          unwrap: true
        }
      );
      assert.equal(res.tags.length, 3);
      assert(hasProperty(res.tags[0], 'title', 'const'));
      assert(hasProperty(res.tags[1], 'title', 'const'));
      assert(hasProperty(res.tags[2], 'title', 'const'));
    });

    it('constructor', () => {
      let res = comments.parseComment('/** @constructor */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'constructor'));
    });

    it('constructor with type', () => {
      let res = comments.parseComment('/** @constructor {Object} */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'constructor'));
      assert.deepEqual(res.tags[0].type, {
        type: 'NameExpression',
        name: 'Object'
      });
    });

    it('constructor with type and name', () => {
      let res = comments.parseComment('/** @constructor {Object} objName */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'constructor'));
      assert(hasProperty(res.tags[0], 'name', 'objName'));
      assert.deepEqual(res.tags[0].type, {
        type: 'NameExpression',
        name: 'Object'
      });
    });

    it('class', () => {
      let res = comments.parseComment('/** @class */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'class'));
    });

    it('class with type', () => {
      let res = comments.parseComment('/** @class {Object} */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'class'));
      assert.deepEqual(res.tags[0].type, {
        type: 'NameExpression',
        name: 'Object'
      });
    });

    it('class with type and name', () => {
      let res = comments.parseComment('/** @class {Object} objName */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'class'));
      assert(hasProperty(res.tags[0], 'name', 'objName'));
      assert.deepEqual(res.tags[0].type, {
        type: 'NameExpression',
        name: 'Object'
      });
    });

    it('deprecated', () => {
      let res = comments.parseComment('/** @deprecated */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'deprecated'));
    });

    it('deprecated', () => {
      let res = comments.parseComment('/** @deprecated some text here describing why it is deprecated */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'deprecated'));
      assert(hasProperty(res.tags[0], 'description', 'some text here describing why it is deprecated'));
    });

    it('func', () => {
      let res = comments.parseComment('/** @func */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'func'));
    });

    it('func with name', () => {
      let res = comments.parseComment('/** @func thingName.func */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'func'));
      assert(hasProperty(res.tags[0], 'name', 'thingName.func'));
    });

    it('func with type', () => {
      let res = comments.parseComment('/** @func {Object} thingName.func */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 0);
      // func does not accept type
    });

    it('function', () => {
      let res = comments.parseComment('/** @function */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'function'));
    });

    it('function with name', () => {
      let res = comments.parseComment('/** @function thingName.function */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'function'));
      assert(hasProperty(res.tags[0], 'name', 'thingName.function'));
    });

    it('function with type', () => {
      let res = comments.parseComment('/** @function {Object} thingName.function */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 0);
      // function does not accept type
    });

    it('member', () => {
      let res = comments.parseComment('/** @member */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'member'));
    });

    it('member with name', () => {
      let res = comments.parseComment('/** @member thingName.name */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'member'));
      assert(hasProperty(res.tags[0], 'name', 'thingName.name'));
    });

    it('member with type', () => {
      let res = comments.parseComment('/** @member {Object} thingName.name */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'member'));
      assert(hasProperty(res.tags[0], 'name', 'thingName.name'));
      assert(hasProperty(res.tags[0], 'type'));
      assert.deepEqual(res.tags[0].type, {
        type: 'NameExpression',
        name: 'Object'
      });
    });

    it('method', () => {
      let res = comments.parseComment('/** @method */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'method'));
    });

    it('method with name', () => {
      let res = comments.parseComment('/** @method thingName.function */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'method'));
      assert(hasProperty(res.tags[0], 'name', 'thingName.function'));
    });

    it('method with type', () => {
      let res = comments.parseComment('/** @method {Object} thingName.function */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 0);
      // method does not accept type
    });

    it('mixes', () => {
      let res = comments.parseComment('/** @mixes */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 0);
    });

    it('mixes with name', () => {
      let res = comments.parseComment('/** @mixes thingName */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'mixes'));
      assert(hasProperty(res.tags[0], 'name', 'thingName'));
    });

    it('mixes with namepath', () => {
      let res = comments.parseComment('/** @mixes thingName.name */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'mixes'));
      assert(hasProperty(res.tags[0], 'name', 'thingName.name'));
    });

    it('mixin', () => {
      let res = comments.parseComment('/** @mixin */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'mixin'));
    });

    it('mixin with name', () => {
      let res = comments.parseComment('/** @mixin thingName */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'mixin'));
      assert(hasProperty(res.tags[0], 'name', 'thingName'));
    });

    it('mixin with namepath', () => {
      let res = comments.parseComment('/** @mixin thingName.name */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'mixin'));
      assert(hasProperty(res.tags[0], 'name', 'thingName.name'));
    });

    it('module', () => {
      let res = comments.parseComment('/** @module */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'module'));
    });

    it('module with name', () => {
      let res = comments.parseComment('/** @module thingName.name */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'module'));
      assert(hasProperty(res.tags[0], 'name', 'thingName.name'));
    });

    it('module with name that has a hyphen in it', () => {
      let res = comments.parseComment('/** @module thingName-name */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'module'));
      assert(hasProperty(res.tags[0], 'name', 'thingName-name'));
    });

    it('module with type', () => {
      let res = comments.parseComment('/** @module {Object} thingName.name */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'module'));
      assert(hasProperty(res.tags[0], 'name', 'thingName.name'));
      assert(hasProperty(res.tags[0], 'type'));
      assert.deepEqual(res.tags[0].type, {
        type: 'NameExpression',
        name: 'Object'
      });
    });

    it('module with path', () => {
      let res = comments.parseComment('/** @module path/to/thingName.name */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'module'));
      assert(hasProperty(res.tags[0], 'name', 'path/to/thingName.name'));
    });

    it('name', () => {
      let res = comments.parseComment('/** @name thingName.name */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'name'));
      assert(hasProperty(res.tags[0], 'name', 'thingName.name'));
    });

    it('name', () => {
      let res = comments.parseComment('/** @name thingName#name */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'name'));
      assert(hasProperty(res.tags[0], 'name', 'thingName#name'));
    });

    it('name', () => {
      let res = comments.parseComment('/** @name thingName~name */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'name'));
      assert(hasProperty(res.tags[0], 'name', 'thingName~name'));
    });

    it('name', () => {
      let res = comments.parseComment('/** @name {thing} thingName.name */', {
        unwrap: true
      });
      // name does not accept type
      assert.equal(res.tags.length, 0);
    });

    it('namespace', () => {
      let res = comments.parseComment('/** @namespace */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'namespace'));
    });

    it('namespace with name', () => {
      let res = comments.parseComment('/** @namespace thingName.name */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'namespace'));
      assert(hasProperty(res.tags[0], 'name', 'thingName.name'));
    });

    it('namespace with type', () => {
      let res = comments.parseComment('/** @namespace {Object} thingName.name */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'namespace'));
      assert(hasProperty(res.tags[0], 'name', 'thingName.name'));
      assert(hasProperty(res.tags[0], 'type'));
      assert.deepEqual(res.tags[0].type, {
        type: 'NameExpression',
        name: 'Object'
      });
    });

    it('param', () => {
      let res = comments.parseComment(['/**', ' * @param {String} userName', '*/'].join('\n'), {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'param'));
      assert(hasProperty(res.tags[0], 'name', 'userName'));
      assert(hasProperty(res.tags[0], 'type'));
      assert.deepEqual(res.tags[0].type, {
        type: 'NameExpression',
        name: 'String'
      });
    });

    it('param with properties', () => {
      let res = comments.parseComment(['/**', ' * @param {String} user.name', '*/'].join('\n'), {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'param'));
      assert(hasProperty(res.tags[0], 'name', 'user.name'));
      assert(hasProperty(res.tags[0], 'type'));
      assert.deepEqual(res.tags[0].type, {
        type: 'NameExpression',
        name: 'String'
      });
    });

    it('param with properties with description', () => {
      let res = comments.parseComment(['/**', ' * @param {String} user.name - hi', '*/'].join('\n'), {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'param'));
      assert(hasProperty(res.tags[0], 'name', 'user.name'));
      assert(hasProperty(res.tags[0], 'description', 'hi'));
      assert(hasProperty(res.tags[0], 'type'));
      assert.deepEqual(res.tags[0].type, {
        type: 'NameExpression',
        name: 'String'
      });
    });

    it('param with array properties with description', () => {
      let res = comments.parseComment(['/**', ' * @param {string} employee[].name - hi', ' */'].join('\n'), {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'param'));
      assert(hasProperty(res.tags[0], 'name', 'employee[].name'));
      assert(hasProperty(res.tags[0], 'description', 'hi'));
      assert(hasProperty(res.tags[0], 'type'));
      assert.deepEqual(res.tags[0].type, {
        type: 'NameExpression',
        name: 'string'
      });
    });

    it('param with array properties without description', () => {
      let res = comments.parseComment(['/**', ' * @param {string} employee[].name', ' */'].join('\n'), {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'param'));
      assert(hasProperty(res.tags[0], 'name', 'employee[].name'));
      assert(hasProperty(res.tags[0], 'description', null));
      assert(hasProperty(res.tags[0], 'type'));
      assert.deepEqual(res.tags[0].type, {
        type: 'NameExpression',
        name: 'string'
      });
    });

    it('arg with properties', () => {
      let res = comments.parseComment(['/**', ' * @arg {String} user.name', '*/'].join('\n'), {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'arg'));
      assert(hasProperty(res.tags[0], 'name', 'user.name'));
      assert(hasProperty(res.tags[0], 'type'));
      assert.deepEqual(res.tags[0].type, {
        type: 'NameExpression',
        name: 'String'
      });
    });

    it('argument with properties', () => {
      let res = comments.parseComment(['/**', ' * @argument {String} user.name', '*/'].join('\n'), {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'argument'));
      assert(hasProperty(res.tags[0], 'name', 'user.name'));
      assert(hasProperty(res.tags[0], 'type'));
      assert.deepEqual(res.tags[0].type, {
        type: 'NameExpression',
        name: 'String'
      });
    });

    it('param typeless', () => {
      let res = comments.parseComment(['/**', ' * @param something [bye] hi', '*/'].join('\n'), {
        unwrap: true,
        sloppy: true
      });

      assert.equal(res.tags.length, 1);
      assert.deepEqual(res.tags[0], {
        title: 'param',
        type: undefined,
        name: 'something',
        description: '[bye] hi'
      });

      res = comments.parseComment(['/**', ' * @param userName', '*/'].join('\n'), {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert.deepEqual(res.tags[0], {
        title: 'param',
        type: null,
        name: 'userName',
        description: null
      });

      res = comments.parseComment(['/**', ' * @param userName Something descriptive', '*/'].join('\n'), {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert.deepEqual(res.tags[0], {
        title: 'param',
        type: null,
        name: 'userName',
        description: 'Something descriptive'
      });

      res = comments.parseComment(['/**', ' * @param user.name Something descriptive', '*/'].join('\n'), {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert.deepEqual(res.tags[0], {
        title: 'param',
        type: null,
        name: 'user.name',
        description: 'Something descriptive'
      });
    });

    it('param broken', () => {
      let res = comments.parseComment(
        ['/**', ' * @param {String} userName', ' * @param {String userName', '*/'].join('\n'),
        {
          unwrap: true
        }
      );
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'param'));
      assert(hasProperty(res.tags[0], 'name', 'userName'));
      assert(hasProperty(res.tags[0], 'type'));
      assert.deepEqual(res.tags[0].type, {
        type: 'NameExpression',
        name: 'String'
      });
    });

    it('param record', () => {
      let res = comments.parseComment(['/**', ' * @param {{ok:String}} userName', '*/'].join('\n'), {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'param'));
      assert(hasProperty(res.tags[0], 'name', 'userName'));
      assert(hasProperty(res.tags[0], 'type'));
      assert.deepEqual(res.tags[0].type, {
        type: 'RecordType',
        fields: [
          {
            type: 'FieldType',
            key: 'ok',
            value: {
              type: 'NameExpression',
              name: 'String'
            }
          }
        ]
      });
    });

    it('param record broken', () => {
      let res = comments.parseComment(['/**', ' * @param {{ok:String} userName', '*/'].join('\n'), {
        unwrap: true
      });
      assert.equal(res.tags.length, 0);
    });

    it('param multiple lines', () => {
      let res = comments.parseComment(
        ['/**', ' * @param {string|', ' *     number} userName', ' * }}', '*/'].join('\n'),
        {
          unwrap: true
        }
      );
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'param'));
      assert(hasProperty(res.tags[0], 'name', 'userName'));
      assert(hasProperty(res.tags[0], 'type'));
      assert.deepEqual(res.tags[0].type, {
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

    it('param without braces', () => {
      let res = comments.parseComment(['/**', ' * @param string name description', '*/'].join('\n'), {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'param'));
      assert(hasProperty(res.tags[0], 'name', 'string'));
      assert(hasProperty(res.tags[0], 'type', null));
      assert(hasProperty(res.tags[0], 'description', 'name description'));
    });

    it('param w/ hyphen before description', () => {
      let res = comments.parseComment(['/**', ' * @param {string} name - description', '*/'].join('\n'), {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert.deepEqual(res.tags[0], {
        title: 'param',
        type: {
          type: 'NameExpression',
          name: 'string'
        },
        name: 'name',
        description: 'description'
      });
    });

    it('param w/ hyphen + leading space before description', () => {
      let res = comments.parseComment(['/**', ' * @param {string} name -   description', '*/'].join('\n'), {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert.deepEqual(res.tags[0], {
        title: 'param',
        type: {
          type: 'NameExpression',
          name: 'string'
        },
        name: 'name',
        description: '  description'
      });
    });

    it('description and param separated by blank line', () => {
      let res = comments.parseComment(
        ['/**', ' * Description', ' * blah blah blah', ' *', ' * @param {string} name description', '*/'].join('\n'),
        {
          unwrap: true
        }
      );

      assert.deepEqual(res.description, 'Description\nblah blah blah');
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'param'));
      assert(hasProperty(res.tags[0], 'name', 'name'));
      assert(hasProperty(res.tags[0], 'type'));
      assert.deepEqual(res.tags[0].type, {
        type: 'NameExpression',
        name: 'string'
      });
      assert(hasProperty(res.tags[0], 'description', 'description'));
    });

    it('regular block comment instead of jsdoc-style block comment', () => {
      let res = comments.parseComment(['/*', ' * Description', ' * blah blah blah', '*/'].join('\n'), {
        unwrap: true
      });

      assert.deepEqual(res.description, 'Description\nblah blah blah');
    });

    it('augments', () => {
      let res = comments.parseComment('/** @augments */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
    });

    it('augments with name', () => {
      let res = comments.parseComment('/** @augments ClassName */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'augments'));
      assert(hasProperty(res.tags[0], 'name', 'ClassName'));
    });

    it('augments with type', () => {
      let res = comments.parseComment('/** @augments {ClassName} */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'augments'));
      assert(hasProperty(res.tags[0], 'type', {
        type: 'NameExpression',
        name: 'ClassName'
      }));
    });

    it('augments with name', () => {
      let res = comments.parseComment('/** @augments ClassName.OK */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'augments'));
      assert(hasProperty(res.tags[0], 'name', 'ClassName.OK'));
    });

    it('extends', () => {
      let res = comments.parseComment('/** @extends */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
    });

    it('extends with name', () => {
      let res = comments.parseComment('/** @extends ClassName */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'extends'));
      assert(hasProperty(res.tags[0], 'name', 'ClassName'));
    });

    it('extends with type', () => {
      let res = comments.parseComment('/** @extends {ClassName} */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'extends'));
      assert(hasProperty(res.tags[0], 'type', {
        type: 'NameExpression',
        name: 'ClassName'
      }));
    });

    it('extends with namepath', () => {
      let res = comments.parseComment('/** @extends ClassName.OK */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'extends'));
      assert(hasProperty(res.tags[0], 'name', 'ClassName.OK'));
    });

    it('extends with namepath', () => {
      let res = comments.parseComment('/** @extends module:path/ClassName~OK */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'extends'));
      assert(hasProperty(res.tags[0], 'name', 'module:path/ClassName~OK'));
    });

    it('prop', () => {
      let res = comments.parseComment(['/**', ' * @prop {string} thingName - does some stuff', '*/'].join('\n'), {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'prop'));
      assert(hasProperty(res.tags[0], 'description', 'does some stuff'));
      assert(hasProperty(res.tags[0].type, 'name', 'string'));
      assert(hasProperty(res.tags[0], 'name', 'thingName'));
    });

    it('prop without type', () => {
      let res = comments.parseComment(['/**', ' * @prop thingName - does some stuff', '*/'].join('\n'), {
        unwrap: true
      });
      assert.equal(res.tags.length, 0);
    });

    it('property', () => {
      let res = comments.parseComment(['/**', ' * @property {string} thingName - does some stuff', '*/'].join('\n'), {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'property'));
      assert(hasProperty(res.tags[0], 'description', 'does some stuff'));
      assert(hasProperty(res.tags[0].type, 'name', 'string'));
      assert(hasProperty(res.tags[0], 'name', 'thingName'));
    });

    it('property without type', () => {
      let res = comments.parseComment(['/**', ' * @property thingName - does some stuff', '*/'].join('\n'), {
        unwrap: true
      });

      assert.equal(res.tags.length, 0);
    });

    it('property with optional type', () => {
      let res = comments.parseComment(
        ['/**', '* testtypedef', '* @typedef {object} abc', '* @property {String} [val] value description', '*/'].join(
          '\n'
        ),
        {
          unwrap: true,
          sloppy: true
        }
      );

      assert(hasProperty(res.tags[1], 'title', 'property'));
      assert(hasProperty(res.tags[1], 'type'));
      assert(hasProperty(res.tags[1]['type'], 'type', 'OptionalType'));
    });

    it('property with nested name', () => {
      let res = comments.parseComment(
        ['/**', ' * @property {string} thingName.name - does some stuff', '*/'].join('\n'),
        {
          unwrap: true
        }
      );
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'property'));
      assert(hasProperty(res.tags[0], 'description', 'does some stuff'));
      assert(hasProperty(res.tags[0].type, 'name', 'string'));
      assert(hasProperty(res.tags[0], 'name', 'thingName.name'));
    });

    it('throws', () => {
      let res = comments.parseComment(['/**', ' * @throws {Error} if something goes wrong', ' */'].join('\n'), {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'throws'));
      assert(hasProperty(res.tags[0], 'description', 'if something goes wrong'));
      assert(hasProperty(res.tags[0].type, 'name', 'Error'));
    });

    it('throws without type', () => {
      let res = comments.parseComment(['/**', ' * @throws if something goes wrong', ' */'].join('\n'), {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'throws'));
      assert(hasProperty(res.tags[0], 'description', 'if something goes wrong'));
    });

    it('kind', () => {
      let res = comments.parseComment('/** @kind class */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'kind'));
      assert(hasProperty(res.tags[0], 'kind', 'class'));
    });

    it('kind error', () => {
      let res = comments.parseComment('/** @kind ng */', {
        unwrap: true,
        recoverable: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'errors'));
      assert.equal(res.tags[0].errors.length, 1);
      assert.equal(res.tags[0].errors[0], "Invalid kind name 'ng'");
    });

    it('todo', () => {
      let res = comments.parseComment('/** @todo Write the documentation */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'todo'));
      assert(hasProperty(res.tags[0], 'description', 'Write the documentation'));
    });

    it('typedef', () => {
      let res = comments.parseComment('/** @typedef {Object} NumberLike */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'type'));
      assert.deepEqual(res.tags[0].type, {
        type: 'NameExpression',
        name: 'Object'
      });
      assert(hasProperty(res.tags[0], 'name', 'NumberLike'));
    });

    it('summary', () => {
      // japanese lang
      let res = comments.parseComment('/** @summary ゆるゆり3期おめでとー */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'summary'));
      assert(hasProperty(res.tags[0], 'description', 'ゆるゆり3期おめでとー'));
    });

    it('variation', () => {
      let res = comments.parseComment('/** @variation 42 */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'variation'));
      assert(hasProperty(res.tags[0], 'variation', 42));
    });

    it('variation error', () => {
      let res = comments.parseComment('/** @variation Animation */', {
        unwrap: true,
        recoverable: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'errors'));
      assert.equal(res.tags[0].errors.length, 1);
      assert.equal(res.tags[0].errors[0], "Invalid variation 'Animation'");
    });

    it('access', () => {
      let res = comments.parseComment('/** @access public */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'access'));
      assert(hasProperty(res.tags[0], 'access', 'public'));
    });

    it('access error', () => {
      let res = comments.parseComment('/** @access ng */', {
        unwrap: true,
        recoverable: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'errors'));
      assert.equal(res.tags[0].errors.length, 1);
      assert.equal(res.tags[0].errors[0], "Invalid access name 'ng'");
    });

    it('public', () => {
      let res = comments.parseComment('/** @public */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'public'));
    });

    it('public type and description', () => {
      let res = comments.parseComment('/** @public {number} ok */', {
        unwrap: true,
        recoverable: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'public'));
      assert(hasProperty(res.tags[0], 'description', 'ok'));
      assert(hasProperty(res.tags[0], 'type'));
      assert.deepEqual(res.tags[0].type, {
        type: 'NameExpression',
        name: 'number'
      });
    });

    it('protected', () => {
      let res = comments.parseComment('/** @protected */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'protected'));
    });

    it('protected type and description', () => {
      let res = comments.parseComment('/** @protected {number} ok */', {
        unwrap: true,
        recoverable: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'protected'));
      assert(hasProperty(res.tags[0], 'description', 'ok'));
      assert(hasProperty(res.tags[0], 'type'));
      assert.deepEqual(res.tags[0].type, {
        type: 'NameExpression',
        name: 'number'
      });
    });

    it('private', () => {
      let res = comments.parseComment('/** @private */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'private'));
    });

    it('private type and description', () => {
      let res = comments.parseComment('/** @private {number} ok */', {
        unwrap: true,
        recoverable: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'private'));
      assert(hasProperty(res.tags[0], 'description', 'ok'));
      assert(hasProperty(res.tags[0], 'type'));
      assert.deepEqual(res.tags[0].type, {
        type: 'NameExpression',
        name: 'number'
      });
    });

    it('readonly', () => {
      let res = comments.parseComment('/** @readonly */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'readonly'));
    });

    it('readonly error', () => {
      let res = comments.parseComment('/** @readonly ng */', {
        unwrap: true,
        recoverable: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'errors'));
      assert.equal(res.tags[0].errors.length, 1);
      assert.equal(res.tags[0].errors[0], "Unknown content 'ng'");
    });

    it('requires', () => {
      let res = comments.parseComment('/** @requires */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 0);
    });

    it('requires with module name', () => {
      let res = comments.parseComment('/** @requires name.path */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'requires'));
      assert(hasProperty(res.tags[0], 'name', 'name.path'));
    });

    it('global', () => {
      let res = comments.parseComment('/** @global */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'global'));
    });

    it('global error', () => {
      let res = comments.parseComment('/** @global ng */', {
        unwrap: true,
        recoverable: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'errors'));
      assert.equal(res.tags[0].errors.length, 1);
      assert.equal(res.tags[0].errors[0], "Unknown content 'ng'");
    });

    it('inner', () => {
      let res = comments.parseComment('/** @inner */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'inner'));
    });

    it('inner error', () => {
      let res = comments.parseComment('/** @inner ng */', {
        unwrap: true,
        recoverable: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'errors'));
      assert.equal(res.tags[0].errors.length, 1);
      assert.equal(res.tags[0].errors[0], "Unknown content 'ng'");
    });

    it('instance', () => {
      let res = comments.parseComment('/** @instance */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'instance'));
    });

    it('instance error', () => {
      let res = comments.parseComment('/** @instance ng */', {
        unwrap: true,
        recoverable: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'errors'));
      assert.equal(res.tags[0].errors.length, 1);
      assert.equal(res.tags[0].errors[0], "Unknown content 'ng'");
    });

    it('since', () => {
      let res = comments.parseComment('/** @since 1.2.1 */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'since'));
      assert(hasProperty(res.tags[0], 'description', '1.2.1'));
    });

    it('static', () => {
      let res = comments.parseComment('/** @static */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'static'));
    });

    it('static error', () => {
      let res = comments.parseComment('/** @static ng */', {
        unwrap: true,
        recoverable: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'errors'));
      assert.equal(res.tags[0].errors.length, 1);
      assert.equal(res.tags[0].errors[0], "Unknown content 'ng'");
    });

    it('this', () => {
      let res = comments.parseComment(['/**', ' * @this thingName', '*/'].join('\n'), {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'this'));
      assert(hasProperty(res.tags[0], 'name', 'thingName'));
    });

    it('this with namepath', () => {
      let res = comments.parseComment(['/**', ' * @this thingName.name', '*/'].join('\n'), {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'this'));
      assert(hasProperty(res.tags[0], 'name', 'thingName.name'));
    });

    it('this with name expression', () => {
      let res = comments.parseComment(['/**', ' * @this {thingName.name}', '*/'].join('\n'), {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'this'));
      assert(hasProperty(res.tags[0], 'name', 'thingName.name'));
    });

    it('this error with type application', () => {
      let res = comments.parseComment(['/**', ' * @this {Array<string>}', '*/'].join('\n'), {
        unwrap: true,
        recoverable: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'this'));
      assert(hasProperty(res.tags[0], 'errors'));
      assert.equal(res.tags[0].errors.length, 1);
      assert.equal(res.tags[0].errors[0], 'Invalid name for this');
    });

    it('this error', () => {
      let res = comments.parseComment(['/**', ' * @this', '*/'].join('\n'), {
        unwrap: true,
        recoverable: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'this'));
      assert(hasProperty(res.tags[0], 'errors'));
      assert.equal(res.tags[0].errors.length, 1);
      assert.equal(res.tags[0].errors[0], 'Missing or invalid tag name');
    });

    it('var', () => {
      let res = comments.parseComment('/** @var */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'var'));
    });

    it('var with name', () => {
      let res = comments.parseComment('/** @var thingName.name */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'var'));
      assert(hasProperty(res.tags[0], 'name', 'thingName.name'));
    });

    it('var with type', () => {
      let res = comments.parseComment('/** @var {Object} thingName.name */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'var'));
      assert(hasProperty(res.tags[0], 'name', 'thingName.name'));
      assert(hasProperty(res.tags[0], 'type'));
      assert.deepEqual(res.tags[0].type, {
        type: 'NameExpression',
        name: 'Object'
      });
    });

    it('version', () => {
      let res = comments.parseComment('/** @version 1.2.1 */', {
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'version'));
      assert(hasProperty(res.tags[0], 'description', '1.2.1'));
    });

    it('incorrect name', () => {
      let res = comments.parseComment('/** @name thingName#%name */', {
        unwrap: true
      });

      // name does not accept type
      assert.equal(res.tags.length, 0);
      assert.deepEqual(res, {
        description: '',
        tags: []
      });
    });

    it('string literal property', () => {
      let res = comments.parseComment(
        ['/**', ' * @typedef {Object} comment', " * @property {('public'|'protected'|'private')} access", '*/'].join(
          '\n'
        ),
        {
          unwrap: true
        }
      );

      assert.equal(res.tags.length, 2);
      assert(hasProperty(res.tags[1], 'title', 'property'));
      assert(hasProperty(res.tags[1], 'name', 'access'));
      assert(hasProperty(res.tags[1].type, 'type', 'UnionType'));
      assert.equal(res.tags[1].type.elements.length, 3);
      containEqual(res.tags[1].type.elements, {
        type: 'StringLiteralType',
        value: 'public'
      });
      containEqual(res.tags[1].type.elements, {
        type: 'StringLiteralType',
        value: 'private'
      });
      containEqual(res.tags[1].type.elements, {
        type: 'StringLiteralType',
        value: 'protected'
      });
    });

    it('numeric literal property', () => {
      let res = comments.parseComment(
        ['/**', ' * @typedef {Object} comment', ' * @property {(-42|1.5|0)} access', '*/'].join('\n'),
        {
          unwrap: true
        }
      );

      assert.equal(res.tags.length, 2);
      assert(hasProperty(res.tags[1], 'title', 'property'));
      assert(hasProperty(res.tags[1], 'name', 'access'));
      assert(hasProperty(res.tags[1].type, 'type', 'UnionType'));
      assert.equal(res.tags[1].type.elements.length, 3);
      containEqual(res.tags[1].type.elements, {
        type: 'NumericLiteralType',
        value: -42
      });
      containEqual(res.tags[1].type.elements, {
        type: 'NumericLiteralType',
        value: 1.5
      });
      containEqual(res.tags[1].type.elements, {
        type: 'NumericLiteralType',
        value: 0
      });
    });

    it('boolean literal property', () => {
      let res = comments.parseComment(
        ['/**', ' * @typedef {Object} comment', ' * @property {(true|false)} access', '*/'].join('\n'),
        {
          unwrap: true
        }
      );

      assert.equal(res.tags.length, 2);
      assert(hasProperty(res.tags[1], 'title', 'property'));
      assert(hasProperty(res.tags[1], 'name', 'access'));
      assert(hasProperty(res.tags[1].type, 'type', 'UnionType'));
      assert.equal(res.tags[1].type.elements.length, 2);
      containEqual(res.tags[1].type.elements, {
        type: 'BooleanLiteralType',
        value: true
      });
      containEqual(res.tags[1].type.elements, {
        type: 'BooleanLiteralType',
        value: false
      });
    });

    it('complex union with literal types', () => {
      let res = comments.parseComment(
        ['/**', ' * @typedef {({ok: true, data: string} | {ok: false, error: Error})} Result', '*/'].join('\n'),
        {
          unwrap: true
        }
      );

      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'typedef'));
      assert(hasProperty(res.tags[0], 'name', 'Result'));
      assert(hasProperty(res.tags[0].type, 'type', 'UnionType'));
      assert.equal(res.tags[0].type.elements.length, 2);

      var e0 = res.tags[0].type.elements[0];
      assert(hasProperty(e0, 'type', 'RecordType'));
      assert.equal(e0.fields.length, 2);
      containEqual(e0.fields, {
        type: 'FieldType',
        key: 'ok',
        value: {
          type: 'BooleanLiteralType',
          value: true
        }
      });
      containEqual(e0.fields, {
        type: 'FieldType',
        key: 'data',
        value: {
          type: 'NameExpression',
          name: 'string'
        }
      });

      var e1 = res.tags[0].type.elements[1];
      assert(hasProperty(e1, 'type', 'RecordType'));
      assert.equal(e1.fields.length, 2);
      containEqual(e1.fields, {
        type: 'FieldType',
        key: 'ok',
        value: {
          type: 'BooleanLiteralType',
          value: false
        }
      });
      containEqual(e1.fields, {
        type: 'FieldType',
        key: 'error',
        value: {
          type: 'NameExpression',
          name: 'Error'
        }
      });
    });
  });

  describe('parseType', () => {
    it('union type closure-compiler extended', () => {
      var type = comments.parseType('string|number');
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
      var type = comments.parseType('()');
      assert.deepEqual(type, {
        type: 'UnionType',
        elements: []
      });
    });

    it('comma last array type', () => {
      var type = comments.parseType('[string,]');
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
      var type = comments.parseType('[*]');
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
      var type = comments.parseType('[?]');
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
      var type = comments.parseType('{,}');
      assert.deepEqual(type, {
        type: 'RecordType',
        fields: []
      });
    });

    it('type application', () => {
      var type = comments.parseType('Array.<String>');
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
      var type = comments.parseType('Array<?>');
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
      var type = comments.parseType('Array.<String, Number>');
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
      var type = comments.parseType('Array<String>');
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
      var type = comments.parseType('String[]');
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
      var type = comments.parseType('function()');
      assert.deepEqual(type, {
        type: 'FunctionType',
        params: [],
        result: null
      });
    });

    it('function type with name', () => {
      var type = comments.parseType('function(a)');
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
      var type = comments.parseType('function(a:b)');
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
      var type = comments.parseType('function(a=)');
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
      var type = comments.parseType('function(a:b=)');
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
      var type = comments.parseType('function(...a)');
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
      var type = comments.parseType('function(...a:b)');
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
      var type = comments.parseType('function(...a=)');
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
      var type = comments.parseType('function(...a:b=)');
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

      type = comments.parseType("{'ok':String}");
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

      type = comments.parseType('{"\\r\\n\\t\\u2028\\x20\\u20\\b\\f\\v\\\r\n\\\n\\0\\07\\012\\o":String}');
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

      assert.throws(() => comments.parseType('{\'ok":String}'), /unexpected quote/);
      assert.throws(() => comments.parseType("{'o\n':String}"), /unexpected quote/);
    });

    it('number value in type', () => {
      var type;

      type = comments.parseType('{20:String}');
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

      type = comments.parseType('{.2:String, 30:Number, 0x20:String}');
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

      type = comments.parseType('{0X2:String, 0:Number, 100e200:String, 10e-20:Number}');
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

      assert.throws(() => comments.parseType('{0x:String}'), /unexpected token/);
      assert.throws(() => comments.parseType('{0x'), /unexpected token/);
      assert.throws(() => comments.parseType('{0xd'), /unexpected token/);
      assert.throws(() => comments.parseType('{0x2_:'), /unexpected token/);
      assert.throws(() => comments.parseType('{021:'), /unexpected token/);
      assert.throws(() => comments.parseType('{021_:'), /unexpected token/);
      assert.throws(() => comments.parseType('{021'), /unexpected token/);
      assert.throws(() => comments.parseType('{08'), /unexpected token/);
      assert.throws(() => comments.parseType('{0y'), /unexpected token/);
      assert.throws(() => comments.parseType('{0'), /unexpected token/);
      assert.throws(() => comments.parseType('{100e2'), /unexpected token/);
      assert.throws(() => comments.parseType('{100e-2'), /unexpected token/);
      assert.throws(() => comments.parseType('{100e-200:'), /unexpected token/);
      assert.throws(() => comments.parseType('{100e:'), /unexpected token/);
      assert.throws(() => comments.parseType('function(number=, string)'), /not reach to EOF/);
    });

    it('dotted type', () => {
      var type;
      type = comments.parseType('Cocoa.Cappuccino');
      assert.deepEqual(type, {
        name: 'Cocoa.Cappuccino',
        type: 'NameExpression'
      });
    });

    it('rest array type', () => {
      var type;
      type = comments.parseType('[string,...string]');
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
      var type;
      type = comments.parseType('string?');
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
      var type;
      type = comments.parseType('string!');
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
      var type;
      type = comments.parseType('string|number|Test');
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
      var type;
      type = comments.parseType('"Hello, World"');
      assert.deepEqual(type, {
        type: 'StringLiteralType',
        value: 'Hello, World'
      });
    });

    it('numeric literal type', () => {
      var type;
      type = comments.parseType('32');
      assert.deepEqual(type, {
        type: 'NumericLiteralType',
        value: 32
      });
      type = comments.parseType('-142.42');
      assert.deepEqual(type, {
        type: 'NumericLiteralType',
        value: -142.42
      });
    });

    it('boolean literal type', () => {
      var type;
      type = comments.parseType('true');
      assert.deepEqual(type, {
        type: 'BooleanLiteralType',
        value: true
      });
      type = comments.parseType('false');
      assert.deepEqual(type, {
        type: 'BooleanLiteralType',
        value: false
      });
    });

    it('illegal tokens', () => {
      assert.throws(() => comments.parseType('.'), /unexpected token/);
      assert.throws(() => comments.parseType('.d'), /unexpected token/);
      assert.throws(() => comments.parseType('('), /unexpected token/);
      assert.throws(() => comments.parseType('Test.'), /unexpected token/);
    });
  });

  describe('parseParamType', () => {
    it('question', () => {
      var type = comments.parseParamType('?');
      assert.deepEqual(type, {
        type: 'NullableLiteral'
      });
    });

    it('question option', () => {
      var type = comments.parseParamType('?=');
      assert.deepEqual(type, {
        type: 'OptionalType',
        expression: {
          type: 'NullableLiteral'
        }
      });
    });

    it('function option parameters former', () => {
      var type = comments.parseParamType('function(?, number)');
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
      var type = comments.parseParamType('function(number, ?)');
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
      var type = comments.parseParamType('function(): ?|number');
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

  describe('invalid', () => {
    it('empty union pipe', () => {
      assert.throws(() => {
        comments.parseType('(|)').should.throw();
      });
      assert.throws(() => {
        comments.parseType('(string|)').should.throw();
      });
      assert.throws(() => {
        comments.parseType('(string||)').should.throw();
      });
    });

    it('comma only array type', () => {
      assert.throws(() => {
        comments.parseType('[,]').should.throw();
      });
    });

    it('comma only record type', () => {
      assert.throws(() => {
        comments.parseType('{,,}').should.throw();
      });
    });

    it('incorrect bracket', () => {
      assert.throws(() => {
        comments.parseParamType('int[').should.throw();
      });
    });
  });

  describe('tags option', () => {
    it('only param', () => {
      let res = comments.parseComment(['/**', ' * @const @const', ' * @param {String} y', ' */'].join('\n'), {
        tags: ['param'],
        unwrap: true
      });
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'param'));
      assert(hasProperty(res.tags[0], 'name', 'y'));
    });

    it('param and type', () => {
      let res = comments.parseComment(
        ['/**', ' * @const x', ' * @param {String} y', ' * @type {String} ', ' */'].join('\n'),
        {
          tags: ['param', 'type'],
          unwrap: true
        }
      );
      assert.equal(res.tags.length, 2);
      assert(hasProperty(res.tags[0], 'title', 'param'));
      assert(hasProperty(res.tags[0], 'name', 'y'));
      assert(hasProperty(res.tags[1], 'title', 'type'));
      assert(hasProperty(res.tags[1], 'type'));
      assert(hasProperty(res.tags[1].type, 'name', 'String'));
    });
  });

  describe('invalid tags', () => {
    it('bad tag 1', () => {
      assert.throws(() => {
        comments.parse(['/**', ' * @param {String} hucairz', ' */'].join('\n'), {
          tags: 1,
          unwrap: true
        });
      });
    });

    it('bad tag 2', () => {
      assert.throws(() => {
        comments.parse(['/**', ' * @param {String} hucairz', ' */'].join('\n'), {
          tags: ['a', 1],
          unwrap: true
        });
      });
    });
  });

  describe('optional params', () => {
    // should fail since sloppy option not set
    it('failure 0', () => {
      assert.deepEqual(comments.parseComment(['/**', ' * @param {String} [val]', ' */'].join('\n'), {
        unwrap: true
      }), {
        description: '',
        tags: []
      });
    });

    it('failure 1', () => {
      assert.deepEqual(comments
        .parseComment(['/**', ' * @param [val', ' */'].join('\n'), {
          unwrap: true,
          sloppy: true
        })
        , {
          description: '',
          tags: []
        });
    });

    it('success 1', () => {
      assert.deepEqual(comments
        .parseComment(['/**', ' * @param {String} [val]', ' */'].join('\n'), {
          unwrap: true,
          sloppy: true
        })
        , {
          description: '',
          tags: [
            {
              title: 'param',
              description: null,
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
      assert.deepEqual(comments
        .parseComment(['/**', ' * @param {String=} val', ' */'].join('\n'), {
          unwrap: true,
          sloppy: true
        })
        , {
          description: '',
          tags: [
            {
              title: 'param',
              description: null,
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
      assert.deepEqual(comments
        .parseComment(['/**', ' * @param {String=} [val=abc] some description', ' */'].join('\n'), {
          unwrap: true,
          sloppy: true
        })
        , {
          description: '',
          tags: [
            {
              title: 'param',
              description: 'some description',
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
      assert.deepEqual(comments
        .parseComment(['/**', ' * @param {String=} [val = abc] some description', ' */'].join('\n'), {
          unwrap: true,
          sloppy: true
        })
        , {
          description: '',
          tags: [
            {
              title: 'param',
              description: 'some description',
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
      assert.deepEqual(comments
        .parseComment(['/**', ' * @param {String} [val="foo"] some description', ' */'].join('\n'), {
          unwrap: true,
          sloppy: true
        })
        , {
          description: '',
          tags: [
            {
              title: 'param',
              description: 'some description',
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
      assert.deepEqual(comments
        .parseComment(['/**', " * @param {String} [val=   'foo'  ] some description", ' */'].join('\n'), {
          unwrap: true,
          sloppy: true
        })
        , {
          description: '',
          tags: [
            {
              title: 'param',
              description: 'some description',
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
      assert.deepEqual(comments
        .parseComment(['/**', ' * @param {String} [val=   "   foo"  ] some description', ' */'].join('\n'), {
          unwrap: true,
          sloppy: true
        })
        , {
          description: '',
          tags: [
            {
              title: 'param',
              description: 'some description',
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
      assert.deepEqual(comments
        .parseComment(['/**', " * @param {String} [val=['foo']] some description", ' */'].join('\n'), {
          unwrap: true,
          sloppy: true
        })
        , {
          description: '',
          tags: [
            {
              title: 'param',
              description: 'some description',
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
      assert.deepEqual(comments
        .parseComment(['/**', " * @param {String} [val=['foo']] some description", ' */'].join('\n'), {
          unwrap: true,
          sloppy: true
        })
        , {
          description: '',
          tags: [
            {
              title: 'param',
              description: 'some description',
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
      assert.deepEqual(comments
        .parseComment(['/**', " * @param {String} [val = [ 'foo' ]] some description", ' */'].join('\n'), {
          unwrap: true,
          sloppy: true
        })
        , {
          description: '',
          tags: [
            {
              title: 'param',
              description: 'some description',
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

    it('line numbers', () => {
      let res = comments.parseComment(
        [
          '/**',
          ' * @constructor',
          ' * @param {string} foo',
          ' * @returns {string}',
          ' *',
          ' * @example',
          " * f('blah'); // => undefined",
          ' */'
        ].join('\n'),
        {
          unwrap: true,
          lineNumbers: true
        }
      );

      assert(hasProperty(res.tags[0], 'lineNumber', 1));
      assert(hasProperty(res.tags[1], 'lineNumber', 2));
      assert(hasProperty(res.tags[2], 'lineNumber', 3));
      assert(hasProperty(res.tags[3], 'lineNumber', 5));
    });

    it('example caption', () => {
      let res = comments.parseComment(
        ['/**', ' * @example <caption>hi</caption>', " * f('blah'); // => undefined", ' */'].join('\n'),
        {
          unwrap: true,
          lineNumbers: true
        }
      );

      assert.deepEqual(res.tags[0].description, "f('blah'); // => undefined");
      assert.deepEqual(res.tags[0].caption, 'hi');
    });

    it('should handle \\r\\n line endings correctly', () => {
      let res = comments.parseComment(
        [
          '/**',
          ' * @param {string} foo',
          ' * @returns {string}',
          ' *',
          ' * @example',
          " * f('blah'); // => undefined",
          ' */'
        ].join('\r\n'),
        {
          unwrap: true,
          lineNumbers: true
        }
      );

      assert(hasProperty(res.tags[0], 'lineNumber', 1));
      assert(hasProperty(res.tags[1], 'lineNumber', 2));
      assert(hasProperty(res.tags[2], 'lineNumber', 4));
    });
  });

  describe('optional properties', () => {
    // should fail since sloppy option not set
    it('failure 0', () => {
      assert.deepEqual(comments
        .parseComment(['/**', ' * @property {String} [val] some description', ' */'].join('\n'), {
          unwrap: true
        })
        , {
          description: '',
          tags: []
        });
    });

    it('failure 1', () => {
      assert.deepEqual(comments
        .parseComment(['/**', ' * @property [val', ' */'].join('\n'), {
          unwrap: true,
          sloppy: true
        })
        , {
          description: '',
          tags: []
        });
    });

    it('success 1', () => {
      assert.deepEqual(comments
        .parseComment(['/**', ' * @property {String} [val]', ' */'].join('\n'), {
          unwrap: true,
          sloppy: true
        })
        , {
          description: '',
          tags: [
            {
              title: 'property',
              description: null,
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
      assert.deepEqual(comments
        .parseComment(['/**', ' * @property {String=} val', ' */'].join('\n'), {
          unwrap: true,
          sloppy: true
        })
        , {
          description: '',
          tags: [
            {
              title: 'property',
              description: null,
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
      assert.deepEqual(comments
        .parseComment(['/**', ' * @property {String=} [val=abc] some description', ' */'].join('\n'), {
          unwrap: true,
          sloppy: true
        })
        , {
          description: '',
          tags: [
            {
              title: 'property',
              description: 'some description',
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
      assert.deepEqual(comments
        .parseComment(['/**', ' * @property {String=} [val = abc] some description', ' */'].join('\n'), {
          unwrap: true,
          sloppy: true
        })
        , {
          description: '',
          tags: [
            {
              title: 'property',
              description: 'some description',
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
      assert.deepEqual(comments
        .parseComment(['/**', ' * @property {String} [val="foo"] some description', ' */'].join('\n'), {
          unwrap: true,
          sloppy: true
        })
        , {
          description: '',
          tags: [
            {
              title: 'property',
              description: 'some description',
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
       assert.deepEqual(comments
        .parseComment(['/**', " * @property {String} [val=   'foo'  ] some description", ' */'].join('\n'), {
          unwrap: true,
          sloppy: true
        })
       , {
          description: '',
          tags: [
            {
              title: 'property',
              description: 'some description',
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
      assert.deepEqual(comments
        .parseComment(['/**', ' * @property {String} [val=   "   foo"  ] some description', ' */'].join('\n'), {
          unwrap: true,
          sloppy: true
        })
        , {
          description: '',
          tags: [
            {
              title: 'property',
              description: 'some description',
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
      assert.deepEqual(comments
        .parseComment(['/**', " * @property {String} [val=['foo']] some description", ' */'].join('\n'), {
          unwrap: true,
          sloppy: true
        })
        , {
          description: '',
          tags: [
            {
              title: 'property',
              description: 'some description',
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
      assert.deepEqual(comments
        .parseComment(['/**', " * @property {String} [val = [ 'foo' ]] some description", ' */'].join('\n'), {
          unwrap: true,
          sloppy: true
        })
        , {
          description: '',
          tags: [
            {
              title: 'property',
              description: 'some description',
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
  });

  describe('recovery tests', () => {
    it('params 2', () => {
      let res = comments.parseComment(['@param f', '@param {string} f2'].join('\n'), {
        recoverable: true
      });

      // ensure both parameters are OK
      assert.equal(res.tags.length, 2);
      assert(hasProperty(res.tags[0], 'title', 'param'));
      assert(hasProperty(res.tags[0], 'type', null));
      assert(hasProperty(res.tags[0], 'name', 'f'));

      assert(hasProperty(res.tags[1], 'title', 'param'));
      assert(hasProperty(res.tags[1], 'type'));
      assert(hasProperty(res.tags[1].type, 'name', 'string'));
      assert(hasProperty(res.tags[1].type, 'type', 'NameExpression'));
      assert(hasProperty(res.tags[1], 'name', 'f2'));
    });

    it('params 2', () => {
      let res = comments.parseComment(['@param string f', '@param {string} f2'].join('\n'), {
        recoverable: true
      });

      // ensure first parameter is OK even with invalid type name
      assert.equal(res.tags.length, 2);
      assert(hasProperty(res.tags[0], 'title', 'param'));
      assert(hasProperty(res.tags[0], 'type', null));
      assert(hasProperty(res.tags[0], 'name', 'string'));
      assert(hasProperty(res.tags[0], 'description', 'f'));

      assert(hasProperty(res.tags[1], 'title', 'param'));
      assert(hasProperty(res.tags[1], 'type'));
      assert(hasProperty(res.tags[1].type, 'name', 'string'));
      assert(hasProperty(res.tags[1].type, 'type', 'NameExpression'));
      assert(hasProperty(res.tags[1], 'name', 'f2'));
    });

    it('return 1', () => {
      let res = comments.parseComment(['@returns'].join('\n'), {
        recoverable: true
      });

      // return tag should exist
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'returns'));
      assert(hasProperty(res.tags[0], 'type', null));
    });
    it('return 2', () => {
      let res = comments.parseComment(['@returns', '@param {string} f2'].join('\n'), {
        recoverable: true
      });

      // return tag should exist as well as next tag
      assert.equal(res.tags.length, 2);
      assert(hasProperty(res.tags[0], 'title', 'returns'));
      assert(hasProperty(res.tags[0], 'type', null));

      assert(hasProperty(res.tags[1], 'title', 'param'));
      assert(hasProperty(res.tags[1], 'type'));
      assert(hasProperty(res.tags[1].type, 'name', 'string'));
      assert(hasProperty(res.tags[1].type, 'type', 'NameExpression'));
      assert(hasProperty(res.tags[1], 'name', 'f2'));
    });

    it('return no type', () => {
      let res = comments.parseComment(['@return a value'].join('\n'));

      // return tag should exist
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'return'));
      assert(hasProperty(res.tags[0], 'type', null));
      assert(hasProperty(res.tags[0], 'description', 'a value'));
    });

    it('extra @ 1', () => {
      let res = comments.parseComment(['@', '@returns', '@param {string} f2'].join('\n'), {
        recoverable: true
      });

      // empty tag name shouldn't affect subsequent tags
      assert.equal(res.tags.length, 3);
      assert(hasProperty(res.tags[0], 'title', ''));
      assert(!res.tags[0].hasOwnProperty('type'));

      assert(hasProperty(res.tags[1], 'title', 'returns'));
      assert(hasProperty(res.tags[1], 'type', null));

      assert(hasProperty(res.tags[2], 'title', 'param'));
      assert(hasProperty(res.tags[2], 'type'));
      assert(hasProperty(res.tags[2].type, 'name', 'string'));
      assert(hasProperty(res.tags[2].type, 'type', 'NameExpression'));
      assert(hasProperty(res.tags[2], 'name', 'f2'));
    });

    it('extra @ 2', () => {
      let res = comments.parseComment(['@ invalid name', '@param {string} f2'].join('\n'), {
        recoverable: true
      });

      // empty tag name shouldn't affect subsequent tags
      assert.equal(res.tags.length, 2);
      assert(hasProperty(res.tags[0], 'title', ''));
      assert(!res.tags[0].hasOwnProperty('type'));
      assert(!res.tags[0].hasOwnProperty('name'));
      assert(hasProperty(res.tags[0], 'description', 'invalid name'));

      assert(hasProperty(res.tags[1], 'title', 'param'));
      assert(hasProperty(res.tags[1], 'type'));
      assert(hasProperty(res.tags[1].type, 'name', 'string'));
      assert(hasProperty(res.tags[1].type, 'type', 'NameExpression'));
      assert(hasProperty(res.tags[1], 'name', 'f2'));
    });

    it('invalid tag 1', () => {
      let res = comments.parseComment(['@111 invalid name', '@param {string} f2'].join('\n'), {
        recoverable: true
      });

      // invalid tag name shouldn't affect subsequent tags
      assert.equal(res.tags.length, 2);
      assert(hasProperty(res.tags[0], 'title', '111'));
      assert(!res.tags[0].hasOwnProperty('type'));
      assert(!res.tags[0].hasOwnProperty('name'));
      assert(hasProperty(res.tags[0], 'description', 'invalid name'));

      assert(hasProperty(res.tags[1], 'title', 'param'));
      assert(hasProperty(res.tags[1], 'type'));
      assert(hasProperty(res.tags[1].type, 'name', 'string'));
      assert(hasProperty(res.tags[1].type, 'type', 'NameExpression'));
      assert(hasProperty(res.tags[1], 'name', 'f2'));
    });

    it('invalid tag 1', () => {
      let res = comments.parseComment(['@111', '@param {string} f2'].join('\n'), {
        recoverable: true
      });

      // invalid tag name shouldn't affect subsequent tags
      assert.equal(res.tags.length, 2);
      assert(hasProperty(res.tags[0], 'title', '111'));
      assert(!res.tags[0].hasOwnProperty('type'));
      assert(!res.tags[0].hasOwnProperty('name'));
      assert(hasProperty(res.tags[0], 'description', null));

      assert(hasProperty(res.tags[1], 'title', 'param'));
      assert(hasProperty(res.tags[1], 'type'));
      assert(hasProperty(res.tags[1].type, 'name', 'string'));
      assert(hasProperty(res.tags[1].type, 'type', 'NameExpression'));
      assert(hasProperty(res.tags[1], 'name', 'f2'));
    });

    it('should not crash on bad type in @param without name', () => {
      let res = comments.parseComment('@param {Function(DOMNode)}', {
        recoverable: true
      });
      assert.equal(res.tags.length, 1);
      assert.deepEqual(res.tags[0], {
        description: null,
        errors: ['not reach to EOF', 'Missing or invalid tag name'],
        name: null,
        title: 'param',
        type: null
      });
    });

    it('should not crash on bad type in @param in sloppy mode', () => {
      let res = comments.parseComment('@param {int[} [x]', {
        sloppy: true,
        recoverable: true
      });
      assert.equal(res.tags.length, 1);
      assert.deepEqual(res.tags[0], {
        description: null,
        errors: ['expected an array-style type declaration (int[])'],
        name: 'x',
        title: 'param',
        type: null
      });
    });
  });

  describe('@ mark contained descriptions', () => {
    it('comment description #10', () => {
      let res = comments.parseComment(
        [
          '/**',
          ' * Prevents the default action. It is equivalent to',
          ' * {@code e.preventDefault()}, but can be used as the callback argument of',
          ' * {@link goog.events.listen} without declaring another function.',
          ' * @param {!goog.events.Event} e An event.',
          ' */'
        ].join('\n'),
        {
          unwrap: true,
          sloppy: true
        }
      );

      assert.equal(
        res.description,
        'Prevents the default action. It is equivalent to\n{@code e.preventDefault()}, but can be used as the callback argument of\n{@link goog.events.listen} without declaring another function.'
      );

      assert.deepEqual(res.tags, [
        {
          title: 'param',
          description: 'An event.',
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

    it('tag description', () => {
      assert.deepEqual(comments.parseComment(
          [
            '/**',
            ' * Prevents the default action. It is equivalent to',
            ' * @param {!goog.events.Event} e An event.',
            ' * {@code e.preventDefault()}, but can be used as the callback argument of',
            ' * {@link goog.events.listen} without declaring another function.',
            ' */'
          ].join('\n'),
          {
            unwrap: true,
            sloppy: true
          })
        , {
          description: 'Prevents the default action. It is equivalent to',
          inlineTags: [],
          tags: [
            {
              title: 'param',
              description:
                'An event.\n{@code e.preventDefault()}, but can be used as the callback argument of\n{@link goog.events.listen} without declaring another function.',
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
          ]
        });
    });
  });

  describe('function', () => {
    it('recognize "function" type', () => {
      let res = comments.parseComment('@param {function} foo description', {});
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'param'));
      assert(hasProperty(res.tags[0], 'type'));
      assert.deepEqual(res.tags[0].type, {
        name: 'function',
        type: 'NameExpression'
      });
      assert(hasProperty(res.tags[0], 'name', 'foo'));
      assert(hasProperty(res.tags[0], 'description', 'description'));
    });
  });

  describe('tagged namepaths', () => {
    it('recognize module:', () => {
      let res = comments.parseComment(['@alias module:Foo.bar'].join('\n'), {});
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'alias'));
      assert(hasProperty(res.tags[0], 'name', 'module:Foo.bar'));
      assert(hasProperty(res.tags[0], 'description', null));
    });

    it('recognize external:', () => {
      let res = comments.parseComment(['@param {external:Foo.bar} baz description'].join('\n'), {});
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'param'));
      assert.deepEqual(res.tags[0].type, {
        name: 'external:Foo.bar',
        type: 'NameExpression'
      });
      assert(hasProperty(res.tags[0], 'name', 'baz'));
      assert(hasProperty(res.tags[0], 'description', 'description'));
    });

    it('recognize event:', () => {
      let res = comments.parseComment(['@function event:Foo.bar'].join('\n'), {});
      assert.equal(res.tags.length, 1);
      assert(hasProperty(res.tags[0], 'title', 'function'));
      assert(hasProperty(res.tags[0], 'name', 'event:Foo.bar'));
      assert(hasProperty(res.tags[0], 'description', null));
    });

    it('invalid bogus:', () => {
      let res = comments.parseComment(['@method bogus:Foo.bar'].join('\n'), {});
      assert.equal(res.tags.length, 0);
    });
  });
});
