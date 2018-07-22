'use strict';

define('allows', () => require('./allows'));
define('expects', () => require('./expects'));
define('format', () => require('./format'));
define('format1', () => require('./format1'));
define('formatter', () => require('./formatter'));
define('normalize', () => require('./normalize'));
define('parse', () => require('./parse'));
define('parser', () => require('./parser'));
define('utils', () => require('./utils'));
define('validate', () => require('./validate'));

function define(key, get) {
  Reflect.defineProperty(exports, key, { get });
}
