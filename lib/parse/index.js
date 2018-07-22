'use strict';

define('flags', () => require('./flags'));
define('inline', () => require('./inline'));
define('name', () => require('./name'));
define('tag', () => require('./tag'));
define('type', () => require('./type'));

function define(key, get) {
  Reflect.defineProperty(exports, key, { get });
}
