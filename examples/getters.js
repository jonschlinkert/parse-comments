'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');
const fixtures = path.join.bind(path, __dirname, 'fixtures');
const Comments = require('..');
const comments = new Comments();

const str = `class Prompt {

  /**
   * Returns the status of the prompt.
   *
   * @return {String} Object with prompt \`status\`, \`cursor\`, \`value\`, \`typed\` and \`error\` (if one exists).
   * @api public
   */

  set status(value) {
    throw new Error('prompt.status is a getter and may not be defined');
  }
  get status() {
    if (this.aborted) return 'aborted';
    if (this.answered) return 'answered';
    return 'pending';
  }
}`;


const ast = comments.parse(str);
console.log(util.inspect(ast, { depth: null, maxArrayLength: null }));
