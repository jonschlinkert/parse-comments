'use strict';

var fs = require('fs');
var CacheBase = require('cache-base');
var Comments = require('..');
var comments = new Comments();

var fp = require.resolve('cache-base');

// comments.on('rawNode', function(node) {
//   // console.log(node);
// });

// comments.on('token', function(tok) {
//   console.log(tok);
//   if (tok.example.code && !tok.example.lang) {
//     tok.example.lang = 'js';
//   }
// });

var ast = comments.parse(fs.readFileSync(fp, 'utf8'));
// console.log(ast.nodes[0])
