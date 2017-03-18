'use strict';

require('mocha');
require('should');
var assert = require('assert');
var doctrine = require('doctrine');
var Comments = require('..');
var comments;

describe('parse tag', function() {
  beforeEach(function() {
    comments = new Comments();
  });

  describe('parseTag', function() {
    it('alias', function() {
      var res = comments.parse('/** @alias */', {
        unwrap: true
      });
      res[0].tags.should.have.length(0);
    });

    it('alias with name', function() {
      var res = comments.parse('/** @alias aliasName */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'alias');
      res[0].tags[0].should.have.property('name', 'aliasName');
    });

    it('alias with namepath', function() {
      var res = comments.parse('/** @alias aliasName.OK */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'alias');
      res[0].tags[0].should.have.property('name', 'aliasName.OK');
    });

    it('alias with namepath with slash', function() {
      var res = comments.parse('/** @alias module:mymodule/mymodule.init */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'alias');
      res[0].tags[0].should.have.property('name', 'module:mymodule/mymodule.init');
    });

    it('alias with namepath with hyphen in it', function() {
      var res = comments.parse('/** @alias module:mymodule/my-module */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'alias');
      res[0].tags[0].should.have.property('name', 'module:mymodule/my-module');
    });

    it('const', function() {
      var res = comments.parse('/** @const */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'const');
    });

    it('const with name', function() {
      var res = comments.parse('/** @const constname */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'const');
      res[0].tags[0].should.have.property('name', 'constname');
    });

    it('constant with name', function() {
      var res = comments.parse('/** @constant constname */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'constant');
      res[0].tags[0].should.have.property('name', 'constname');
    });

    it('const with type and name', function() {
      var res = comments.parse('/** @const {String|Array} constname */', {
        unwrap: true
      });

      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'const');
      res[0].tags[0].should.have.property('name', 'constname');
      res[0].tags[0].should.have.property('type');
      res[0].tags[0].type[0].should.eql({
        type: 'NameExpression',
        name: 'String'
      });
    });

    it('Const with type and name', function() {
      var res = comments.parse('/** @Const {String} constname */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'Const');
      res[0].tags[0].should.have.property('name', 'constname');
      res[0].tags[0].should.have.property('type');
      res[0].tags[0].type[0].should.eql({
        type: 'NameExpression',
        name: 'String'
      });
    });

    it('constant with type and name', function() {
      var res = comments.parse('/** @constant {String} constname */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'constant');
      res[0].tags[0].should.have.property('name', 'constname');
      res[0].tags[0].should.have.property('type');
      res[0].tags[0].type[0].should.eql({
        type: 'NameExpression',
        name: 'String'
      });
    });

    it('const multiple', function() {
      var res = comments.parse('/**@const\n @const*/', {
        unwrap: true
      });
      res[0].tags.should.have.length(2);
      res[0].tags[0].should.have.property('title', 'const');
      res[0].tags[1].should.have.property('title', 'const');
    });

    it('const double', function() {
      var res = comments.parse('/**@const\n @const*/', {
        unwrap: true
      });
      res[0].tags.should.have.length(2);
      res[0].tags[0].should.have.property('title', 'const');
      res[0].tags[1].should.have.property('title', 'const');
    });

    it('const triple', function() {
      var res = comments.parse([
        '/**',
        ' * @const @const',
        ' * @const @const',
        ' * @const @const',
        ' */'
      ].join('\n'), {
        unwrap: true
      });
      res[0].tags.should.have.length(3);
      res[0].tags[0].should.have.property('title', 'const');
      res[0].tags[1].should.have.property('title', 'const');
      res[0].tags[2].should.have.property('title', 'const');
    });

    it('constructor', function() {
      var res = comments.parse('/** @constructor */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'constructor');
    });

    it('constructor with type', function() {
      var res = comments.parse('/** @constructor {Object} */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'constructor');
      res[0].tags[0].type[0].should.eql({
        type: 'NameExpression',
        name: 'Object'
      });
    });

    it('constructor with type and name', function() {
      var res = comments.parse('/** @constructor {Object} objName */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'constructor');
      res[0].tags[0].should.have.property('name', 'objName');
      res[0].tags[0].type[0].should.eql({
        type: 'NameExpression',
        name: 'Object'
      });
    });

    it('class', function() {
      var res = comments.parse('/** @class */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'class');
    });

    it('class with type', function() {
      var res = comments.parse('/** @class {Object} */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'class');
      res[0].tags[0].type[0].should.eql({
        type: 'NameExpression',
        name: 'Object'
      });
    });

    it('class with type and name', function() {
      var res = comments.parse('/** @class {Object} objName */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'class');
      res[0].tags[0].should.have.property('name', 'objName');
      res[0].tags[0].type[0].should.eql({
        type: 'NameExpression',
        name: 'Object'
      });
    });

    it('deprecated', function() {
      var res = comments.parse('/** @deprecated */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'deprecated');
    });

    it('deprecated', function() {
      var res = comments.parse('/** @deprecated some text here describing why it is deprecated */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'deprecated');
      res[0].tags[0].should.have.property('description', 'some text here describing why it is deprecated');
    });

    it('func', function() {
      var res = comments.parse('/** @func */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'func');
    });

    it('func with name', function() {
      var res = comments.parse('/** @func thingName.func */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'func');
      res[0].tags[0].should.have.property('name', 'thingName.func');
    });

    it('func with type', function() {
      var res = comments.parse('/** @func {Object} thingName.func */', {
        unwrap: true
      });
      res[0].tags.should.have.length(0);
    // func does not accept type
    });

    it('function', function() {
      var res = comments.parse('/** @function */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'function');
    });

    it('function with name', function() {
      var res = comments.parse('/** @function thingName.function */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'function');
      res[0].tags[0].should.have.property('name', 'thingName.function');
    });

    it('function with type', function() {
      var res = comments.parse('/** @function {Object} thingName.function */', {
        unwrap: true
      });
      res[0].tags.should.have.length(0);
    // function does not accept type
    });

    it('member', function() {
      var res = comments.parse('/** @member */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'member');
    });

    it('member with name', function() {
      var res = comments.parse('/** @member thingName.name */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'member');
      res[0].tags[0].should.have.property('name', 'thingName.name');
    });

    it('member with type', function() {
      var res = comments.parse('/** @member {Object} thingName.name */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'member');
      res[0].tags[0].should.have.property('name', 'thingName.name');
      res[0].tags[0].should.have.property('type');
      res[0].tags[0].type[0].should.eql({
        type: 'NameExpression',
        name: 'Object'
      });
    });

    it('method', function() {
      var res = comments.parse('/** @method */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'method');
    });

    it('method with name', function() {
      var res = comments.parse('/** @method thingName.function */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'method');
      res[0].tags[0].should.have.property('name', 'thingName.function');
    });

    it('method with type', function() {
      var res = comments.parse('/** @method {Object} thingName.function */', {
        unwrap: true
      });
      res[0].tags.should.have.length(0);
    // method does not accept type
    });

    it('mixes', function() {
      var res = comments.parse('/** @mixes */', {
        unwrap: true
      });
      res[0].tags.should.have.length(0);
    });

    it('mixes with name', function() {
      var res = comments.parse('/** @mixes thingName */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'mixes');
      res[0].tags[0].should.have.property('name', 'thingName');
    });

    it('mixes with namepath', function() {
      var res = comments.parse('/** @mixes thingName.name */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'mixes');
      res[0].tags[0].should.have.property('name', 'thingName.name');
    });

    it('mixin', function() {
      var res = comments.parse('/** @mixin */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'mixin');
    });

    it('mixin with name', function() {
      var res = comments.parse('/** @mixin thingName */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'mixin');
      res[0].tags[0].should.have.property('name', 'thingName');
    });

    it('mixin with namepath', function() {
      var res = comments.parse('/** @mixin thingName.name */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'mixin');
      res[0].tags[0].should.have.property('name', 'thingName.name');
    });

    it('module', function() {
      var res = comments.parse('/** @module */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'module');
    });

    it('module with name', function() {
      var res = comments.parse('/** @module thingName.name */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'module');
      res[0].tags[0].should.have.property('name', 'thingName.name');
    });

    it('module with name that has a hyphen in it', function() {
      var res = comments.parse('/** @module thingName-name */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'module');
      res[0].tags[0].should.have.property('name', 'thingName-name');
    });

    it('module with type', function() {
      var res = comments.parse('/** @module {Object} thingName.name */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'module');
      res[0].tags[0].should.have.property('name', 'thingName.name');
      res[0].tags[0].should.have.property('type');
      res[0].tags[0].type[0].should.eql({
        type: 'NameExpression',
        name: 'Object'
      });
    });

    it('module with path', function() {
      var res = comments.parse('/** @module path/to/thingName.name */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'module');
      res[0].tags[0].should.have.property('name', 'path/to/thingName.name');
    });

    it('name', function() {
      var res = comments.parse('/** @name thingName.name */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'name');
      res[0].tags[0].should.have.property('name', 'thingName.name');
    });

    it('name', function() {
      var res = comments.parse('/** @name thingName#name */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'name');
      res[0].tags[0].should.have.property('name', 'thingName#name');
    });

    it('name', function() {
      var res = comments.parse('/** @name thingName~name */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'name');
      res[0].tags[0].should.have.property('name', 'thingName~name');
    });

    it('name', function() {
      var res = comments.parse('/** @name {thing} thingName.name */', {
        unwrap: true
      });
      // name does not accept type
      res[0].tags.should.have.length(0);
    });

    it('namespace', function() {
      var res = comments.parse('/** @namespace */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'namespace');
    });

    it('namespace with name', function() {
      var res = comments.parse('/** @namespace thingName.name */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'namespace');
      res[0].tags[0].should.have.property('name', 'thingName.name');
    });

    it('namespace with type', function() {
      var res = comments.parse('/** @namespace {Object} thingName.name */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'namespace');
      res[0].tags[0].should.have.property('name', 'thingName.name');
      res[0].tags[0].should.have.property('type');
      res[0].tags[0].type[0].should.eql({
        type: 'NameExpression',
        name: 'Object'
      });
    });

    it('param', function() {
      var res = comments.parse([
        '/**',
        ' * @param {String} userName',
        '*/'
      ].join('\n'), {
        unwrap: true
      });

      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'param');
      res[0].tags[0].should.have.property('name', 'userName');
      res[0].tags[0].should.have.property('type');
      assert.deepEqual(res[0].tags[0].type[0], {
        type: 'NameExpression',
        name: 'String'
      });
    });

    it('param with properties', function() {
      var res = comments.parse([
        '/**',
        ' * @param {String} user.name',
        '*/'
      ].join('\n'), {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'param');
      res[0].tags[0].should.have.property('name', 'user.name');
      res[0].tags[0].should.have.property('type');
      res[0].tags[0].type[0].should.eql({
        type: 'NameExpression',
        name: 'String'
      });
    });

    it('param with properties with description', function() {
      var res = comments.parse([
        '/**',
        ' * @param {String} user.name - hi',
        '*/'
      ].join('\n'), {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'param');
      res[0].tags[0].should.have.property('name', 'user.name');
      res[0].tags[0].should.have.property('description', 'hi');
      res[0].tags[0].should.have.property('type');
      res[0].tags[0].type[0].should.eql({
        type: 'NameExpression',
        name: 'String'
      });
    });

    it('param with array properties with description', function() {
      var res = comments.parse([
        '/**',
        ' * @param {string} employee[].name - hi',
        ' */'
      ].join('\n'), {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'param');
      res[0].tags[0].should.have.property('name', 'employee[].name');
      res[0].tags[0].should.have.property('description', 'hi');
      res[0].tags[0].should.have.property('type');
      res[0].tags[0].type[0].should.eql({
        type: 'NameExpression',
        name: 'string'
      });
    });

    it('param with array properties without description', function() {
      var res = comments.parse([
        '/**',
        ' * @param {string} employee[].name',
        ' */'
      ].join('\n'), {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'param');
      res[0].tags[0].should.have.property('name', 'employee[].name');
      res[0].tags[0].should.have.property('description', null);
      res[0].tags[0].should.have.property('type');
      res[0].tags[0].type[0].should.eql({
        type: 'NameExpression',
        name: 'string'
      });
    });

    it('arg with properties', function() {
      var res = comments.parse([
        '/**',
        ' * @arg {String} user.name',
        '*/'
      ].join('\n'), {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'arg');
      res[0].tags[0].should.have.property('name', 'user.name');
      res[0].tags[0].should.have.property('type');
      res[0].tags[0].type[0].should.eql({
        type: 'NameExpression',
        name: 'String'
      });
    });

    it('argument with properties', function() {
      var res = comments.parse([
        '/**',
        ' * @argument {String} user.name',
        '*/'
      ].join('\n'), {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'argument');
      res[0].tags[0].should.have.property('name', 'user.name');
      res[0].tags[0].should.have.property('type');
      res[0].tags[0].type[0].should.eql({
        type: 'NameExpression',
        name: 'String'
      });
    });

    it('param typeless', function() {
      var res = comments.parse([
        '/**',
        ' * @param something [bye] hi',
        '*/'
      ].join('\n'), {
        unwrap: true,
        sloppy: true
      });

      res[0].tags.should.have.length(1);
      res[0].tags[0].should.eql({
        title: 'param',
        type: undefined,
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
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.eql({
        title: 'param',
        type: null,
        name: 'userName',
        description: null
      });

      res = comments.parse([
        '/**',
        ' * @param userName Something descriptive',
        '*/'
      ].join('\n'), {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
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
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.eql({
        title: 'param',
        type: null,
        name: 'user.name',
        description: 'Something descriptive'
      });
    });

    it('param broken', function() {
      var res = comments.parse([
        '/**',
        ' * @param {String} userName',
        ' * @param {String userName',
        '*/'
      ].join('\n'), {
        unwrap: true
      });

      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'param');
      res[0].tags[0].should.have.property('name', 'userName');
      res[0].tags[0].should.have.property('type');
      res[0].tags[0].type[0].should.eql({
        type: 'NameExpression',
        name: 'String'
      });
    });

    it('param record', function() {
      var res = comments.parse([
        '/**',
        ' * @param {{ok:String}} userName',
        '*/'
      ].join('\n'), {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'param');
      res[0].tags[0].should.have.property('name', 'userName');
      res[0].tags[0].should.have.property('type');
      res[0].tags[0].type[0].should.eql({
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
      var res = comments.parse([
        '/**',
        ' * @param {{ok:String} userName',
        '*/'
      ].join('\n'), {
        unwrap: true
      });
      res[0].tags.should.be.empty;
    });

    it('param multiple lines', function() {
      var res = comments.parse([
        '/**',
        ' * @param {string|',
        ' *     number} userName',
        ' * }}',
        '*/'
      ].join('\n'), {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'param');
      res[0].tags[0].should.have.property('name', 'userName');
      res[0].tags[0].should.have.property('type');
      res[0].tags[0].type[0].should.eql({
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
      var res = comments.parse([
        '/**',
        ' * @param string name description',
        '*/'
      ].join('\n'), {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'param');
      res[0].tags[0].should.have.property('name', 'string');
      res[0].tags[0].should.have.property('type', null);
      res[0].tags[0].should.have.property('description', 'name description');
    });

    it('param w/ hyphen before description', function() {
      var res = comments.parse([
        '/**',
        ' * @param {string} name - description',
        '*/'
      ].join('\n'), {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.eql({
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
      var res = comments.parse([
        '/**',
        ' * @param {string} name -   description',
        '*/'
      ].join('\n'), {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.eql({
        title: 'param',
        type: {
          type: 'NameExpression',
          name: 'string'
        },
        name: 'name',
        description: '  description'
      });
    });

    it('description and param separated by blank line', function() {
      var res = comments.parse([
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
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'param');
      res[0].tags[0].should.have.property('name', 'name');
      res[0].tags[0].should.have.property('type');
      res[0].tags[0].type[0].should.eql({
        type: 'NameExpression',
        name: 'string'
      });
      res[0].tags[0].should.have.property('description', 'description');
    });

    it.skip('regular block comment instead of jsdoc-style block comment', function() {
      var res = comments.parse([
        '/*',
        ' * Description',
        ' * blah blah blah',
        '*/'
      ].join('\n'), {
        unwrap: true
      });

      res[0].description.should.eql('Description\nblah blah blah');
    });

    it('augments', function() {
      var res = comments.parse('/** @augments */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
    });

    it('augments with name', function() {
      var res = comments.parse('/** @augments ClassName */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'augments');
      res[0].tags[0].should.have.property('name', 'ClassName');
    });

    it('augments with type', function() {
      var res = comments.parse('/** @augments {ClassName} */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'augments');
      res[0].tags[0].should.have.property('type', {
        type: 'NameExpression',
        name: 'ClassName'
      });
    });

    it('augments with name', function() {
      var res = comments.parse('/** @augments ClassName.OK */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'augments');
      res[0].tags[0].should.have.property('name', 'ClassName.OK');
    });

    it('extends', function() {
      var res = comments.parse('/** @extends */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
    });

    it('extends with name', function() {
      var res = comments.parse('/** @extends ClassName */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'extends');
      res[0].tags[0].should.have.property('name', 'ClassName');
    });

    it('extends with type', function() {
      var res = comments.parse('/** @extends {ClassName} */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'extends');
      res[0].tags[0].should.have.property('type', {
        type: 'NameExpression',
        name: 'ClassName'
      });
    });

    it('extends with namepath', function() {
      var res = comments.parse('/** @extends ClassName.OK */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'extends');
      res[0].tags[0].should.have.property('name', 'ClassName.OK');
    });

    it('extends with namepath', function() {
      var res = comments.parse('/** @extends module:path/ClassName~OK */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'extends');
      res[0].tags[0].should.have.property('name', 'module:path/ClassName~OK');
    });

    it('prop', function() {
      var res = comments.parse([
        '/**',
        ' * @prop {string} thingName - does some stuff',
        '*/'
      ].join('\n'), {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'prop');
      res[0].tags[0].should.have.property('description', 'does some stuff');
      res[0].tags[0].type[0].should.have.property('name', 'string');
      res[0].tags[0].should.have.property('name', 'thingName');
    });

    it('prop without type', function() {
      var res = comments.parse([
        '/**',
        ' * @prop thingName - does some stuff',
        '*/'
      ].join('\n'), {
        unwrap: true
      });
      res[0].tags.should.have.length(0);
    });

    it('property', function() {
      var res = comments.parse([
        '/**',
        ' * @property {string} thingName - does some stuff',
        '*/'
      ].join('\n'), {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'property');
      res[0].tags[0].should.have.property('description', 'does some stuff');
      res[0].tags[0].type[0].should.have.property('name', 'string');
      res[0].tags[0].should.have.property('name', 'thingName');
    });

    it('property without type', function() {
      var res = comments.parse([
        '/**',
        ' * @property thingName - does some stuff',
        '*/'
      ].join('\n'), {
        unwrap: true
      });

      res[0].tags.should.have.length(0);
    });

    it('property with optional type', function() {
      var res = comments.parse(
        ['/**',
          '* testtypedef',
          '* @typedef {object} abc',
          '* @property {String} [val] value description',
          '*/'
        ].join('\n'), {
          unwrap: true,
          sloppy: true
        });

      res[0].tags[1].should.have.property('title', 'property');
      res[0].tags[1].should.have.property('type');
      res[0].tags[1]['type'].should.have.property('type', 'OptionalType');
    });

    it('property with nested name', function() {
      var res = comments.parse([
        '/**',
        ' * @property {string} thingName.name - does some stuff',
        '*/'
      ].join('\n'), {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'property');
      res[0].tags[0].should.have.property('description', 'does some stuff');
      res[0].tags[0].type[0].should.have.property('name', 'string');
      res[0].tags[0].should.have.property('name', 'thingName.name');
    });

    it('throws', function() {
      var res = comments.parse([
        '/**',
        ' * @throws {Error} if something goes wrong',
        ' */'
      ].join('\n'), {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'throws');
      res[0].tags[0].should.have.property('description', 'if something goes wrong');
      res[0].tags[0].type[0].should.have.property('name', 'Error');
    });

    it('throws without type', function() {
      var res = comments.parse([
        '/**',
        ' * @throws if something goes wrong',
        ' */'
      ].join('\n'), {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'throws');
      res[0].tags[0].should.have.property('description', 'if something goes wrong');
    });

    it('kind', function() {
      var res = comments.parse('/** @kind class */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'kind');
      res[0].tags[0].should.have.property('kind', 'class');
    });

    it('kind error', function() {
      var res = comments.parse('/** @kind ng */', {
        unwrap: true,
        recoverable: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('errors');
      res[0].tags[0].errors.should.have.length(1);
      res[0].tags[0].errors[0].should.equal('Invalid kind name \'ng\'');
    });

    it('todo', function() {
      var res = comments.parse('/** @todo Write the documentation */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'todo');
      res[0].tags[0].should.have.property('description', 'Write the documentation');
    });

    it('typedef', function() {
      var res = comments.parse('/** @typedef {Object} NumberLike */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('type');
      res[0].tags[0].type[0].should.eql({
        type: 'NameExpression',
        name: 'Object'
      });
      res[0].tags[0].should.have.property('name', 'NumberLike');
    });

    it('summary', function() {
      // japanese lang
      var res = comments.parse('/** @summary ゆるゆり3期おめでとー */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'summary');
      res[0].tags[0].should.have.property('description', 'ゆるゆり3期おめでとー');
    });

    it('variation', function() {
      // japanese lang
      var res = comments.parse('/** @variation 42 */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'variation');
      res[0].tags[0].should.have.property('variation', 42);
    });

    it('variation error', function() {
      // japanese lang
      var res = comments.parse('/** @variation Animation */', {
        unwrap: true,
        recoverable: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('errors');
      res[0].tags[0].errors.should.have.length(1);
      res[0].tags[0].errors[0].should.equal('Invalid variation \'Animation\'');
    });

    it('access', function() {
      var res = comments.parse('/** @access public */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'access');
      res[0].tags[0].should.have.property('access', 'public');
    });

    it('access error', function() {
      var res = comments.parse('/** @access ng */', {
        unwrap: true,
        recoverable: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('errors');
      res[0].tags[0].errors.should.have.length(1);
      res[0].tags[0].errors[0].should.equal('Invalid access name \'ng\'');
    });

    it('public', function() {
      var res = comments.parse('/** @public */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'public');
    });

    it('public type and description', function() {
      var res = comments.parse('/** @public {number} ok */', {
        unwrap: true,
        recoverable: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'public');
      res[0].tags[0].should.have.property('description', 'ok');
      res[0].tags[0].should.have.property('type');
      res[0].tags[0].type[0].should.eql({
        type: 'NameExpression',
        name: 'number'
      });
    });

    it('protected', function() {
      var res = comments.parse('/** @protected */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'protected');
    });

    it('protected type and description', function() {
      var res = comments.parse('/** @protected {number} ok */', {
        unwrap: true,
        recoverable: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'protected');
      res[0].tags[0].should.have.property('description', 'ok');
      res[0].tags[0].should.have.property('type');
      res[0].tags[0].type[0].should.eql({
        type: 'NameExpression',
        name: 'number'
      });
    });

    it('private', function() {
      var res = comments.parse('/** @private */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'private');
    });

    it('private type and description', function() {
      var res = comments.parse('/** @private {number} ok */', {
        unwrap: true,
        recoverable: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'private');
      res[0].tags[0].should.have.property('description', 'ok');
      res[0].tags[0].should.have.property('type');
      res[0].tags[0].type[0].should.eql({
        type: 'NameExpression',
        name: 'number'
      });
    });

    it('readonly', function() {
      var res = comments.parse('/** @readonly */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'readonly');
    });

    it('readonly error', function() {
      var res = comments.parse('/** @readonly ng */', {
        unwrap: true,
        recoverable: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('errors');
      res[0].tags[0].errors.should.have.length(1);
      res[0].tags[0].errors[0].should.equal('Unknown content \'ng\'');
    });

    it('requires', function() {
      var res = comments.parse('/** @requires */', {
        unwrap: true
      });
      res[0].tags.should.have.length(0);
    });

    it('requires with module name', function() {
      var res = comments.parse('/** @requires name.path */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'requires');
      res[0].tags[0].should.have.property('name', 'name.path');
    });

    it('global', function() {
      var res = comments.parse('/** @global */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'global');
    });

    it('global error', function() {
      var res = comments.parse('/** @global ng */', {
        unwrap: true,
        recoverable: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('errors');
      res[0].tags[0].errors.should.have.length(1);
      res[0].tags[0].errors[0].should.equal('Unknown content \'ng\'');
    });

    it('inner', function() {
      var res = comments.parse('/** @inner */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'inner');
    });

    it('inner error', function() {
      var res = comments.parse('/** @inner ng */', {
        unwrap: true,
        recoverable: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('errors');
      res[0].tags[0].errors.should.have.length(1);
      res[0].tags[0].errors[0].should.equal('Unknown content \'ng\'');
    });

    it('instance', function() {
      var res = comments.parse('/** @instance */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'instance');
    });

    it('instance error', function() {
      var res = comments.parse('/** @instance ng */', {
        unwrap: true,
        recoverable: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('errors');
      res[0].tags[0].errors.should.have.length(1);
      res[0].tags[0].errors[0].should.equal('Unknown content \'ng\'');
    });

    it('since', function() {
      var res = comments.parse('/** @since 1.2.1 */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'since');
      res[0].tags[0].should.have.property('description', '1.2.1');
    });

    it('static', function() {
      var res = comments.parse('/** @static */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'static');
    });

    it('static error', function() {
      var res = comments.parse('/** @static ng */', {
        unwrap: true,
        recoverable: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('errors');
      res[0].tags[0].errors.should.have.length(1);
      res[0].tags[0].errors[0].should.equal('Unknown content \'ng\'');
    });

    it('this', function() {
      var res = comments.parse([
        '/**',
        ' * @this thingName',
        '*/'
      ].join('\n'), {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'this');
      res[0].tags[0].should.have.property('name', 'thingName');
    });

    it('this with namepath', function() {
      var res = comments.parse([
        '/**',
        ' * @this thingName.name',
        '*/'
      ].join('\n'), {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'this');
      res[0].tags[0].should.have.property('name', 'thingName.name');
    });

    it('this with name expression', function() {
      var res = comments.parse([
        '/**',
        ' * @this {thingName.name}',
        '*/'
      ].join('\n'), {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'this');
      res[0].tags[0].should.have.property('name', 'thingName.name');
    });

    it('this error with type application', function() {
      var res = comments.parse([
        '/**',
        ' * @this {Array<string>}',
        '*/'
      ].join('\n'), {
        unwrap: true,
        recoverable: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'this');
      res[0].tags[0].should.have.property('errors');
      res[0].tags[0].errors.should.have.length(1);
      res[0].tags[0].errors[0].should.equal('Invalid name for this');
    });

    it('this error', function() {
      var res = comments.parse([
        '/**',
        ' * @this',
        '*/'
      ].join('\n'), {
        unwrap: true,
        recoverable: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'this');
      res[0].tags[0].should.have.property('errors');
      res[0].tags[0].errors.should.have.length(1);
      res[0].tags[0].errors[0].should.equal('Missing or invalid tag name');
    });

    it('var', function() {
      var res = comments.parse('/** @var */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'var');
    });

    it('var with name', function() {
      var res = comments.parse('/** @var thingName.name */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'var');
      res[0].tags[0].should.have.property('name', 'thingName.name');
    });

    it('var with type', function() {
      var res = comments.parse('/** @var {Object} thingName.name */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'var');
      res[0].tags[0].should.have.property('name', 'thingName.name');
      res[0].tags[0].should.have.property('type');
      res[0].tags[0].type[0].should.eql({
        type: 'NameExpression',
        name: 'Object'
      });
    });

    it('version', function() {
      var res = comments.parse('/** @version 1.2.1 */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'version');
      res[0].tags[0].should.have.property('description', '1.2.1');
    });

    it('incorrect name', function() {
      var res = comments.parse('/** @name thingName#%name */', {
        unwrap: true
      });
      // name does not accept type
      res[0].tags.should.have.length(0);
      res[0].should.eql({
        'description': '',
        'tags': []
      });
    });

    it('string literal property', function() {
      var res = comments.parse([
        '/**',
        ' * @typedef {Object} comment',
        " * @property {('public'|'protected'|'private')} access",
        '*/'
      ].join('\n'), {
        unwrap: true
      });

      res[0].tags.should.have.length(2);
      res[0].tags[1].should.have.property('title', 'property');
      res[0].tags[1].should.have.property('name', 'access');
      res[0].tags[1].type.should.have.property('type', 'UnionType');
      res[0].tags[1].type.elements.should.have.length(3);
      res[0].tags[1].type.elements.should.containEql({
        type: 'StringLiteralType',
        value: 'public'
      });
      res[0].tags[1].type.elements.should.containEql({
        type: 'StringLiteralType',
        value: 'private'
      });
      res[0].tags[1].type.elements.should.containEql({
        type: 'StringLiteralType',
        value: 'protected'
      });
    });

    it('numeric literal property', function() {
      var res = comments.parse([
        '/**',
        ' * @typedef {Object} comment',
        ' * @property {(-42|1.5|0)} access',
        '*/'
      ].join('\n'), {
        unwrap: true
      });

      res[0].tags.should.have.length(2);
      res[0].tags[1].should.have.property('title', 'property');
      res[0].tags[1].should.have.property('name', 'access');
      res[0].tags[1].type.should.have.property('type', 'UnionType');
      res[0].tags[1].type.elements.should.have.length(3);
      res[0].tags[1].type.elements.should.containEql({
        type: 'NumericLiteralType',
        value: -42
      });
      res[0].tags[1].type.elements.should.containEql({
        type: 'NumericLiteralType',
        value: 1.5
      });
      res[0].tags[1].type.elements.should.containEql({
        type: 'NumericLiteralType',
        value: 0
      });
    });

    it('boolean literal property', function() {
      // var res = comments.parse([
      //   '/**',
      //   ' * @typedef {Object} comment',
      //   ' * @property {(true|false)} access',
      //   '*/'
      // ].join('\n'), {
      //   unwrap: true
      // });

      var fixture = [
        '/**',
        ' * @typedef {Object} comment',
        ' * @property {(true|false)} access',
        '*/'
      ].join('\n');

      var res = comments.parse(fixture, {unwrap: true});
      // var res2 = [doctrine.parse(fixture, {unwrap: true})];

      // console.log(res2[0].tags[0].type)
      // console.log('---')
      console.log(res[0].tags[0].type);

      // res[0].tags.should.have.length(2);
      res[0].tags[1].should.have.property('title', 'property');
      res[0].tags[1].should.have.property('name', 'access');
      res[0].tags[1].type.should.have.property('type', 'UnionType');
      res[0].tags[1].type.elements.should.have.length(2);
      res[0].tags[1].type.elements.should.containEql({
        type: 'BooleanLiteralType',
        value: true
      });
      res[0].tags[1].type.elements.should.containEql({
        type: 'BooleanLiteralType',
        value: false
      });
    });

    it('complex union with literal types', function() {
      var fixture = [
        '/**',
        ' * @typedef {({ok: true, data: string} | {ok: false, error: Error})} Result',
        '*/'
      ].join('\n');

      var res = comments.parse(fixture, {unwrap: true});
      var res2 = [doctrine.parse(fixture, {unwrap: true})];

      console.log(res2[0].tags[0].type.elements);
      console.log('---');
      console.log(res[0].tags[0].type);

      res[0].tags.should.have.length(1);
      // res[0].tags[0].should.have.property('title', 'typedef');
      // res[0].tags[0].should.have.property('name', 'Result');
      // console.log(res[0].tags[0].type[0])
      // res[0].tags[0].type[0].should.have.property('type', 'UnionType');
      // res[0].tags[0].type[0].elements.should.have.length(2);

      // var e0 = res[0].tags[0].type[0].elements[0];
      // e0.should.have.property('type', 'RecordType');
      // e0.fields.should.have.length(2);
      // e0.fields.should.containEql({
      //   type: 'FieldType',
      //   key: 'ok',
      //   value: {
      //     type: 'BooleanLiteralType',
      //     value: true
      //   }
      // });
      // e0.fields.should.containEql({
      //   type: 'FieldType',
      //   key: 'data',
      //   value: {
      //     type: 'NameExpression',
      //     name: 'string'
      //   }
      // });

      // var e1 = res[0].tags[0].type[0].elements[1];
      // e1.should.have.property('type', 'RecordType');
      // e1.fields.should.have.length(2);
      // e1.fields.should.containEql({
      //   type: 'FieldType',
      //   key: 'ok',
      //   value: {
      //     type: 'BooleanLiteralType',
      //     value: false
      //   }
      // });
      // e1.fields.should.containEql({
      //   type: 'FieldType',
      //   key: 'error',
      //   value: {
      //     type: 'NameExpression',
      //     name: 'Error'
      //   }
      // });
    });
  });
});