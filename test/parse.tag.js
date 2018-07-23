'use strict';

require('mocha');
require('should');
const assert = require('assert');
const Comments = require('..');
const doctrine = require('doctrine');
let comments;

/**
 * Some of these tests are based on tests from doctrine
 * https://github.com/eslint/doctrine/LICENSE.BSD
 * https://github.com/eslint/doctrine/LICENSE.closure-compiler
 * https://github.com/eslint/doctrine/LICENSE.esprima
 */

describe('parse tag', function() {
  beforeEach(function() {
    comments = new Comments();
  });

  describe('parseTag', function() {
    it('alias', function() {
      const res = comments.parse('/** @alias */', { unwrap: true });
      assert.equal(res[0].tags.length, 1);
    });

    it('alias (strict)', function() {
      const res = comments.parse('/** @alias */', {
        unwrap: true,
        strict: true
      });
      assert.equal(res[0].tags.length, 0);
    });

    it('alias with name', function() {
      const res = comments.parse('/** @alias aliasName */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'alias'));
      assert(res[0].tags[0].hasOwnProperty('name', 'aliasName'));
    });

    it('alias with namepath', function() {
      const res = comments.parse('/** @alias aliasName.OK */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'alias'));
      assert(res[0].tags[0].hasOwnProperty('name', 'aliasName.OK'));
    });

    it('alias with namepath with slash', function() {
      const res = comments.parse('/** @alias module:mymodule/mymodule.init */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'alias'));
      assert(res[0].tags[0].hasOwnProperty('name', 'module:mymodule/mymodule.init'));
    });

    it('alias with namepath with hyphen in it', function() {
      const res = comments.parse('/** @alias module:mymodule/my-module */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'alias'));
      assert(res[0].tags[0].hasOwnProperty('name', 'module:mymodule/my-module'));
    });

    it('const', function() {
      const res = comments.parse('/** @const */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'const'));
    });

    it('const with name', function() {
      const res = comments.parse('/** @const constname */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'const'));
      assert(res[0].tags[0].hasOwnProperty('name', 'constname'));
    });

    it('constant with name', function() {
      const res = comments.parse('/** @constant constname */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'constant'));
      assert(res[0].tags[0].hasOwnProperty('name', 'constname'));
    });

    it('const with type and name', function() {
      const res = comments.parse('/** @const {String} constname */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'const'));
      assert(res[0].tags[0].hasOwnProperty('name', 'constname'));
      assert(res[0].tags[0].hasOwnProperty('type'));
      assert.deepEqual(res[0].tags[0].type, {
        type: 'NameExpression',
        name: 'String'
      });
    });

    it('Const with type and name', function() {
      const res = comments.parse('/** @Const {String} constname */', {
        unwrap: true
      });

      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'Const'));
      assert(res[0].tags[0].hasOwnProperty('name', 'constname'));
      assert(res[0].tags[0].hasOwnProperty('type'));
      assert.deepEqual(res[0].tags[0].type, {
        type: 'NameExpression',
        name: 'String'
      });
    });

    it('constant with type and name', function() {
      const res = comments.parse('/** @constant {String} constname */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'constant'));
      assert(res[0].tags[0].hasOwnProperty('name', 'constname'));
      assert(res[0].tags[0].hasOwnProperty('type'));
      assert.deepEqual(res[0].tags[0].type, {
        type: 'NameExpression',
        name: 'String'
      });
    });

    it('const multiple', function() {
      const res = comments.parse('/**@const\n @const*/', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 2);
      assert(res[0].tags[0].hasOwnProperty('title', 'const'));
      assert(res[0].tags[1].hasOwnProperty('title', 'const'));
    });

    it('const double', function() {
      const res = comments.parse('/**@const\n @const*/', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 2);
      assert(res[0].tags[0].hasOwnProperty('title', 'const'));
      assert(res[0].tags[1].hasOwnProperty('title', 'const'));
    });

    it('const triple', function() {
      const res = comments.parse([
        '/**',
        ' * @const @const',
        ' * @const @const',
        ' * @const @const',
        ' */'
      ].join('\n'), {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 3);
      assert(res[0].tags[0].hasOwnProperty('title', 'const'));
      assert(res[0].tags[1].hasOwnProperty('title', 'const'));
      assert(res[0].tags[2].hasOwnProperty('title', 'const'));
    });

    it('constructor', function() {
      const res = comments.parse('/** @constructor */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'constructor'));
    });

    it('constructor with type', function() {
      const res = comments.parse('/** @constructor {Object} */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'constructor'));
      assert.deepEqual(res[0].tags[0].type, {
        type: 'NameExpression',
        name: 'Object'
      });
    });

    it('constructor with type and name', function() {
      const res = comments.parse('/** @constructor {Object} objName */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'constructor'));
      assert(res[0].tags[0].hasOwnProperty('name', 'objName'));
      assert.deepEqual(res[0].tags[0].type, {
        type: 'NameExpression',
        name: 'Object'
      });
    });

    it('class', function() {
      const res = comments.parse('/** @class */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'class'));
    });

    it('class with type', function() {
      const res = comments.parse('/** @class {Object} */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'class'));
      assert.deepEqual(res[0].tags[0].type, {
        type: 'NameExpression',
        name: 'Object'
      });
    });

    it('class with type and name', function() {
      const res = comments.parse('/** @class {Object} objName */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'class'));
      assert(res[0].tags[0].hasOwnProperty('name', 'objName'));
      assert.deepEqual(res[0].tags[0].type, {
        type: 'NameExpression',
        name: 'Object'
      });
    });

    it('deprecated', function() {
      let res = comments.parse('/** @deprecated */', {
        unwrap: true
      });

      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'deprecated'));

      res = comments.parse('/** @deprecated some text here describing why it is deprecated */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'deprecated'));
      assert(res[0].tags[0].hasOwnProperty('description', 'some text here describing why it is deprecated'));
    });

    it('func', function() {
      const res = comments.parse('/** @func */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'func'));
    });

    it('func with name', function() {
      const res = comments.parse('/** @func thingName.func */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'func'));
      assert(res[0].tags[0].hasOwnProperty('name', 'thingName.func'));
    });

    it('func with type', function() {
      const res = comments.parse('/** @func {Object} thingName.func */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 0);
    // func does not accept type
    });

    it('function', function() {
      const res = comments.parse('/** @function */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'function'));
    });

    it('function with name', function() {
      const res = comments.parse('/** @function thingName.function */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'function'));
      assert(res[0].tags[0].hasOwnProperty('name', 'thingName.function'));
    });

    it('function with type', function() {
      // function does not accept type
      const res = comments.parse('/** @function {Object} thingName.function */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 0);
    });

    it('recognize "function" type', function() {
      const res = comments.parse('/** @param {function} foo description */', {});
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'param'));
      assert(res[0].tags[0].hasOwnProperty('type'));
      assert.deepEqual(res[0].tags[0].type, {
        'name': 'function',
        'type': 'NameExpression'
      });
      assert(res[0].tags[0].hasOwnProperty('name', 'foo'));
      assert(res[0].tags[0].hasOwnProperty('description', 'description'));
    });

    it('member', function() {
      const res = comments.parse('/** @member */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'member'));
    });

    it('member with name', function() {
      const res = comments.parse('/** @member thingName.name */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'member'));
      assert(res[0].tags[0].hasOwnProperty('name', 'thingName.name'));
    });

    it('member with type', function() {
      const res = comments.parse('/** @member {Object} thingName.name */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'member'));
      assert(res[0].tags[0].hasOwnProperty('name', 'thingName.name'));
      assert(res[0].tags[0].hasOwnProperty('type'));
      assert.deepEqual(res[0].tags[0].type, {
        type: 'NameExpression',
        name: 'Object'
      });
    });

    it('method', function() {
      const res = comments.parse('/** @method */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'method'));
    });

    it('method with name', function() {
      const res = comments.parse('/** @method thingName.function */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'method'));
      assert(res[0].tags[0].hasOwnProperty('name', 'thingName.function'));
    });

    it('method with type', function() {
      const res = comments.parse('/** @method {Object} thingName.function */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 0);
    // method does not accept type
    });

    it('mixes', function() {
      const res = comments.parse('/** @mixes */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
    });

    it('mixes (strict)', function() {
      const res = comments.parse('/** @mixes */', {
        unwrap: true,
        strict: true
      });
      assert.equal(res[0].tags.length, 0);
    });

    it('mixes with name', function() {
      const res = comments.parse('/** @mixes thingName */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'mixes'));
      assert(res[0].tags[0].hasOwnProperty('name', 'thingName'));
    });

    it('mixes with namepath', function() {
      const res = comments.parse('/** @mixes thingName.name */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'mixes'));
      assert(res[0].tags[0].hasOwnProperty('name', 'thingName.name'));
    });

    it('mixin', function() {
      const res = comments.parse('/** @mixin */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'mixin'));
    });

    it('mixin with name', function() {
      const res = comments.parse('/** @mixin thingName */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'mixin'));
      assert(res[0].tags[0].hasOwnProperty('name', 'thingName'));
    });

    it('mixin with namepath', function() {
      const res = comments.parse('/** @mixin thingName.name */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'mixin'));
      assert(res[0].tags[0].hasOwnProperty('name', 'thingName.name'));
    });

    it('module', function() {
      const res = comments.parse('/** @module */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'module'));
    });

    it('module with name', function() {
      const res = comments.parse('/** @module thingName.name */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'module'));
      assert(res[0].tags[0].hasOwnProperty('name', 'thingName.name'));
    });

    it('module with name that has a hyphen in it', function() {
      const res = comments.parse('/** @module thingName-name */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'module'));
      assert(res[0].tags[0].hasOwnProperty('name', 'thingName-name'));
    });

    it('module with type', function() {
      const res = comments.parse('/** @module {Object} thingName.name */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'module'));
      assert(res[0].tags[0].hasOwnProperty('name', 'thingName.name'));
      assert(res[0].tags[0].hasOwnProperty('type'));
      assert.deepEqual(res[0].tags[0].type, {
        type: 'NameExpression',
        name: 'Object'
      });
    });

    it('module with path', function() {
      const res = comments.parse('/** @module path/to/thingName.name */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'module'));
      assert(res[0].tags[0].hasOwnProperty('name', 'path/to/thingName.name'));
    });

    it('name', function() {
      const res = comments.parse('/** @name thingName.name */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'name'));
      assert(res[0].tags[0].hasOwnProperty('name', 'thingName.name'));
    });

    it('name', function() {
      const res = comments.parse('/** @name thingName#name */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'name'));
      assert(res[0].tags[0].hasOwnProperty('name', 'thingName#name'));
    });

    it('name', function() {
      const res = comments.parse('/** @name thingName~name */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'name'));
      assert(res[0].tags[0].hasOwnProperty('name', 'thingName~name'));
    });

    it('name', function() {
      const res = comments.parse('/** @name {thing} thingName.name */', {
        unwrap: true
      });
      // name does not accept type
      assert.equal(res[0].tags.length, 0);
    });

    it('namespace', function() {
      const res = comments.parse('/** @namespace */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'namespace'));
    });

    it('namespace with name', function() {
      const res = comments.parse('/** @namespace thingName.name */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'namespace'));
      assert(res[0].tags[0].hasOwnProperty('name', 'thingName.name'));
    });

    it('namespace with type', function() {
      const res = comments.parse('/** @namespace {Object} thingName.name */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'namespace'));
      assert(res[0].tags[0].hasOwnProperty('name', 'thingName.name'));
      assert(res[0].tags[0].hasOwnProperty('type'));
      assert.deepEqual(res[0].tags[0].type, {
        type: 'NameExpression',
        name: 'Object'
      });
    });

    it('param', function() {
      const res = comments.parse([
        '/**',
        ' * @param {String} userName',
        '*/'
      ].join('\n'), {
        unwrap: true
      });

      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'param'));
      assert(res[0].tags[0].hasOwnProperty('name', 'userName'));
      assert(res[0].tags[0].hasOwnProperty('type'));
      assert.deepEqual(res[0].tags[0].type, {
        type: 'NameExpression',
        name: 'String'
      });
    });

    it('param with properties', function() {
      const res = comments.parse([
        '/**',
        ' * @param {String} user.name',
        '*/'
      ].join('\n'), {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'param'));
      assert(res[0].tags[0].hasOwnProperty('name', 'user.name'));
      assert(res[0].tags[0].hasOwnProperty('type'));
      assert.deepEqual(res[0].tags[0].type, {
        type: 'NameExpression',
        name: 'String'
      });
    });

    it('param with properties with description', function() {
      const res = comments.parse([
        '/**',
        ' * @param {String} user.name - hi',
        '*/'
      ].join('\n'), {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'param'));
      assert(res[0].tags[0].hasOwnProperty('name', 'user.name'));
      assert(res[0].tags[0].hasOwnProperty('description', 'hi'));
      assert(res[0].tags[0].hasOwnProperty('type'));
      assert.deepEqual(res[0].tags[0].type, {
        type: 'NameExpression',
        name: 'String'
      });
    });

    it('param with array properties with description', function() {
      const res = comments.parse([
        '/**',
        ' * @param {string} employee[].name - hi',
        ' */'
      ].join('\n'), {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'param'));
      assert(res[0].tags[0].hasOwnProperty('name', 'employee[].name'));
      assert(res[0].tags[0].hasOwnProperty('description', 'hi'));
      assert(res[0].tags[0].hasOwnProperty('type'));
      assert.deepEqual(res[0].tags[0].type, {
        type: 'NameExpression',
        name: 'string'
      });
    });

    it('param with array properties without description', function() {
      const res = comments.parse([
        '/**',
        ' * @param {string} employee[].name',
        ' */'
      ].join('\n'), {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'param'));
      assert(res[0].tags[0].hasOwnProperty('name', 'employee[].name'));
      assert(res[0].tags[0].hasOwnProperty('description', ''));
      assert(res[0].tags[0].hasOwnProperty('type'));
      assert.deepEqual(res[0].tags[0].type, {
        type: 'NameExpression',
        name: 'string'
      });
    });

    it('arg with properties', function() {
      const res = comments.parse([
        '/**',
        ' * @arg {String} user.name',
        '*/'
      ].join('\n'), {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'arg'));
      assert(res[0].tags[0].hasOwnProperty('name', 'user.name'));
      assert(res[0].tags[0].hasOwnProperty('type'));
      assert.deepEqual(res[0].tags[0].type, {
        type: 'NameExpression',
        name: 'String'
      });
    });

    it('argument with properties', function() {
      const res = comments.parse([
        '/**',
        ' * @argument {String} user.name',
        '*/'
      ].join('\n'), {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'argument'));
      assert(res[0].tags[0].hasOwnProperty('name', 'user.name'));
      assert(res[0].tags[0].hasOwnProperty('type'));
      assert.deepEqual(res[0].tags[0].type, {
        type: 'NameExpression',
        name: 'String'
      });
    });

    it('param typeless', function() {
      let res = comments.parse([
        '/**',
        ' * @param something [bye] hi',
        '*/'
      ].join('\n'), {
        unwrap: true,
        strict: false
      });

      assert.equal(res[0].tags.length, 1);
      res[0].tags[0].should.eql({
        title: 'param',
        type: null,
        name: 'something',
        description: '[bye] hi'
      });

      res = comments.parse([
        '/**',
        ' * @param userName',
        '*/'
      ].join('\n'), {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      res[0].tags[0].should.eql({
        title: 'param',
        type: null,
        name: 'userName',
        description: ''
      });

      res = comments.parse([
        '/**',
        ' * @param userName Something descriptive',
        '*/'
      ].join('\n'), {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      res[0].tags[0].should.eql({
        title: 'param',
        type: null,
        name: 'userName',
        description: 'Something descriptive'
      });

      res = comments.parse([
        '/**',
        ' * @param user.name Something descriptive',
        '*/'
      ].join('\n'), {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      res[0].tags[0].should.eql({
        title: 'param',
        type: null,
        name: 'user.name',
        description: 'Something descriptive'
      });
    });

    it('param broken', function() {
      const res = comments.parse([
        '/**',
        ' * @param {String} userName',
        ' * @param {String userName',
        '*/'
      ].join('\n'), {
        unwrap: true
      });

      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'param'));
      assert(res[0].tags[0].hasOwnProperty('name', 'userName'));
      assert(res[0].tags[0].hasOwnProperty('type'));
      assert.deepEqual(res[0].tags[0].type, {
        type: 'NameExpression',
        name: 'String'
      });
    });

    it('param record', function() {
      const str = [
        '/**',
        ' * @param {{ok:String}} userName',
        '*/'
      ].join('\n');

      const res = comments.parse(str, {unwrap: true });

      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'param'));
      assert(res[0].tags[0].hasOwnProperty('name', 'userName'));
      assert(res[0].tags[0].hasOwnProperty('type'));
      assert.deepEqual(res[0].tags[0].type, {
        type: 'RecordType',
        fields: [{
          type: 'FieldType',
          key: 'ok',
          value: {
            type: 'NameExpression',
            name: 'String'
          }
        }]
      });
    });

    it('param record broken', function() {
      const res = comments.parse([
        '/**',
        ' * @param {{ok:String} userName',
        '*/'
      ].join('\n'), {
        unwrap: true
      });
      res[0].tags.should.be.empty;
    });

    it('param multiple', function() {
      const str = [
        '/**',
        ' * @param {string|array|function} foo',
        '*/'
      ].join('\n');

      const res = comments.parse(str, { unwrap: true });
      // console.log(res[0].tags[0].type)
      assert.deepEqual(res[0].tags[0].type, {
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
            name: 'function'
          }
        ]
      });
    });

    it('param multiple lines', function() {
      const res = comments.parse([
        '/**',
        ' * @param {string|',
        ' *     number} userName',
        ' * }}',
        '*/'
      ].join('\n'), {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'param'));
      assert(res[0].tags[0].hasOwnProperty('name', 'userName'));
      assert(res[0].tags[0].hasOwnProperty('type'));
      assert.deepEqual(res[0].tags[0].type, {
        type: 'UnionType',
        elements: [{
          type: 'NameExpression',
          name: 'string'
        }, {
          type: 'NameExpression',
          name: 'number'
        }]
      });
    });

    it('param without braces', function() {
      const res = comments.parse([
        '/**',
        ' * @param string name description',
        '*/'
      ].join('\n'), {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'param'));
      assert(res[0].tags[0].hasOwnProperty('name', 'string'));
      assert(res[0].tags[0].hasOwnProperty('type', null));
      assert(res[0].tags[0].hasOwnProperty('description', 'name description'));
    });

    it('param w/ hyphen before description', function() {
      const res = comments.parse([
        '/**',
        ' * @param {string} name - description',
        '*/'
      ].join('\n'), {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert.deepEqual(res[0].tags[0], {
        title: 'param',
        type: {
          type: 'NameExpression',
          name: 'string'
        },
        name: 'name',
        description: 'description'
      });
    });

    it('param w/ hyphen + leading space before description', function() {
      const res = comments.parse([
        '/**',
        ' * @param {string} name -   description',
        '*/'
      ].join('\n'), {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert.deepEqual(res[0].tags[0], {
        title: 'param',
        type: {
          type: 'NameExpression',
          name: 'string'
        },
        name: 'name',
        description: 'description'
      });
    });

    it('description and param separated by blank line', function() {
      const res = comments.parse([
        '/**',
        ' * Description',
        ' * blah blah blah',
        ' *',
        ' * @param {string} name description',
        '*/'
      ].join('\n'), {
        unwrap: true
      });

      res[0].description.should.eql('Description\nblah blah blah');
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'param'));
      assert(res[0].tags[0].hasOwnProperty('name', 'name'));
      assert(res[0].tags[0].hasOwnProperty('type'));
      assert.deepEqual(res[0].tags[0].type, {
        type: 'NameExpression',
        name: 'string'
      });
      assert(res[0].tags[0].hasOwnProperty('description', 'description'));
    });

    it('regular block comment instead of jsdoc-style block comment', function() {
      const res = comments.parse([
        '/*',
        ' * Description',
        ' * blah blah blah',
        '*/'
      ].join('\n'), {
        allowSingleStar: true,
        unwrap: true
      });

      res[0].description.should.eql('Description\nblah blah blah');
    });

    it('augments', function() {
      const res = comments.parse('/** @augments */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
    });

    it('augments with name', function() {
      const res = comments.parse('/** @augments ClassName */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'augments'));
      assert(res[0].tags[0].hasOwnProperty('name', 'ClassName'));
    });

    it('augments with type', function() {
      const res = comments.parse('/** @augments {ClassName} */', {
        unwrap: true
      });

      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'augments'));
      assert.deepEqual(res[0].tags[0].type, {
        type: 'NameExpression',
        name: 'ClassName'
      });
    });

    it('augments with dot-notation name', function() {
      const res = comments.parse('/** @augments ClassName.OK */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'augments'));
      assert(res[0].tags[0].hasOwnProperty('name', 'ClassName.OK'));
    });

    it('extends', function() {
      const res = comments.parse('/** @extends */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
    });

    it('extends with name', function() {
      const res = comments.parse('/** @extends ClassName */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'extends'));
      assert(res[0].tags[0].hasOwnProperty('name', 'ClassName'));
    });

    it('extends with type', function() {
      const res = comments.parse('/** @extends {ClassName} */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'extends'));
      assert.deepEqual(res[0].tags[0].type, {
        type: 'NameExpression',
        name: 'ClassName'
      });
    });

    it('extends with namepath', function() {
      const res = comments.parse('/** @extends ClassName.OK */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'extends'));
      assert(res[0].tags[0].hasOwnProperty('name', 'ClassName.OK'));
    });

    it('extends with namepath', function() {
      const res = comments.parse('/** @extends module:path/ClassName~OK */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'extends'));
      assert(res[0].tags[0].hasOwnProperty('name', 'module:path/ClassName~OK'));
    });

    it('prop', function() {
      const res = comments.parse([
        '/**',
        ' * @prop {string} thingName - does some stuff',
        '*/'
      ].join('\n'), {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'prop'));
      assert(res[0].tags[0].hasOwnProperty('description', 'does some stuff'));
      assert(res[0].tags[0].type.hasOwnProperty('name', 'string'));
      assert(res[0].tags[0].hasOwnProperty('name', 'thingName'));
    });

    it('prop without type', function() {
      let res = comments.parse([
        '/**',
        ' * @prop thingName - does some stuff',
        '*/'
      ].join('\n'), {
        unwrap: true
      });

      assert.equal(res[0].tags.length, 1);

      res = comments.parse([
        '/**',
        ' * @prop thingName - does some stuff',
        '*/'
      ].join('\n'), {
        unwrap: true,
        strict: true
      });

      assert.equal(res[0].tags.length, 0);
    });

    it('property', function() {
      const res = comments.parse([
        '/**',
        ' * @property {string} thingName - does some stuff',
        '*/'
      ].join('\n'), {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'property'));
      assert(res[0].tags[0].hasOwnProperty('description', 'does some stuff'));
      assert(res[0].tags[0].type.hasOwnProperty('name', 'string'));
      assert(res[0].tags[0].hasOwnProperty('name', 'thingName'));
    });

    it('property without type', function() {
      const res = comments.parse([
        '/**',
        ' * @property thingName - does some stuff',
        '*/'
      ].join('\n'), {
        unwrap: true,
        strict: true
      });

      assert.equal(res[0].tags.length, 0);
    });

    it('property with optional type', function() {
      let res = comments.parse(['/**',
        '* testtypedef',
        '* @typedef {object} abc',
        '* @property {String} [val] value description',
        '*/'
      ].join('\n'), {
        unwrap: true,
        strict: false
      });

      assert(res[0].tags[1].hasOwnProperty('title', 'property'));
      assert(res[0].tags[1].hasOwnProperty('type'));
      assert.deepEqual(res[0].tags[1].type, {
        type: 'OptionalType',
        expression: {
          type: 'NameExpression',
          name: 'String'
        }
      });

      res = comments.parse(['/**',
        '* testtypedef',
        '* @typedef {object} abc',
        '* @property {String} val value description',
        '*/'
      ].join('\n'), {
        unwrap: true,
        strict: false
      });

      assert(res[0].tags[1].hasOwnProperty('title', 'property'));
      assert(res[0].tags[1].hasOwnProperty('type'));
      assert.deepEqual(res[0].tags[1].type, {
        type: 'NameExpression',
        name: 'String'
      });
    });

    it('property with nested name', function() {
      const res = comments.parse([
        '/**',
        ' * @property {string} thingName.name - does some stuff',
        '*/'
      ].join('\n'), {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'property'));
      assert(res[0].tags[0].hasOwnProperty('description', 'does some stuff'));
      assert(res[0].tags[0].type.hasOwnProperty('name', 'string'));
      assert(res[0].tags[0].hasOwnProperty('name', 'thingName.name'));
    });

    it('throws', function() {
      const res = comments.parse([
        '/**',
        ' * @throws {Error} if something goes wrong',
        ' */'
      ].join('\n'), {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'throws'));
      assert(res[0].tags[0].hasOwnProperty('description', 'if something goes wrong'));
      assert(res[0].tags[0].type.hasOwnProperty('name', 'Error'));
    });

    it('throws without type', function() {
      const res = comments.parse([
        '/**',
        ' * @throws if something goes wrong',
        ' */'
      ].join('\n'), {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'throws'));
      assert(res[0].tags[0].hasOwnProperty('description', 'if something goes wrong'));
    });

    it('kind', function() {
      const res = comments.parse('/** @kind class */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'kind'));
      assert(res[0].tags[0].hasOwnProperty('kind', 'class'));
    });

    it('kind error', function() {
      const res = comments.parse('/** @kind ng */', {
        unwrap: true,
        recoverable: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('errors'));
      assert.equal(res[0].tags[0].errors.length, 1);
      res[0].tags[0].errors[0].should.equal('Invalid kind name "ng"');
    });

    it('todo', function() {
      const res = comments.parse('/** @todo Write the documentation */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'todo'));
      assert(res[0].tags[0].hasOwnProperty('description', 'Write the documentation'));
    });

    it('typedef', function() {
      const res = comments.parse('/** @typedef {Object} NumberLike */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('type'));
      assert.deepEqual(res[0].tags[0].type, {
        type: 'NameExpression',
        name: 'Object'
      });
      assert(res[0].tags[0].hasOwnProperty('name', 'NumberLike'));
    });

    it('summary', function() {
      // japanese lang
      const res = comments.parse('/** @summary ゆるゆり3期おめでとー */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'summary'));
      assert(res[0].tags[0].hasOwnProperty('description', 'ゆるゆり3期おめでとー'));
    });

    it('variation', function() {
      // japanese lang
      const res = comments.parse('/** @variation 42 */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'variation'));
      assert(res[0].tags[0].hasOwnProperty('variation', 42));
    });

    it('variation error', function() {
      // japanese lang
      const res = comments.parse('/** @variation Animation */', {
        unwrap: true,
        recoverable: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('errors'));
      assert.equal(res[0].tags[0].errors.length, 1);
      res[0].tags[0].errors[0].should.equal('Invalid variation "Animation"');
    });

    it('access', function() {
      const res = comments.parse('/** @access public */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'access'));
      assert(res[0].tags[0].hasOwnProperty('access', 'public'));
    });

    it('access error', function() {
      const res = comments.parse('/** @access ng */', {
        unwrap: true,
        recoverable: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('errors'));
      assert.equal(res[0].tags[0].errors.length, 1);
      res[0].tags[0].errors[0].should.equal('Invalid access name "ng"');
    });

    it('public', function() {
      const res = comments.parse('/** @public */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'public'));
    });

    it('public type and description', function() {
      const res = comments.parse('/** @public {number} ok */', {
        unwrap: true,
        recoverable: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'public'));
      assert(res[0].tags[0].hasOwnProperty('description', 'ok'));
      assert(res[0].tags[0].hasOwnProperty('type'));
      assert.deepEqual(res[0].tags[0].type, {
        type: 'NameExpression',
        name: 'number'
      });
    });

    it('protected', function() {
      const res = comments.parse('/** @protected */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'protected'));
    });

    it('protected type and description', function() {
      const res = comments.parse('/** @protected {number} ok */', {
        unwrap: true,
        recoverable: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'protected'));
      assert(res[0].tags[0].hasOwnProperty('description', 'ok'));
      assert(res[0].tags[0].hasOwnProperty('type'));
      assert.deepEqual(res[0].tags[0].type, {
        type: 'NameExpression',
        name: 'number'
      });
    });

    it('private', function() {
      const res = comments.parse('/** @private */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'private'));
    });

    it('private type and description', function() {
      const res = comments.parse('/** @private {number} ok */', {
        unwrap: true,
        recoverable: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'private'));
      assert(res[0].tags[0].hasOwnProperty('description', 'ok'));
      assert(res[0].tags[0].hasOwnProperty('type'));
      assert.deepEqual(res[0].tags[0].type, {
        type: 'NameExpression',
        name: 'number'
      });
    });

    it('readonly', function() {
      const res = comments.parse('/** @readonly */', {
        unwrap: true
      });

      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'readonly'));
    });

    it('readonly description (non-strict)', function() {
      const res = comments.parse('/** @readonly ng */', {unwrap: true});
      assert.equal(res[0].tags.length, 1);
      res[0].tags[0].description.should.equal('ng');
    });

    it('readonly error', function() {
      const res = comments.parse('/** @readonly ng */', {
        unwrap: true,
        strict: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('errors'));
      assert.equal(res[0].tags[0].errors.length, 1);
      res[0].tags[0].errors[0].should.equal('@readonly cannot have a description in strict mode');
    });

    it('requires', function() {
      const res = comments.parse('/** @requires */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
    });

    it('requires (strict)', function() {
      const res = comments.parse('/** @requires */', {
        unwrap: true,
        strict: true
      });
      assert.equal(res[0].tags.length, 0);
    });

    it('requires with module name', function() {
      const res = comments.parse('/** @requires name.path */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'requires'));
      assert(res[0].tags[0].hasOwnProperty('name', 'name.path'));
    });

    it('global', function() {
      const res = comments.parse('/** @global */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'global'));
    });

    it('global description', function() {
      const res = comments.parse('/** @global ng */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      res[0].tags[0].description.should.equal('ng');
    });

    it('global error (strict)', function() {
      const res = comments.parse('/** @global ng */', {
        unwrap: true,
        strict: true
      });

      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('errors'));
      assert.equal(res[0].tags[0].errors.length, 1);
      res[0].tags[0].errors[0].should.equal('@global cannot have a description in strict mode');
    });

    it('inner', function() {
      const res = comments.parse('/** @inner */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'inner'));
    });

    it('inner description', function() {
      const res = comments.parse('/** @inner ng */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert.equal(res[0].tags.length, 1);
      res[0].tags[0].description.should.equal('ng');
    });

    it('inner error (strict)', function() {
      const res = comments.parse('/** @inner ng */', {
        unwrap: true,
        strict: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('errors'));
      assert.equal(res[0].tags[0].errors.length, 1);
      res[0].tags[0].errors[0].should.equal('@inner cannot have a description in strict mode');
    });

    it('instance', function() {
      const res = comments.parse('/** @instance */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'instance'));
    });

    it('instance description', function() {
      const res = comments.parse('/** @instance ng */', {unwrap: true});
      assert.equal(res[0].tags.length, 1);
      res[0].tags[0].description.should.equal('ng');
    });

    it('instance error (strict)', function() {
      const res = comments.parse('/** @instance ng */', {
        unwrap: true,
        strict: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('errors'));
      assert.equal(res[0].tags[0].errors.length, 1);
      res[0].tags[0].errors[0].should.equal('@instance cannot have a description in strict mode');
    });

    it('since', function() {
      const res = comments.parse('/** @since 1.2.1 */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'since'));
      assert(res[0].tags[0].hasOwnProperty('description', '1.2.1'));
    });

    it('static', function() {
      const res = comments.parse('/** @static */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'static'));
    });

    it('static description', function() {
      const res = comments.parse('/** @static ng */', {unwrap: true});
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('description', 'ng'));
    });

    it('static error', function() {
      const res = comments.parse('/** @static ng */', {
        unwrap: true,
        strict: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('errors'));
      assert.equal(res[0].tags[0].errors.length, 1);
      res[0].tags[0].errors[0].should.equal('@static cannot have a description in strict mode');
    });

    it('this', function() {
      const res = comments.parse([
        '/**',
        ' * @this thingName',
        '*/'
      ].join('\n'), {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'this'));
      assert(res[0].tags[0].hasOwnProperty('name', 'thingName'));
    });

    it('this with namepath', function() {
      const res = comments.parse([
        '/**',
        ' * @this thingName.name',
        '*/'
      ].join('\n'), {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'this'));
      assert(res[0].tags[0].hasOwnProperty('name', 'thingName.name'));
    });

    it('this with name expression', function() {
      const res = comments.parse([
        '/**',
        ' * @this {thingName.name}',
        '*/'
      ].join('\n'), {
        unwrap: true
      });

      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'this'));
      assert(res[0].tags[0].hasOwnProperty('name', 'thingName.name'));
    });

    it('this with multiple application types', function() {
      const res = comments.parse([
        '/**',
        ' * @this {Array<string, object>} foo',
        '*/'
      ].join('\n'), {
        unwrap: true,
        recoverable: true
      });

      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'this'));
      assert.deepEqual(res[0].tags[0].type, {
        'type': 'TypeApplication',
        'applications': [
          {
            'name': 'string',
            'type': 'NameExpression'
          },
          {
            'name': 'object',
            'type': 'NameExpression'
          }
        ],
        'expression': {
          'name': 'Array',
          'type': 'NameExpression'
        }
      });
    });

    it('this error with type application', function() {
      const res = comments.parse([
        '/**',
        ' * @this {Array<string>}',
        '*/'
      ].join('\n'), {
        unwrap: true,
        recoverable: true
      });

      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'this'));
      assert(res[0].tags[0].hasOwnProperty('errors'));
      assert.equal(res[0].tags[0].errors.length, 1);
      res[0].tags[0].errors[0].should.equal('Invalid name for @this');
    });

    it('this error', function() {
      const res = comments.parse([
        '/**',
        ' * @this',
        '*/'
      ].join('\n'), {
        unwrap: true
      });

      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'this'));
      assert(res[0].tags[0].hasOwnProperty('errors'));
      assert.equal(res[0].tags[0].errors.length, 1);
      res[0].tags[0].errors[0].should.equal('expected @this tag to have type and name properties');
    });

    it('var', function() {
      const res = comments.parse('/** @var */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'var'));
    });

    it('var with name', function() {
      const res = comments.parse('/** @var thingName.name */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'var'));
      assert(res[0].tags[0].hasOwnProperty('name', 'thingName.name'));
    });

    it('var with type', function() {
      const res = comments.parse('/** @var {Object} thingName.name */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'var'));
      assert(res[0].tags[0].hasOwnProperty('name', 'thingName.name'));
      assert(res[0].tags[0].hasOwnProperty('type'));
      assert.deepEqual(res[0].tags[0].type, {
        type: 'NameExpression',
        name: 'Object'
      });
    });

    it('version', function() {
      const res = comments.parse('/** @version 1.2.1 */', {
        unwrap: true
      });
      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'version'));
      assert(res[0].tags[0].hasOwnProperty('description', '1.2.1'));
    });

    it('invalid name', function() {
      const res = comments.parse('/** @name thingName#%name */', {
        unwrap: true,
        strict: true
      });

      // name does not accept type
      assert.equal(res[0].tags.length, 0);
      res[0].description.should.equal('');
    });

    it('string literal property', function() {
      const res = comments.parse([
        '/**',
        ' * @typedef {Object} comment',
        " * @property {('public'|'protected'|'private')} access",
        '*/'
      ].join('\n'), {
        unwrap: true
      });

      assert.equal(res[0].tags.length, 2);
      assert(res[0].tags[1].hasOwnProperty('title', 'property'));
      assert(res[0].tags[1].hasOwnProperty('name', 'access'));
      assert(res[0].tags[1].type.hasOwnProperty('type', 'UnionType'));
      assert.equal(res[0].tags[1].type.elements.length, 3);
      assert.deepEqual(res[0].tags[1].type.elements[0], {
        type: 'StringLiteralType',
        value: 'public'
      });
      assert.deepEqual(res[0].tags[1].type.elements[1], {
        type: 'StringLiteralType',
        value: 'protected'
      });
      assert.deepEqual(res[0].tags[1].type.elements[2], {
        type: 'StringLiteralType',
        value: 'private'
      });
    });

    it('numeric literal property', function() {
      const res = comments.parse([
        '/**',
        ' * @typedef {Object} comment',
        ' * @property {(-42|1.5|0)} access',
        '*/'
      ].join('\n'), {
        unwrap: true
      });

      assert.equal(res[0].tags.length, 2);
      assert(res[0].tags[1].hasOwnProperty('title', 'property'));
      assert(res[0].tags[1].hasOwnProperty('name', 'access'));
      assert(res[0].tags[1].type.hasOwnProperty('type', 'UnionType'));
      assert.equal(res[0].tags[1].type.elements.length, 3);
      assert.deepEqual(res[0].tags[1].type.elements[0], {
        type: 'NumericLiteralType',
        value: -42
      });
      assert.deepEqual(res[0].tags[1].type.elements[1], {
        type: 'NumericLiteralType',
        value: 1.5
      });
      assert.deepEqual(res[0].tags[1].type.elements[2], {
        type: 'NumericLiteralType',
        value: 0
      });
    });

    it('boolean literal property', function() {
      const res = comments.parse([
        '/**',
        ' * @typedef {Object} comment',
        ' * @property {(true|false)} access',
        '*/'
      ].join('\n'), {
        unwrap: true
      });

      assert.equal(res[0].tags.length, 2);
      assert(res[0].tags[1].hasOwnProperty('title', 'property'));
      assert(res[0].tags[1].hasOwnProperty('name', 'access'));
      assert(res[0].tags[1].type.hasOwnProperty('type', 'UnionType'));
      assert.equal(res[0].tags[1].type.elements.length, 2);
      assert.deepEqual(res[0].tags[1].type.elements[0], {
        type: 'BooleanLiteralType',
        value: true
      });
      assert.deepEqual(res[0].tags[1].type.elements[1], {
        type: 'BooleanLiteralType',
        value: false
      });
    });

    it('complex union with literal types', function() {
      const res = comments.parse([
        '/**',
        ' * @typedef {({ok: true, data: string} | {ok: false, error: Error})} Result',
        '*/'
      ].join('\n'), {unwrap: true});

      assert.equal(res[0].tags.length, 1);
      assert(res[0].tags[0].hasOwnProperty('title', 'typedef'));
      assert(res[0].tags[0].hasOwnProperty('name', 'Result'));
      assert(res[0].tags[0].type.hasOwnProperty('type', 'UnionType'));
      assert.equal(res[0].tags[0].type.elements.length, 2);

      let e0 = res[0].tags[0].type.elements[0];
      assert(e0.hasOwnProperty('type', 'RecordType'));
      assert.equal(e0.fields.length, 2);
      assert.deepEqual(e0.fields[0], {
        type: 'FieldType',
        key: 'ok',
        value: {
          type: 'BooleanLiteralType',
          value: true
        }
      });
      assert.deepEqual(e0.fields[1], {
        type: 'FieldType',
        key: 'data',
        value: {
          type: 'NameExpression',
          name: 'string'
        }
      });

      var e1 = res[0].tags[0].type.elements[1];
      assert(e1.hasOwnProperty('type', 'RecordType'));
      assert.equal(e1.fields.length, 2);
      assert.deepEqual(e1.fields[0], {
        type: 'FieldType',
        key: 'ok',
        value: {
          type: 'BooleanLiteralType',
          value: false
        }
      });
      assert.deepEqual(e1.fields[1], {
        type: 'FieldType',
        key: 'error',
        value: {
          type: 'NameExpression',
          name: 'Error'
        }
      });
    });
  });
});
