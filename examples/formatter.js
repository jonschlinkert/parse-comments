'use strict';

const Formatter = require('../lib/format/formatter');
const formatter = new Formatter();

const set = (key, value) => comment => (comment[key] = value);

formatter.rule('foo', set('a', true));
formatter.rule('foo', set('b', true));
formatter.rule('foo', set('c', true));
formatter.rule('bar', set('x', false));
formatter.rule('bar', set('y', false));
formatter.rule('bar', set('z', false));

const comment = { foo: {} };
formatter.format(comment);
console.log(comment);
