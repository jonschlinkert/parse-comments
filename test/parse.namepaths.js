'use strict';

require('mocha');
const assert = require('assert');
const Comments = require('..');
const doctrine = require('doctrine');
const { tag, type } = require('../lib/parse');

/**
 * some of these integration tests are based on tests from doctrine
 * https://github.com/eslint/doctrine/LICENSE.BSD
 * https://github.com/eslint/doctrine/LICENSE.closure-compiler
 * https://github.com/eslint/doctrine/LICENSE.esprima
 */

describe('tagged namepaths', () => {
  it('should parse alias with namepath', () => {
    const res = tag('@alias aliasName.OK');
    assert(res.hasOwnProperty('title', 'alias'));
    assert(res.hasOwnProperty('name', 'aliasName.OK'));
  });

  it('should parse alias with namepath', () => {
    const res = tag('@alias module:mymodule/mymodule.init');
    assert(res.hasOwnProperty('title', 'alias'));
    assert(res.hasOwnProperty('name', 'module:mymodule/mymodule.init'));
  });

  it('should parse alias with namepath with hyphen in it', () => {
    const res = tag('@alias module:mymodule/my-module');
    assert(res.hasOwnProperty('title', 'alias'));
    assert(res.hasOwnProperty('name', 'module:mymodule/my-module'));
  });

  it('should parse mixes with namepath', () => {
    const res = tag('@mixes thingName.name');
    assert(res.hasOwnProperty('title', 'mixes'));
    assert(res.hasOwnProperty('name', 'thingName.name'));
  });

  it('should parse mixin with namepath', () => {
    const res = tag('@mixin thingName.name');
    assert(res.hasOwnProperty('title', 'mixin'));
    assert(res.hasOwnProperty('name', 'thingName.name'));
  });

  it('should parse extends with class name path', () => {
    const res = tag('@extends ClassName.OK');
    assert(res.hasOwnProperty('title', 'extends'));
    assert(res.hasOwnProperty('name', 'ClassName.OK'));
  });

  it('should parse extends with namepath', () => {
    const res = tag('@extends module:path/ClassName~OK');
    assert(res.hasOwnProperty('title', 'extends'));
    assert(res.hasOwnProperty('name', 'module:path/ClassName~OK'));
  });

  it('should parse this with namepath', () => {
    const res = tag(' * @this thingName.name');
    assert(res.hasOwnProperty('title', 'this'));
    assert(res.hasOwnProperty('name', 'thingName.name'));
  });
});

describe('tagged namepaths', () => {
  it('should recognize module:', () => {
    const res = tag('@alias module:Foo.bar');
    assert(res.hasOwnProperty('title', 'alias'));
    assert(res.hasOwnProperty('name', 'module:Foo.bar'));
    assert(res.hasOwnProperty('description', ''));
  });

  it('should recognize external:', () => {
    const res = tag('@param {external:Foo.bar} baz description');
    assert(res.hasOwnProperty('title', 'param'));

    res.type = type(res.rawType.slice(1, -1)).value;
    assert.deepEqual(res.type, {
      name: 'external:Foo.bar',
      type: 'NameExpression'
    });

    assert(res.hasOwnProperty('name', 'baz'));
    assert(res.hasOwnProperty('description', 'description'));
  });

  it('should recognize event:', () => {
    const res = tag('@function event:Foo.bar');
    assert(res.hasOwnProperty('title', 'function'));
    assert(res.hasOwnProperty('name', 'event:Foo.bar'));
    assert(res.hasOwnProperty('description', null));
  });

  it('should not parse invalid tags', () => {
    const comments = new Comments();
    const res = comments.parse('@method bogus:Foo.bar');
    assert.deepEqual(res, []);
  });
});
