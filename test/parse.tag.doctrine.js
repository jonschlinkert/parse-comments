'use strict';

require('mocha');
require('should');
var fs = require('fs');
var path = require('path');
var doctrine = require('doctrine');
var Comments = require('..');
var comments;

describe('doctrine tests', function() {
  beforeEach(function() {
    comments = new Comments({
      parsers: {
        tag: function(str, options) {
          var comment = doctrine.parse(str, options);
          if (comment.tags && comment.tags.length) {
            return comment.tags[0];
          }
        }
      }
    });
  });

  describe('parse', function() {
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

    it('alias with namepath', function() {
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
      var res = comments.parse('/** @const {String} constname */', {
        unwrap: true
      });
      res[0].tags.should.have.length(1);
      res[0].tags[0].should.have.property('title', 'const');
      res[0].tags[0].should.have.property('name', 'constname');
      res[0].tags[0].should.have.property('type');
      res[0].tags[0].type.should.eql({
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
      res[0].tags[0].type.should.eql({
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
      res[0].tags[0].type.should.eql({
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
      res[0].tags[0].type.should.eql({
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
      res[0].tags[0].type.should.eql({
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
      res[0].tags[0].type.should.eql({
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
      res[0].tags[0].type.should.eql({
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
      res[0].tags[0].type.should.eql({
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
      res[0].tags[0].type.should.eql({
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
      res[0].tags[0].type.should.eql({
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
      res[0].tags[0].type.should.eql({
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
      res[0].tags[0].type.should.eql({
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
      res[0].tags[0].type.should.eql({
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
      res[0].tags[0].type.should.eql({
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
      res[0].tags[0].type.should.eql({
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
      res[0].tags[0].type.should.eql({
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
      res[0].tags[0].type.should.eql({
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

      var res = comments.parse([
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

      var res = comments.parse([
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

      var res = comments.parse([
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
      res[0].tags[0].type.should.eql({
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
      res[0].tags[0].type.should.eql({
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
      res[0].tags[0].type.should.eql({
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
      res[0].tags[0].type.should.eql({
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
      res[0].tags[0].type.should.have.property('name', 'string');
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
      res[0].tags[0].type.should.have.property('name', 'string');
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
      res[0].tags[0].type.should.have.property('name', 'string');
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
      res[0].tags[0].type.should.have.property('name', 'Error');
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
      res[0].tags[0].type.should.eql({
        type: 'NameExpression',
        name: 'Object'
      });
      res[0].tags[0].should.have.property('name', 'NumberLike');
    });

  //   it('summary', function() {
  //     // japanese lang
  //     var res = comments.parse('/** @summary ゆるゆり3期おめでとー */', {
  //       unwrap: true
  //     });
  //     res[0].tags.should.have.length(1);
  //     res[0].tags[0].should.have.property('title', 'summary');
  //     res[0].tags[0].should.have.property('description', 'ゆるゆり3期おめでとー');
  //   });

  //   it('variation', function() {
  //     // japanese lang
  //     var res = comments.parse('/** @variation 42 */', {
  //       unwrap: true
  //     });
  //     res[0].tags.should.have.length(1);
  //     res[0].tags[0].should.have.property('title', 'variation');
  //     res[0].tags[0].should.have.property('variation', 42);
  //   });

  //   it('variation error', function() {
  //     // japanese lang
  //     var res = comments.parse('/** @variation Animation */', {
  //       unwrap: true,
  //       recoverable: true
  //     });
  //     res[0].tags.should.have.length(1);
  //     res[0].tags[0].should.have.property('errors');
  //     res[0].tags[0].errors.should.have.length(1);
  //     res[0].tags[0].errors[0].should.equal('Invalid variation \'Animation\'');
  //   });

  //   it('access', function() {
  //     var res = comments.parse('/** @access public */', {
  //       unwrap: true
  //     });
  //     res[0].tags.should.have.length(1);
  //     res[0].tags[0].should.have.property('title', 'access');
  //     res[0].tags[0].should.have.property('access', 'public');
  //   });

  //   it('access error', function() {
  //     var res = comments.parse('/** @access ng */', {
  //       unwrap: true,
  //       recoverable: true
  //     });
  //     res[0].tags.should.have.length(1);
  //     res[0].tags[0].should.have.property('errors');
  //     res[0].tags[0].errors.should.have.length(1);
  //     res[0].tags[0].errors[0].should.equal('Invalid access name \'ng\'');
  //   });

  //   it('public', function() {
  //     var res = comments.parse('/** @public */', {
  //       unwrap: true
  //     });
  //     res[0].tags.should.have.length(1);
  //     res[0].tags[0].should.have.property('title', 'public');
  //   });

  //   it('public type and description', function() {
  //     var res = comments.parse('/** @public {number} ok */', {
  //       unwrap: true,
  //       recoverable: true
  //     });
  //     res[0].tags.should.have.length(1);
  //     res[0].tags[0].should.have.property('title', 'public');
  //     res[0].tags[0].should.have.property('description', 'ok');
  //     res[0].tags[0].should.have.property('type');
  //     res[0].tags[0].type.should.eql({
  //       type: 'NameExpression',
  //       name: 'number'
  //     });
  //   });

  //   it('protected', function() {
  //     var res = comments.parse('/** @protected */', {
  //       unwrap: true
  //     });
  //     res[0].tags.should.have.length(1);
  //     res[0].tags[0].should.have.property('title', 'protected');
  //   });

  //   it('protected type and description', function() {
  //     var res = comments.parse('/** @protected {number} ok */', {
  //       unwrap: true,
  //       recoverable: true
  //     });
  //     res[0].tags.should.have.length(1);
  //     res[0].tags[0].should.have.property('title', 'protected');
  //     res[0].tags[0].should.have.property('description', 'ok');
  //     res[0].tags[0].should.have.property('type');
  //     res[0].tags[0].type.should.eql({
  //       type: 'NameExpression',
  //       name: 'number'
  //     });
  //   });

  //   it('private', function() {
  //     var res = comments.parse('/** @private */', {
  //       unwrap: true
  //     });
  //     res[0].tags.should.have.length(1);
  //     res[0].tags[0].should.have.property('title', 'private');
  //   });

  //   it('private type and description', function() {
  //     var res = comments.parse('/** @private {number} ok */', {
  //       unwrap: true,
  //       recoverable: true
  //     });
  //     res[0].tags.should.have.length(1);
  //     res[0].tags[0].should.have.property('title', 'private');
  //     res[0].tags[0].should.have.property('description', 'ok');
  //     res[0].tags[0].should.have.property('type');
  //     res[0].tags[0].type.should.eql({
  //       type: 'NameExpression',
  //       name: 'number'
  //     });
  //   });

  //   it('readonly', function() {
  //     var res = comments.parse('/** @readonly */', {
  //       unwrap: true
  //     });
  //     res[0].tags.should.have.length(1);
  //     res[0].tags[0].should.have.property('title', 'readonly');
  //   });

  //   it('readonly error', function() {
  //     var res = comments.parse('/** @readonly ng */', {
  //       unwrap: true,
  //       recoverable: true
  //     });
  //     res[0].tags.should.have.length(1);
  //     res[0].tags[0].should.have.property('errors');
  //     res[0].tags[0].errors.should.have.length(1);
  //     res[0].tags[0].errors[0].should.equal('Unknown content \'ng\'');
  //   });

  //   it('requires', function() {
  //     var res = comments.parse('/** @requires */', {
  //       unwrap: true
  //     });
  //     res[0].tags.should.have.length(0);
  //   });

  //   it('requires with module name', function() {
  //     var res = comments.parse('/** @requires name.path */', {
  //       unwrap: true
  //     });
  //     res[0].tags.should.have.length(1);
  //     res[0].tags[0].should.have.property('title', 'requires');
  //     res[0].tags[0].should.have.property('name', 'name.path');
  //   });

  //   it('global', function() {
  //     var res = comments.parse('/** @global */', {
  //       unwrap: true
  //     });
  //     res[0].tags.should.have.length(1);
  //     res[0].tags[0].should.have.property('title', 'global');
  //   });

  //   it('global error', function() {
  //     var res = comments.parse('/** @global ng */', {
  //       unwrap: true,
  //       recoverable: true
  //     });
  //     res[0].tags.should.have.length(1);
  //     res[0].tags[0].should.have.property('errors');
  //     res[0].tags[0].errors.should.have.length(1);
  //     res[0].tags[0].errors[0].should.equal('Unknown content \'ng\'');
  //   });

  //   it('inner', function() {
  //     var res = comments.parse('/** @inner */', {
  //       unwrap: true
  //     });
  //     res[0].tags.should.have.length(1);
  //     res[0].tags[0].should.have.property('title', 'inner');
  //   });

  //   it('inner error', function() {
  //     var res = comments.parse('/** @inner ng */', {
  //       unwrap: true,
  //       recoverable: true
  //     });
  //     res[0].tags.should.have.length(1);
  //     res[0].tags[0].should.have.property('errors');
  //     res[0].tags[0].errors.should.have.length(1);
  //     res[0].tags[0].errors[0].should.equal('Unknown content \'ng\'');
  //   });

  //   it('instance', function() {
  //     var res = comments.parse('/** @instance */', {
  //       unwrap: true
  //     });
  //     res[0].tags.should.have.length(1);
  //     res[0].tags[0].should.have.property('title', 'instance');
  //   });

  //   it('instance error', function() {
  //     var res = comments.parse('/** @instance ng */', {
  //       unwrap: true,
  //       recoverable: true
  //     });
  //     res[0].tags.should.have.length(1);
  //     res[0].tags[0].should.have.property('errors');
  //     res[0].tags[0].errors.should.have.length(1);
  //     res[0].tags[0].errors[0].should.equal('Unknown content \'ng\'');
  //   });

  //   it('since', function() {
  //     var res = comments.parse('/** @since 1.2.1 */', {
  //       unwrap: true
  //     });
  //     res[0].tags.should.have.length(1);
  //     res[0].tags[0].should.have.property('title', 'since');
  //     res[0].tags[0].should.have.property('description', '1.2.1');
  //   });

  //   it('static', function() {
  //     var res = comments.parse('/** @static */', {
  //       unwrap: true
  //     });
  //     res[0].tags.should.have.length(1);
  //     res[0].tags[0].should.have.property('title', 'static');
  //   });

  //   it('static error', function() {
  //     var res = comments.parse('/** @static ng */', {
  //       unwrap: true,
  //       recoverable: true
  //     });
  //     res[0].tags.should.have.length(1);
  //     res[0].tags[0].should.have.property('errors');
  //     res[0].tags[0].errors.should.have.length(1);
  //     res[0].tags[0].errors[0].should.equal('Unknown content \'ng\'');
  //   });

  //   it('this', function() {
  //     var res = comments.parse([
  //       '/**',
  //       ' * @this thingName',
  //       '*/'
  //     ].join('\n'), {
  //       unwrap: true
  //     });
  //     res[0].tags.should.have.length(1);
  //     res[0].tags[0].should.have.property('title', 'this');
  //     res[0].tags[0].should.have.property('name', 'thingName');
  //   });

  //   it('this with namepath', function() {
  //     var res = comments.parse([
  //       '/**',
  //       ' * @this thingName.name',
  //       '*/'
  //     ].join('\n'), {
  //       unwrap: true
  //     });
  //     res[0].tags.should.have.length(1);
  //     res[0].tags[0].should.have.property('title', 'this');
  //     res[0].tags[0].should.have.property('name', 'thingName.name');
  //   });

  //   it('this with name expression', function() {
  //     var res = comments.parse([
  //       '/**',
  //       ' * @this {thingName.name}',
  //       '*/'
  //     ].join('\n'), {
  //       unwrap: true
  //     });
  //     res[0].tags.should.have.length(1);
  //     res[0].tags[0].should.have.property('title', 'this');
  //     res[0].tags[0].should.have.property('name', 'thingName.name');
  //   });

  //   it('this error with type application', function() {
  //     var res = comments.parse([
  //       '/**',
  //       ' * @this {Array<string>}',
  //       '*/'
  //     ].join('\n'), {
  //       unwrap: true,
  //       recoverable: true
  //     });
  //     res[0].tags.should.have.length(1);
  //     res[0].tags[0].should.have.property('title', 'this');
  //     res[0].tags[0].should.have.property('errors');
  //     res[0].tags[0].errors.should.have.length(1);
  //     res[0].tags[0].errors[0].should.equal('Invalid name for this');
  //   });

  //   it('this error', function() {
  //     var res = comments.parse([
  //       '/**',
  //       ' * @this',
  //       '*/'
  //     ].join('\n'), {
  //       unwrap: true,
  //       recoverable: true
  //     });
  //     res[0].tags.should.have.length(1);
  //     res[0].tags[0].should.have.property('title', 'this');
  //     res[0].tags[0].should.have.property('errors');
  //     res[0].tags[0].errors.should.have.length(1);
  //     res[0].tags[0].errors[0].should.equal('Missing or invalid tag name');
  //   });

  //   it('var', function() {
  //     var res = comments.parse('/** @var */', {
  //       unwrap: true
  //     });
  //     res[0].tags.should.have.length(1);
  //     res[0].tags[0].should.have.property('title', 'var');
  //   });

  //   it('var with name', function() {
  //     var res = comments.parse('/** @var thingName.name */', {
  //       unwrap: true
  //     });
  //     res[0].tags.should.have.length(1);
  //     res[0].tags[0].should.have.property('title', 'var');
  //     res[0].tags[0].should.have.property('name', 'thingName.name');
  //   });

  //   it('var with type', function() {
  //     var res = comments.parse('/** @var {Object} thingName.name */', {
  //       unwrap: true
  //     });
  //     res[0].tags.should.have.length(1);
  //     res[0].tags[0].should.have.property('title', 'var');
  //     res[0].tags[0].should.have.property('name', 'thingName.name');
  //     res[0].tags[0].should.have.property('type');
  //     res[0].tags[0].type.should.eql({
  //       type: 'NameExpression',
  //       name: 'Object'
  //     });
  //   });

  //   it('version', function() {
  //     var res = comments.parse('/** @version 1.2.1 */', {
  //       unwrap: true
  //     });
  //     res[0].tags.should.have.length(1);
  //     res[0].tags[0].should.have.property('title', 'version');
  //     res[0].tags[0].should.have.property('description', '1.2.1');
  //   });

  //   it('incorrect name', function() {
  //     var res = comments.parse('/** @name thingName#%name */', {
  //       unwrap: true
  //     });
  //     // name does not accept type
  //     res[0].tags.should.have.length(0);
  //     res[0].should.eql({
  //       'description': '',
  //       'tags': []
  //     });
  //   });

  //   it('string literal property', function() {
  //     var res = comments.parse([
  //       '/**',
  //       ' * @typedef {Object} comment',
  //       " * @property {('public'|'protected'|'private')} access",
  //       '*/'
  //     ].join('\n'), {
  //       unwrap: true
  //     });

  //     res[0].tags.should.have.length(2);
  //     res[0].tags[1].should.have.property('title', 'property');
  //     res[0].tags[1].should.have.property('name', 'access');
  //     res[0].tags[1].type.should.have.property('type', 'UnionType');
  //     res[0].tags[1].type.elements.should.have.length(3);
  //     res[0].tags[1].type.elements.should.containEql({
  //       type: 'StringLiteralType',
  //       value: 'public'
  //     });
  //     res[0].tags[1].type.elements.should.containEql({
  //       type: 'StringLiteralType',
  //       value: 'private'
  //     });
  //     res[0].tags[1].type.elements.should.containEql({
  //       type: 'StringLiteralType',
  //       value: 'protected'
  //     });
  //   });

  //   it('numeric literal property', function() {
  //     var res = comments.parse([
  //       '/**',
  //       ' * @typedef {Object} comment',
  //       ' * @property {(-42|1.5|0)} access',
  //       '*/'
  //     ].join('\n'), {
  //       unwrap: true
  //     });

  //     res[0].tags.should.have.length(2);
  //     res[0].tags[1].should.have.property('title', 'property');
  //     res[0].tags[1].should.have.property('name', 'access');
  //     res[0].tags[1].type.should.have.property('type', 'UnionType');
  //     res[0].tags[1].type.elements.should.have.length(3);
  //     res[0].tags[1].type.elements.should.containEql({
  //       type: 'NumericLiteralType',
  //       value: -42
  //     });
  //     res[0].tags[1].type.elements.should.containEql({
  //       type: 'NumericLiteralType',
  //       value: 1.5
  //     });
  //     res[0].tags[1].type.elements.should.containEql({
  //       type: 'NumericLiteralType',
  //       value: 0
  //     });
  //   });

  //   it('boolean literal property', function() {
  //     var res = comments.parse([
  //       '/**',
  //       ' * @typedef {Object} comment',
  //       ' * @property {(true|false)} access',
  //       '*/'
  //     ].join('\n'), {
  //       unwrap: true
  //     });

  //     res[0].tags.should.have.length(2);
  //     res[0].tags[1].should.have.property('title', 'property');
  //     res[0].tags[1].should.have.property('name', 'access');
  //     res[0].tags[1].type.should.have.property('type', 'UnionType');
  //     res[0].tags[1].type.elements.should.have.length(2);
  //     res[0].tags[1].type.elements.should.containEql({
  //       type: 'BooleanLiteralType',
  //       value: true
  //     });
  //     res[0].tags[1].type.elements.should.containEql({
  //       type: 'BooleanLiteralType',
  //       value: false
  //     });
  //   });

  //   it('complex union with literal types', function() {
  //     var res = comments.parse([
  //       '/**',
  //       ' * @typedef {({ok: true, data: string} | {ok: false, error: Error})} Result',
  //       '*/'
  //     ].join('\n'), {
  //       unwrap: true
  //     });

  //     res[0].tags.should.have.length(1);
  //     res[0].tags[0].should.have.property('title', 'typedef');
  //     res[0].tags[0].should.have.property('name', 'Result');
  //     res[0].tags[0].type.should.have.property('type', 'UnionType');
  //     res[0].tags[0].type.elements.should.have.length(2);

  //     var e0 = res[0].tags[0].type.elements[0];
  //     e0.should.have.property('type', 'RecordType');
  //     e0.fields.should.have.length(2);
  //     e0.fields.should.containEql({
  //       type: 'FieldType',
  //       key: 'ok',
  //       value: {
  //         type: 'BooleanLiteralType',
  //         value: true
  //       }
  //     });
  //     e0.fields.should.containEql({
  //       type: 'FieldType',
  //       key: 'data',
  //       value: {
  //         type: 'NameExpression',
  //         name: 'string'
  //       }
  //     });

  //     var e1 = res[0].tags[0].type.elements[1];
  //     e1.should.have.property('type', 'RecordType');
  //     e1.fields.should.have.length(2);
  //     e1.fields.should.containEql({
  //       type: 'FieldType',
  //       key: 'ok',
  //       value: {
  //         type: 'BooleanLiteralType',
  //         value: false
  //       }
  //     });
  //     e1.fields.should.containEql({
  //       type: 'FieldType',
  //       key: 'error',
  //       value: {
  //         type: 'NameExpression',
  //         name: 'Error'
  //       }
  //     });
  //   }); });
  // describe('parseType', function() {
  //   it('union type closure-compiler extended', function() {
  //     var type = comments.parseType('string|number');
  //     type.should.eql({
  //       type: 'UnionType',
  //       elements: [{
  //         type: 'NameExpression',
  //         name: 'string'
  //       }, {
  //         type: 'NameExpression',
  //         name: 'number'
  //       }]
  //     });
  //   });

  //   it('empty union type', function() {
  //     var type = comments.parseType('()');
  //     type.should.eql({
  //       type: 'UnionType',
  //       elements: []
  //     });
  //   });

  //   it('comma last array type', function() {
  //     var type = comments.parseType('[string,]');
  //     type.should.eql({
  //       type: 'ArrayType',
  //       elements: [{
  //         type: 'NameExpression',
  //         name: 'string'
  //       }]
  //     });
  //   });

  //   it('array type of all literal', function() {
  //     var type = comments.parseType('[*]');
  //     type.should.eql({
  //       type: 'ArrayType',
  //       elements: [{
  //         type: 'AllLiteral'
  //       }]
  //     });
  //   });

  //   it('array type of nullable literal', function() {
  //     var type = comments.parseType('[?]');
  //     type.should.eql({
  //       type: 'ArrayType',
  //       elements: [{
  //         type: 'NullableLiteral'
  //       }]
  //     });
  //   });

  //   it('comma last record type', function() {
  //     var type = comments.parseType('{,}');
  //     type.should.eql({
  //       type: 'RecordType',
  //       fields: []
  //     });
  //   });

  //   it('type application', function() {
  //     var type = comments.parseType('Array.<String>');
  //     type.should.eql({
  //       type: 'TypeApplication',
  //       expression: {
  //         type: 'NameExpression',
  //         name: 'Array'
  //       },
  //       applications: [{
  //         type: 'NameExpression',
  //         name: 'String'
  //       }]
  //     });
  //   });

  //   it('type application with NullableLiteral', function() {
  //     var type = comments.parseType('Array<?>');
  //     type.should.eql({
  //       type: 'TypeApplication',
  //       expression: {
  //         type: 'NameExpression',
  //         name: 'Array'
  //       },
  //       applications: [{
  //         type: 'NullableLiteral'
  //       }]
  //     });
  //   });

  //   it('type application with multiple patterns', function() {
  //     var type = comments.parseType('Array.<String, Number>');
  //     type.should.eql({
  //       type: 'TypeApplication',
  //       expression: {
  //         type: 'NameExpression',
  //         name: 'Array'
  //       },
  //       applications: [{
  //         type: 'NameExpression',
  //         name: 'String'
  //       }, {
  //         type: 'NameExpression',
  //         name: 'Number'
  //       }]
  //     });
  //   });

  //   it('type application without dot', function() {
  //     var type = comments.parseType('Array<String>');
  //     type.should.eql({
  //       type: 'TypeApplication',
  //       expression: {
  //         type: 'NameExpression',
  //         name: 'Array'
  //       },
  //       applications: [{
  //         type: 'NameExpression',
  //         name: 'String'
  //       }]
  //     });
  //   });

  //   it('array-style type application', function() {
  //     var type = comments.parseType('String[]');
  //     type.should.eql({
  //       type: 'TypeApplication',
  //       expression: {
  //         type: 'NameExpression',
  //         name: 'Array'
  //       },
  //       applications: [{
  //         type: 'NameExpression',
  //         name: 'String'
  //       }]
  //     });
  //   });

  //   it('function type simple', function() {
  //     var type = comments.parseType('function()');
  //     type.should.eql({
  //       'type': 'FunctionType',
  //       'params': [],
  //       'result': null
  //     });
  //   });

  //   it('function type with name', function() {
  //     var type = comments.parseType('function(a)');
  //     type.should.eql({
  //       'type': 'FunctionType',
  //       'params': [{
  //         'type': 'NameExpression',
  //         'name': 'a'
  //       }],
  //       'result': null
  //     });
  //   });
  //   it('function type with name and type', function() {
  //     var type = comments.parseType('function(a:b)');
  //     type.should.eql({
  //       'type': 'FunctionType',
  //       'params': [{
  //         'type': 'ParameterType',
  //         'name': 'a',
  //         'expression': {
  //           'type': 'NameExpression',
  //           'name': 'b'
  //         }
  //       }],
  //       'result': null
  //     });
  //   });
  //   it('function type with optional param', function() {
  //     var type = comments.parseType('function(a=)');
  //     type.should.eql({
  //       'type': 'FunctionType',
  //       'params': [{
  //         'type': 'OptionalType',
  //         'expression': {
  //           'type': 'NameExpression',
  //           'name': 'a'
  //         }
  //       }],
  //       'result': null
  //     });
  //   });
  //   it('function type with optional param name and type', function() {
  //     var type = comments.parseType('function(a:b=)');
  //     type.should.eql({
  //       'type': 'FunctionType',
  //       'params': [{
  //         'type': 'OptionalType',
  //         'expression': {
  //           'type': 'ParameterType',
  //           'name': 'a',
  //           'expression': {
  //             'type': 'NameExpression',
  //             'name': 'b'
  //           }
  //         }
  //       }],
  //       'result': null
  //     });
  //   });
  //   it('function type with rest param', function() {
  //     var type = comments.parseType('function(...a)');
  //     type.should.eql({
  //       'type': 'FunctionType',
  //       'params': [{
  //         'type': 'RestType',
  //         'expression': {
  //           'type': 'NameExpression',
  //           'name': 'a'
  //         }
  //       }],
  //       'result': null
  //     });
  //   });
  //   it('function type with rest param name and type', function() {
  //     var type = comments.parseType('function(...a:b)');
  //     type.should.eql({
  //       'type': 'FunctionType',
  //       'params': [{
  //         'type': 'RestType',
  //         'expression': {
  //           'type': 'ParameterType',
  //           'name': 'a',
  //           'expression': {
  //             'type': 'NameExpression',
  //             'name': 'b'
  //           }
  //         }
  //       }],
  //       'result': null
  //     });
  //   });

  //   it('function type with optional rest param', function() {
  //     var type = comments.parseType('function(...a=)');
  //     type.should.eql({
  //       'type': 'FunctionType',
  //       'params': [{
  //         'type': 'RestType',
  //         'expression': {
  //           'type': 'OptionalType',
  //           'expression': {
  //             'type': 'NameExpression',
  //             'name': 'a'
  //           }
  //         }
  //       }],
  //       'result': null
  //     });
  //   });
  //   it('function type with optional rest param name and type', function() {
  //     var type = comments.parseType('function(...a:b=)');
  //     type.should.eql({
  //       'type': 'FunctionType',
  //       'params': [{
  //         'type': 'RestType',
  //         'expression': {
  //           'type': 'OptionalType',
  //           'expression': {
  //             'type': 'ParameterType',
  //             'name': 'a',
  //             'expression': {
  //               'type': 'NameExpression',
  //               'name': 'b'
  //             }
  //           }
  //         }
  //       }],
  //       'result': null
  //     });
  //   });

  //   it('string value in type', function() {
  //     var type;

  //     type = comments.parseType("{'ok':String}");
  //     type.should.eql({
  //       'fields': [{
  //         'key': 'ok',
  //         'type': 'FieldType',
  //         'value': {
  //           'name': 'String',
  //           'type': 'NameExpression'
  //         }
  //       }],
  //       'type': 'RecordType'
  //     });

  //     type = comments.parseType('{"\\r\\n\\t\\u2028\\x20\\u20\\b\\f\\v\\\r\n\\\n\\0\\07\\012\\o":String}');
  //     type.should.eql({
  //       'fields': [{
  //         'key': '\r\n\t\u2028\x20u20\b\f\v\0\u0007\u000ao',
  //         'type': 'FieldType',
  //         'value': {
  //           'name': 'String',
  //           'type': 'NameExpression'
  //         }
  //       }],
  //       'type': 'RecordType'
  //     });

  //     comments.parseType.bind(comments, "{'ok\":String}").should.throw('unexpected quote');
  //     comments.parseType.bind(comments, "{'o\n':String}").should.throw('unexpected quote');
  //   });

  //   it('number value in type', function() {
  //     var type;

  //     type = comments.parseType('{20:String}');
  //     type.should.eql({
  //       'fields': [{
  //         'key': '20',
  //         'type': 'FieldType',
  //         'value': {
  //           'name': 'String',
  //           'type': 'NameExpression'
  //         }
  //       }],
  //       'type': 'RecordType'
  //     });

  //     type = comments.parseType('{.2:String, 30:Number, 0x20:String}');
  //     type.should.eql({
  //       'fields': [{
  //         'key': '0.2',
  //         'type': 'FieldType',
  //         'value': {
  //           'name': 'String',
  //           'type': 'NameExpression'
  //         }
  //       }, {
  //         'key': '30',
  //         'type': 'FieldType',
  //         'value': {
  //           'name': 'Number',
  //           'type': 'NameExpression'
  //         }
  //       }, {
  //         'key': '32',
  //         'type': 'FieldType',
  //         'value': {
  //           'name': 'String',
  //           'type': 'NameExpression'
  //         }
  //       }],
  //       'type': 'RecordType'
  //     });

  //     type = comments.parseType('{0X2:String, 0:Number, 100e200:String, 10e-20:Number}');
  //     type.should.eql({
  //       'fields': [{
  //         'key': '2',
  //         'type': 'FieldType',
  //         'value': {
  //           'name': 'String',
  //           'type': 'NameExpression'
  //         }
  //       }, {
  //         'key': '0',
  //         'type': 'FieldType',
  //         'value': {
  //           'name': 'Number',
  //           'type': 'NameExpression'
  //         }
  //       }, {
  //         'key': '1e+202',
  //         'type': 'FieldType',
  //         'value': {
  //           'name': 'String',
  //           'type': 'NameExpression'
  //         }
  //       }, {
  //         'key': '1e-19',
  //         'type': 'FieldType',
  //         'value': {
  //           'name': 'Number',
  //           'type': 'NameExpression'
  //         }
  //       }],
  //       'type': 'RecordType'
  //     });

  //     comments.parseType.bind(comments, '{0x:String}').should.throw('unexpected token');
  //     comments.parseType.bind(comments, '{0x').should.throw('unexpected token');
  //     comments.parseType.bind(comments, '{0xd').should.throw('unexpected token');
  //     comments.parseType.bind(comments, '{0x2_:').should.throw('unexpected token');
  //     comments.parseType.bind(comments, '{021:').should.throw('unexpected token');
  //     comments.parseType.bind(comments, '{021_:').should.throw('unexpected token');
  //     comments.parseType.bind(comments, '{021').should.throw('unexpected token');
  //     comments.parseType.bind(comments, '{08').should.throw('unexpected token');
  //     comments.parseType.bind(comments, '{0y').should.throw('unexpected token');
  //     comments.parseType.bind(comments, '{0').should.throw('unexpected token');
  //     comments.parseType.bind(comments, '{100e2').should.throw('unexpected token');
  //     comments.parseType.bind(comments, '{100e-2').should.throw('unexpected token');
  //     comments.parseType.bind(comments, '{100e-200:').should.throw('unexpected token');
  //     comments.parseType.bind(comments, '{100e:').should.throw('unexpected token');
  //     comments.parseType.bind(comments, 'function(number=, string)').should.throw('not reach to EOF');
  //   });

  //   it('dotted type', function() {
  //     var type;
  //     type = comments.parseType('Cocoa.Cappuccino');
  //     type.should.eql({
  //       'name': 'Cocoa.Cappuccino',
  //       'type': 'NameExpression'
  //     });
  //   });

  //   it('rest array type', function() {
  //     var type;
  //     type = comments.parseType('[string,...string]');
  //     type.should.eql({
  //       'elements': [{
  //         'name': 'string',
  //         'type': 'NameExpression'
  //       }, {
  //         'expression': {
  //           'name': 'string',
  //           'type': 'NameExpression'
  //         },
  //         'type': 'RestType'
  //       }],
  //       'type': 'ArrayType'
  //     });
  //   });

  //   it('nullable type', function() {
  //     var type;
  //     type = comments.parseType('string?');
  //     type.should.eql({
  //       'expression': {
  //         'name': 'string',
  //         'type': 'NameExpression'
  //       },
  //       'prefix': false,
  //       'type': 'NullableType'
  //     });
  //   });

  //   it('non-nullable type', function() {
  //     var type;
  //     type = comments.parseType('string!');
  //     type.should.eql({
  //       'expression': {
  //         'name': 'string',
  //         'type': 'NameExpression'
  //       },
  //       'prefix': false,
  //       'type': 'NonNullableType'
  //     });
  //   });

  //   it('toplevel multiple pipe type', function() {
  //     var type;
  //     type = comments.parseType('string|number|Test');
  //     type.should.eql({
  //       'elements': [{
  //         'name': 'string',
  //         'type': 'NameExpression'
  //       }, {
  //         'name': 'number',
  //         'type': 'NameExpression'
  //       }, {
  //         'name': 'Test',
  //         'type': 'NameExpression'
  //       }],
  //       'type': 'UnionType'
  //     });
  //   });

  //   it('string literal type', function() {
  //     var type;
  //     type = comments.parseType('"Hello, World"');
  //     type.should.eql({
  //       type: 'StringLiteralType',
  //       value: 'Hello, World'
  //     });
  //   });

  //   it('numeric literal type', function() {
  //     var type;
  //     type = comments.parseType('32');
  //     type.should.eql({
  //       type: 'NumericLiteralType',
  //       value: 32
  //     });
  //     type = comments.parseType('-142.42');
  //     type.should.eql({
  //       type: 'NumericLiteralType',
  //       value: -142.42
  //     });
  //   });

  //   it('boolean literal type', function() {
  //     var type;
  //     type = comments.parseType('true');
  //     type.should.eql({
  //       type: 'BooleanLiteralType',
  //       value: true
  //     });
  //     type = comments.parseType('false');
  //     type.should.eql({
  //       type: 'BooleanLiteralType',
  //       value: false
  //     });
  //   });

  //   it('illegal tokens', function() {
  //     comments.parseType.bind(comments, '.').should.throw('unexpected token');
  //     comments.parseType.bind(comments, '.d').should.throw('unexpected token');
  //     comments.parseType.bind(comments, '(').should.throw('unexpected token');
  //     comments.parseType.bind(comments, 'Test.').should.throw('unexpected token');
  //   });
  // });

  // describe('parseParamType', function() {
  //   it('question', function() {
  //     var type = comments.parseParamType('?');
  //     type.should.eql({
  //       type: 'NullableLiteral'
  //     });
  //   });

  //   it('question option', function() {
  //     var type = comments.parseParamType('?=');
  //     type.should.eql({
  //       type: 'OptionalType',
  //       expression: {
  //         type: 'NullableLiteral'
  //       }
  //     });
  //   });

  //   it('function option parameters former', function() {
  //     var type = comments.parseParamType('function(?, number)');
  //     type.should.eql({
  //       type: 'FunctionType',
  //       params: [{
  //         type: 'NullableLiteral'
  //       }, {
  //         type: 'NameExpression',
  //         name: 'number'
  //       }],
  //       result: null
  //     });
  //   });

  //   it('function option parameters latter', function() {
  //     var type = comments.parseParamType('function(number, ?)');
  //     type.should.eql({
  //       type: 'FunctionType',
  //       params: [{
  //         type: 'NameExpression',
  //         name: 'number'
  //       }, {
  //         type: 'NullableLiteral'
  //       }],
  //       result: null
  //     });
  //   });

  //   it('function type union', function() {
  //     var type = comments.parseParamType('function(): ?|number');
  //     type.should.eql({
  //       type: 'UnionType',
  //       elements: [{
  //         type: 'FunctionType',
  //         params: [],
  //         result: {
  //           type: 'NullableLiteral'
  //         }
  //       }, {
  //         type: 'NameExpression',
  //         name: 'number'
  //       }]
  //     });
  //   });
  // });

  // describe('invalid', function() {
  //   it('empty union pipe', function() {
  //     comments.parseType.bind(comments, '(|)').should.throw();
  //     comments.parseType.bind(comments, '(string|)').should.throw();
  //     comments.parseType.bind(comments, '(string||)').should.throw();
  //   });

  //   it('comma only array type', function() {
  //     comments.parseType.bind(comments, '[,]').should.throw();
  //   });

  //   it('comma only record type', function() {
  //     comments.parseType.bind(comments, '{,,}').should.throw();
  //   });

  //   it('incorrect bracket', function() {
  //     comments.parseParamType.bind(comments, 'int[').should.throw();
  //   });
  // });

  // describe('tags option', function() {
  //   it('only param', function() {
  //     var res = comments.parse([
  //       '/**',
  //       ' * @const @const',
  //       ' * @param {String} y',
  //       ' */'
  //     ].join('\n'), {
  //       tags: ['param'],
  //       unwrap: true
  //     });
  //     res[0].tags.should.have.length(1);
  //     res[0].tags[0].should.have.property('title', 'param');
  //     res[0].tags[0].should.have.property('name', 'y');
  //   });

  //   it('param and type', function() {
  //     var res = comments.parse([
  //       '/**',
  //       ' * @const x',
  //       ' * @param {String} y',
  //       ' * @type {String} ',
  //       ' */'
  //     ].join('\n'), {
  //       tags: ['param', 'type'],
  //       unwrap: true
  //     });
  //     res[0].tags.should.have.length(2);
  //     res[0].tags[0].should.have.property('title', 'param');
  //     res[0].tags[0].should.have.property('name', 'y');
  //     res[0].tags[1].should.have.property('title', 'type');
  //     res[0].tags[1].should.have.property('type');
  //     res[0].tags[1].type.should.have.property('name', 'String');
  //   });
  // });

  // describe('invalid tags', function() {
  //   it('bad tag 1', function() {
  //     comments.parse.bind(comments, [
  //       '/**',
  //       ' * @param {String} hucairz',
  //       ' */'
  //     ].join('\n'), {
  //       tags: 1,
  //       unwrap: true
  //     }).should.throw();
  //   });

  //   it('bad tag 2', function() {
  //     comments.parse.bind(comments, [
  //       '/**',
  //       ' * @param {String} hucairz',
  //       ' */'
  //     ].join('\n'), {
  //       tags: ['a', 1],
  //       unwrap: true
  //     }).should.throw();
  //   });
  // });

  // describe('optional params', function() {
  //   // should fail since sloppy option not set
  //   it('failure 0', function() {
  //     comments.parse(['/**', ' * @param {String} [val]', ' */'].join('\n'), {
  //         unwrap: true
  //       }).should.eql({
  //         'description': '',
  //         'tags': []
  //       });
  //   });

  //   it('failure 1', function() {
  //     comments.parse(['/**', ' * @param [val', ' */'].join('\n'), {
  //         unwrap: true,
  //         sloppy: true
  //       }).should.eql({
  //         'description': '',
  //         'tags': []
  //       });
  //   });

  //   it('success 1', function() {
  //     comments.parse(['/**', ' * @param {String} [val]', ' */'].join('\n'), {
  //         unwrap: true,
  //         sloppy: true
  //       }).should.eql({
  //         'description': '',
  //         'tags': [{
  //         'title': 'param',
  //         'description': null,
  //         'type': {
  //           'type': 'OptionalType',
  //           'expression': {
  //             'type': 'NameExpression',
  //             'name': 'String'
  //           }
  //         },
  //         'name': 'val'
  //       }]
  //       });
  //   });
  //   it('success 2', function() {
  //     comments.parse(['/**', ' * @param {String=} val', ' */'].join('\n'), {
  //         unwrap: true,
  //         sloppy: true
  //       }).should.eql({
  //         'description': '',
  //         'tags': [{
  //         'title': 'param',
  //         'description': null,
  //         'type': {
  //           'type': 'OptionalType',
  //           'expression': {
  //             'type': 'NameExpression',
  //             'name': 'String'
  //           }
  //         },
  //         'name': 'val'
  //       }]
  //       });
  //   });

  //   it('success 3', function() {
  //     comments.parse(['/**', ' * @param {String=} [val=abc] some description', ' */'].join('\n'), {
  //         unwrap: true,
  //         sloppy: true
  //       }
  //     ).should.eql({
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
  //         'default': 'abc'
  //       }]
  //     });
  //   });

  //   it('success 4', function() {
  //     comments.parse(['/**', ' * @param {String=} [val = abc] some description', ' */'].join('\n'), {
  //         unwrap: true,
  //         sloppy: true
  //       }
  //     ).should.eql({
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
  //         'default': 'abc'
  //       }]
  //     });
  //   });

  //   it('default string', function() {
  //     comments.parse(['/**', ' * @param {String} [val="foo"] some description', ' */'].join('\n'), {
  //         unwrap: true,
  //         sloppy: true
  //       }
  //     ).should.eql({
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
  //         'default': '"foo"'
  //       }]
  //     });
  //   });

  //   it('default string surrounded by whitespace', function() {
  //     comments.parse(['/**', " * @param {String} [val=   'foo'  ] some description", ' */'].join('\n'), {
  //         unwrap: true,
  //         sloppy: true
  //       }
  //     ).should.eql({
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
  //         'default': "'foo'"
  //       }]
  //     });
  //   });

  //   it('should preserve whitespace in default string', function() {
  //     comments.parse(['/**', ' * @param {String} [val=   "   foo"  ] some description', ' */'].join('\n'), {
  //         unwrap: true,
  //         sloppy: true
  //       }
  //     ).should.eql({
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
  //         'default': '"   foo"'
  //       }]
  //     });
  //   });

  //   it('default array', function() {
  //     comments.parse(['/**', " * @param {String} [val=['foo']] some description", ' */'].join('\n'), {
  //         unwrap: true,
  //         sloppy: true
  //       }
  //     ).should.eql({
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

  //   it('default array', function() {
  //     comments.parse(['/**', " * @param {String} [val=['foo']] some description", ' */'].join('\n'), {
  //         unwrap: true,
  //         sloppy: true
  //       }
  //     ).should.eql({
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

  //   it('default array within white spaces', function() {
  //     comments.parse(['/**', " * @param {String} [val = [ 'foo' ]] some description", ' */'].join('\n'), {
  //         unwrap: true,
  //         sloppy: true
  //       }
  //     ).should.eql({
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
  //     var res = comments.parse([
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
  //     }
  //     );

  //     res[0].tags[0].should.have.property('lineNumber', 1);
  //     res[0].tags[1].should.have.property('lineNumber', 2);
  //     res[0].tags[2].should.have.property('lineNumber', 3);
  //     res[0].tags[3].should.have.property('lineNumber', 5);
  //   });

  //   it('example caption', function() {
  //     var res = comments.parse([
  //       '/**',
  //       ' * @example <caption>hi</caption>',
  //       " * f('blah'); // => undefined",
  //       ' */'
  //     ].join('\n'), {
  //       unwrap: true,
  //       lineNumbers: true
  //     }
  //     );

  //     res[0].tags[0].description.should.eql("f('blah'); // => undefined");
  //     res[0].tags[0].caption.should.eql('hi');
  //   });

  //   it('should handle \\r\\n line endings correctly', function() {
  //     var res = comments.parse([
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
  //     }
  //     );

  //     res[0].tags[0].should.have.property('lineNumber', 1);
  //     res[0].tags[1].should.have.property('lineNumber', 2);
  //     res[0].tags[2].should.have.property('lineNumber', 4);
  //   });
  // });

  // describe('optional properties', function() {

  //   // should fail since sloppy option not set
  //   it('failure 0', function() {
  //     comments.parse(['/**',
  //         ' * @property {String} [val] some description',
  //         ' */'
  //       ].join('\n'), {
  //         unwrap: true
  //       }).should.eql({
  //         'description': '',
  //         'tags': []
  //       });
  //   });

  //   it('failure 1', function() {
  //     comments.parse(['/**', ' * @property [val', ' */'].join('\n'), {
  //         unwrap: true,
  //         sloppy: true
  //       }).should.eql({
  //         'description': '',
  //         'tags': []
  //       });
  //   });

  //   it('success 1', function() {
  //     comments.parse(['/**', ' * @property {String} [val]', ' */'].join('\n'), {
  //         unwrap: true,
  //         sloppy: true
  //       }).should.eql({
  //         'description': '',
  //         'tags': [{
  //         'title': 'property',
  //         'description': null,
  //         'type': {
  //           'type': 'OptionalType',
  //           'expression': {
  //             'type': 'NameExpression',
  //             'name': 'String'
  //           }
  //         },
  //         'name': 'val'
  //       }]
  //       });
  //   });

  //   it('success 2', function() {
  //     comments.parse(['/**', ' * @property {String=} val', ' */'].join('\n'), {
  //         unwrap: true,
  //         sloppy: true
  //       }).should.eql({
  //         'description': '',
  //         'tags': [{
  //         'title': 'property',
  //         'description': null,
  //         'type': {
  //           'type': 'OptionalType',
  //           'expression': {
  //             'type': 'NameExpression',
  //             'name': 'String'
  //           }
  //         },
  //         'name': 'val'
  //       }]
  //       });
  //   });

  //   it('success 3', function() {
  //     comments.parse(['/**', ' * @property {String=} [val=abc] some description', ' */'].join('\n'), {
  //         unwrap: true,
  //         sloppy: true
  //       }
  //     ).should.eql({
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
  //     comments.parse(['/**', ' * @property {String=} [val = abc] some description', ' */'].join('\n'), {
  //         unwrap: true,
  //         sloppy: true
  //       }
  //     ).should.eql({
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
  //     comments.parse(['/**', ' * @property {String} [val="foo"] some description', ' */'].join('\n'), {
  //         unwrap: true,
  //         sloppy: true
  //       }
  //     ).should.eql({
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
  //     comments.parse(['/**', " * @property {String} [val=   'foo'  ] some description", ' */'].join('\n'), {
  //         unwrap: true,
  //         sloppy: true
  //       }
  //     ).should.eql({
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
  //     comments.parse(['/**', ' * @property {String} [val=   "   foo"  ] some description', ' */'].join('\n'), {
  //         unwrap: true,
  //         sloppy: true
  //       }
  //     ).should.eql({
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
  //     comments.parse(['/**', " * @property {String} [val=['foo']] some description", ' */'].join('\n'), {
  //         unwrap: true,
  //         sloppy: true
  //       }
  //     ).should.eql({
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
  //     comments.parse(['/**', " * @property {String} [val = [ 'foo' ]] some description", ' */'].join('\n'), {
  //         unwrap: true,
  //         sloppy: true
  //       }
  //     ).should.eql({
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
  // });

  // describe('recovery tests', function() {
  //   it('params 2', function() {
  //     var res = comments.parse([
  //       '@param f',
  //       '@param {string} f2'
  //     ].join('\n'), {
  //       recoverable: true
  //     });

  //     // ensure both parameters are OK
  //     res[0].tags.should.have.length(2);
  //     res[0].tags[0].should.have.property('title', 'param');
  //     res[0].tags[0].should.have.property('type', null);
  //     res[0].tags[0].should.have.property('name', 'f');

  //     res[0].tags[1].should.have.property('title', 'param');
  //     res[0].tags[1].should.have.property('type');
  //     res[0].tags[1].type.should.have.property('name', 'string');
  //     res[0].tags[1].type.should.have.property('type', 'NameExpression');
  //     res[0].tags[1].should.have.property('name', 'f2');
  //   });

  //   it('params 2', function() {
  //     var res = comments.parse([
  //       '@param string f',
  //       '@param {string} f2'
  //     ].join('\n'), {
  //       recoverable: true
  //     });

  //     // ensure first parameter is OK even with invalid type name
  //     res[0].tags.should.have.length(2);
  //     res[0].tags[0].should.have.property('title', 'param');
  //     res[0].tags[0].should.have.property('type', null);
  //     res[0].tags[0].should.have.property('name', 'string');
  //     res[0].tags[0].should.have.property('description', 'f');

  //     res[0].tags[1].should.have.property('title', 'param');
  //     res[0].tags[1].should.have.property('type');
  //     res[0].tags[1].type.should.have.property('name', 'string');
  //     res[0].tags[1].type.should.have.property('type', 'NameExpression');
  //     res[0].tags[1].should.have.property('name', 'f2');
  //   });

  //   it('return 1', function() {
  //     var res = comments.parse([
  //       '@returns'
  //     ].join('\n'), {
  //       recoverable: true
  //     });

  //     // return tag should exist
  //     res[0].tags.should.have.length(1);
  //     res[0].tags[0].should.have.property('title', 'returns');
  //     res[0].tags[0].should.have.property('type', null);
  //   });
  //   it('return 2', function() {
  //     var res = comments.parse([
  //       '@returns',
  //       '@param {string} f2'
  //     ].join('\n'), {
  //       recoverable: true
  //     });

  //     // return tag should exist as well as next tag
  //     res[0].tags.should.have.length(2);
  //     res[0].tags[0].should.have.property('title', 'returns');
  //     res[0].tags[0].should.have.property('type', null);

  //     res[0].tags[1].should.have.property('title', 'param');
  //     res[0].tags[1].should.have.property('type');
  //     res[0].tags[1].type.should.have.property('name', 'string');
  //     res[0].tags[1].type.should.have.property('type', 'NameExpression');
  //     res[0].tags[1].should.have.property('name', 'f2');
  //   });

  //   it('return no type', function() {
  //     var res = comments.parse([
  //       '@return a value'
  //     ].join('\n'));

  //     // return tag should exist
  //     res[0].tags.should.have.length(1);
  //     res[0].tags[0].should.have.property('title', 'return');
  //     res[0].tags[0].should.have.property('type', null);
  //     res[0].tags[0].should.have.property('description', 'a value');
  //   });

  //   it('extra @ 1', function() {
  //     var res = comments.parse([
  //       '@',
  //       '@returns',
  //       '@param {string} f2'
  //     ].join('\n'), {
  //       recoverable: true
  //     });

  //     // empty tag name shouldn't affect subsequent tags
  //     res[0].tags.should.have.length(3);
  //     res[0].tags[0].should.have.property('title', '');
  //     res[0].tags[0].should.not.have.property('type');

  //     res[0].tags[1].should.have.property('title', 'returns');
  //     res[0].tags[1].should.have.property('type', null);

  //     res[0].tags[2].should.have.property('title', 'param');
  //     res[0].tags[2].should.have.property('type');
  //     res[0].tags[2].type.should.have.property('name', 'string');
  //     res[0].tags[2].type.should.have.property('type', 'NameExpression');
  //     res[0].tags[2].should.have.property('name', 'f2');
  //   });

  //   it('extra @ 2', function() {
  //     var res = comments.parse([
  //       '@ invalid name',
  //       '@param {string} f2'
  //     ].join('\n'), {
  //       recoverable: true
  //     });

  //     // empty tag name shouldn't affect subsequent tags
  //     res[0].tags.should.have.length(2);
  //     res[0].tags[0].should.have.property('title', '');
  //     res[0].tags[0].should.not.have.property('type');
  //     res[0].tags[0].should.not.have.property('name');
  //     res[0].tags[0].should.have.property('description', 'invalid name');

  //     res[0].tags[1].should.have.property('title', 'param');
  //     res[0].tags[1].should.have.property('type');
  //     res[0].tags[1].type.should.have.property('name', 'string');
  //     res[0].tags[1].type.should.have.property('type', 'NameExpression');
  //     res[0].tags[1].should.have.property('name', 'f2');
  //   });

  //   it('invalid tag 1', function() {
  //     var res = comments.parse([
  //       '@111 invalid name',
  //       '@param {string} f2'
  //     ].join('\n'), {
  //       recoverable: true
  //     });

  //     // invalid tag name shouldn't affect subsequent tags
  //     res[0].tags.should.have.length(2);
  //     res[0].tags[0].should.have.property('title', '111');
  //     res[0].tags[0].should.not.have.property('type');
  //     res[0].tags[0].should.not.have.property('name');
  //     res[0].tags[0].should.have.property('description', 'invalid name');

  //     res[0].tags[1].should.have.property('title', 'param');
  //     res[0].tags[1].should.have.property('type');
  //     res[0].tags[1].type.should.have.property('name', 'string');
  //     res[0].tags[1].type.should.have.property('type', 'NameExpression');
  //     res[0].tags[1].should.have.property('name', 'f2');
  //   });

  //   it('invalid tag 1', function() {
  //     var res = comments.parse([
  //       '@111',
  //       '@param {string} f2'
  //     ].join('\n'), {
  //       recoverable: true
  //     });

  //     // invalid tag name shouldn't affect subsequent tags
  //     res[0].tags.should.have.length(2);
  //     res[0].tags[0].should.have.property('title', '111');
  //     res[0].tags[0].should.not.have.property('type');
  //     res[0].tags[0].should.not.have.property('name');
  //     res[0].tags[0].should.have.property('description', null);

  //     res[0].tags[1].should.have.property('title', 'param');
  //     res[0].tags[1].should.have.property('type');
  //     res[0].tags[1].type.should.have.property('name', 'string');
  //     res[0].tags[1].type.should.have.property('type', 'NameExpression');
  //     res[0].tags[1].should.have.property('name', 'f2');
  //   });

  //   it('should not crash on bad type in @param without name', function() {
  //     var res = comments.parse('@param {Function(DOMNode)}', {
  //       recoverable: true
  //     });
  //     res[0].tags.should.have.length(1);
  //     res[0].tags[0].should.eql({
  //       'description': null,
  //       'errors': [
  //         'not reach to EOF',
  //         'Missing or invalid tag name'
  //       ],
  //       'name': null,
  //       'title': 'param',
  //       'type': null
  //     });
  //   });

  //   it('should not crash on bad type in @param in sloppy mode', function() {
  //     var res = comments.parse('@param {int[} [x]', {
  //       sloppy: true,
  //       recoverable: true
  //     });
  //     res[0].tags.should.have.length(1);
  //     res[0].tags[0].should.eql({
  //       'description': null,
  //       'errors': [
  //         'expected an array-style type declaration (int[])'
  //       ],
  //       'name': 'x',
  //       'title': 'param',
  //       'type': null
  //     });
  //   });
  // });

  // describe('exported Syntax', function() {
  //   it('members', function() {
  //     comments.Syntax.should.eql({
  //       NullableLiteral: 'NullableLiteral',
  //       AllLiteral: 'AllLiteral',
  //       NullLiteral: 'NullLiteral',
  //       UndefinedLiteral: 'UndefinedLiteral',
  //       VoidLiteral: 'VoidLiteral',
  //       UnionType: 'UnionType',
  //       ArrayType: 'ArrayType',
  //       BooleanLiteralType: 'BooleanLiteralType',
  //       RecordType: 'RecordType',
  //       FieldType: 'FieldType',
  //       FunctionType: 'FunctionType',
  //       ParameterType: 'ParameterType',
  //       RestType: 'RestType',
  //       NonNullableType: 'NonNullableType',
  //       OptionalType: 'OptionalType',
  //       NullableType: 'NullableType',
  //       NameExpression: 'NameExpression',
  //       TypeApplication: 'TypeApplication',
  //       StringLiteralType: 'StringLiteralType',
  //       NumericLiteralType: 'NumericLiteralType'
  //     });
  //   });
  // });

  // describe('@ mark contained descriptions', function() {
  //   it('comment description #10', function() {
  //     comments.parse([
  //         '/**',
  //         ' * Prevents the default action. It is equivalent to',
  //         ' * {@code e.preventDefault()}, but can be used as the callback argument of',
  //         ' * {@link goog.events.listen} without declaring another function.',
  //         ' * @param {!goog.events.Event} e An event.',
  //         ' */'
  //       ].join('\n'), {
  //         unwrap: true,
  //         sloppy: true
  //       }).should.eql({
  //         'description': 'Prevents the default action. It is equivalent to\n{@code e.preventDefault()}, but can be used as the callback argument of\n{@link goog.events.listen} without declaring another function.',
  //         'tags': [{
  //           'title': 'param',
  //           'description': 'An event.',
  //           'type': {
  //           'type': 'NonNullableType',
  //           'expression': {
  //             'type': 'NameExpression',
  //             'name': 'goog.events.Event'
  //           },
  //           'prefix': true
  //         },
  //           'name': 'e'
  //         }]
  //       });
  //   });

  //   it('tag description', function() {
  //     comments.parse([
  //         '/**',
  //         ' * Prevents the default action. It is equivalent to',
  //         ' * @param {!goog.events.Event} e An event.',
  //         ' * {@code e.preventDefault()}, but can be used as the callback argument of',
  //         ' * {@link goog.events.listen} without declaring another function.',
  //         ' */'
  //       ].join('\n'), {
  //         unwrap: true,
  //         sloppy: true
  //       }).should.eql({
  //         'description': 'Prevents the default action. It is equivalent to',
  //         'tags': [{
  //           'title': 'param',
  //           'description': 'An event.\n{@code e.preventDefault()}, but can be used as the callback argument of\n{@link goog.events.listen} without declaring another function.',
  //           'type': {
  //           'type': 'NonNullableType',
  //           'expression': {
  //             'type': 'NameExpression',
  //             'name': 'goog.events.Event'
  //           },
  //           'prefix': true
  //         },
  //           'name': 'e'
  //         }]
  //       });
  //   });
  // });

  // describe('function', function() {
  //   it('recognize "function" type', function() {
  //     var res = comments.parse([
  //       '@param {function} foo description',
  //     ].join('\n'), {});
  //     res[0].tags.should.have.length(1);
  //     res[0].tags[0].should.have.property('title', 'param');
  //     res[0].tags[0].should.have.property('type');
  //     res[0].tags[0].type.should.eql({
  //       'name': 'function',
  //       'type': 'NameExpression'
  //     });
  //     res[0].tags[0].should.have.property('name', 'foo');
  //     res[0].tags[0].should.have.property('description', 'description');
  //   });
  // });

  // describe('tagged namepaths', function() {
  //   it('recognize module:', function() {
  //     var res = comments.parse([
  //       '@alias module:Foo.bar'
  //     ].join('\n'), {});
  //     res[0].tags.should.have.length(1);
  //     res[0].tags[0].should.have.property('title', 'alias');
  //     res[0].tags[0].should.have.property('name', 'module:Foo.bar');
  //     res[0].tags[0].should.have.property('description', null);
  //   });

  //   it('recognize external:', function() {
  //     var res = comments.parse([
  //       '@param {external:Foo.bar} baz description'
  //     ].join('\n'), {});
  //     res[0].tags.should.have.length(1);
  //     res[0].tags[0].should.have.property('title', 'param');
  //     res[0].tags[0].type.should.eql({
  //       'name': 'external:Foo.bar',
  //       'type': 'NameExpression'
  //     });
  //     res[0].tags[0].should.have.property('name', 'baz');
  //     res[0].tags[0].should.have.property('description', 'description');
  //   });

  //   it('recognize event:', function() {
  //     var res = comments.parse([
  //       '@function event:Foo.bar'
  //     ].join('\n'), {});
  //     res[0].tags.should.have.length(1);
  //     res[0].tags[0].should.have.property('title', 'function');
  //     res[0].tags[0].should.have.property('name', 'event:Foo.bar');
  //     res[0].tags[0].should.have.property('description', null);
  //   });

  //   it('invalid bogus:', function() {
  //     var res = comments.parse([
  //       '@method bogus:Foo.bar'
  //     ].join('\n'), {});
  //     res[0].tags.should.have.length(0);
  //   });
  });
});
