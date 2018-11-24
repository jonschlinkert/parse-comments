'use strict';

console.time('total');
process.on('exit', () => console.timeEnd('total'));
const fs = require('fs');
const Comments = require('..');
const comments = new Comments();
const fp = require.resolve('snapdragon-parser');
const nodes = comments.extract(fs.readFileSync(fp, 'utf8'));
console.log(nodes);
