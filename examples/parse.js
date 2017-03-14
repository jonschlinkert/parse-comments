'use strict';

var fs = require('fs');
var path = require('path');
var fixtures = path.join.bind(path, __dirname, 'fixtures');
var Comments = require('..');
var comments = new Comments();

// var fp = fixtures('tag-variants.js');
var fp = fixtures('tag-entries.js');
var ast = comments.parse(fs.readFileSync(fp, 'utf8'));
// console.log(ast.nodes[0])
