'use strict';

define('Expression', () => require('./expression'));
define('Field', () => require('./field'));
define('Param', () => require('./param'));

function define(key, get) {
  Reflect.defineProperty(exports, key, { get });
}
