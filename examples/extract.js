'use strict';

const fs = require('fs');
const Comments = require('..');
const comments = new Comments();

const fp = require.resolve('cache-base');

const nodes = comments.extract(fs.readFileSync(fp, 'utf8'));
console.log(nodes)
