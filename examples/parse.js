'use strict';

console.time('total');
process.on('exit', () => console.timeEnd('total'));
const fs = require('fs');
const path = require('path');
const util = require('util');
const utils = require('../lib/utils');
const doctrine = require('doctrine');
const fixtures = path.join.bind(path, __dirname, 'fixtures');
const Comments = require('..');
const comments = new Comments();

// let fp = fixtures('tag-variants.js');
// let fp = fixtures('tag-entries.js');
// let fp = fixtures('styledoc.js');
// let ast = comments.parse(fs.readFileSync(fp, 'utf8'));
// console.log(ast)

const str = [
  '/**',
  ' * Create an instance of `CustomClass` with the given `options`.',
  ' *',
  ' * @param {String} options',
  ' * @api public',
  ' */',
  '',
  'class CustomClass {',
  '  constructor(options) {',
  '    this.options = options;',
  '  }',
  '  set(type, fn) {',
  '    // do stuff',
  '  }',
  '}'
].join('\n');


const comment = str.split('\n').slice(0, -3).join('\n');
const ast = comments.parseComment(str);
// const ast = doctrine.parse(utils.stripStars(comment));
console.log(util.inspect(ast, { depth: null, maxArrayLength: null }));
