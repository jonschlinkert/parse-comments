'use strict';

var fs = require('fs');
var Comments = require('..');
var comments = new Comments();

var CacheBase = require('cache-base');
var fp = require.resolve('cache-base');

var nodes = comments.extract(fs.readFileSync(fp, 'utf8'));
console.log(nodes)
