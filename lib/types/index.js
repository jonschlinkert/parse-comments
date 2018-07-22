'use strict';

define('TypeApplication', () => require('./TypeApplication'));
define('FunctionType', () => require('./FunctionType'));
define('RecordType', () => require('./RecordType'));
define('UnionType', () => require('./UnionType'));

function define(key, get) {
  Reflect.defineProperty(exports, key, { get });
}
