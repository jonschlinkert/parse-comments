'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');
const fixtures = path.join.bind(path, __dirname, 'fixtures');
const Comments = require('..');
const comments = new Comments();

// var fp = fixtures('tag-variants.js');
// var fp = fixtures('tag-entries.js');
// var ast = comments.parse(fs.readFileSync(fp, 'utf8'));
// console.log(ast.nodes[0])

const str = [
  '/**',
  ' * Register a handler function to be called on a node of the given `type`.',
  ' * Override a built-in handler `type`, or register a new type.',
  ' *',
  ' * ```js',
  ' * comments.set("param", function(node) {',
  ' *   // do stuff to node',
  ' * });',
  ' * ```',
  ' * @param {String} `type` The `node.type` to call the handler on. You can override built-in middleware by registering a handler of the same name, or register a handler for rendering a new type.',
  ' * @param {Function} `fn` The handler function',
  ' * @return {Object} Returns the instance for chaining.',
  ' * @api public',
  ' */',
  '',
  'set(type, fn) {',
  '  // do stuff',
  '}',
].join('\n');

const ast = comments.parse(str);
console.log(util.inspect(ast, { depth: null, maxArrayLength: null }));
