'use strict';

const fs = require('fs');
const Comments = require('..');
const comments = new Comments();
const fp = require.resolve('cache-base');

comments.on('rawNode', function(node) {
  console.log(node);
});

comments.on('token', function(tok) {
  console.log(tok);
  if (tok.example.code && !tok.example.lang) {
    tok.example.lang = 'js';
  }
});

const ast = comments.parse(fs.readFileSync(fp, 'utf8'));
// console.log(ast)
