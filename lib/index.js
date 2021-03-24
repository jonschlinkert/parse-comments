'use strict';

// normalization
define('normalize', () => require('./normalize'));

// formatting
define('format', () => require('./format'));
define('formatter', () => require('./format/formatter'));

// parsing
define('parse', () => require('./parse'));

// validation
define('validate', () => require('./validate'));
define('allows', () => require('./validate/allows'));
define('expects', () => require('./validate/expects'));

// utils
define('utils', () => require('./utils'));

function define(key, get) {
  Reflect.defineProperty(exports, key, { get });
}
