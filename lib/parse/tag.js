'use strict';

var define = require('define-property');
var allows = require('../allows');

/**
 * Tokenize the `rawType`, `name` and `description` on a javadoc-style tag.
 * @param {String} str
 * @param {Boolean} allowsName False if a name is not allowed for the current tag.
 * @return {Object}
 * @api public
 */

module.exports = function(tag, options) {
  if (typeof tag === 'string') {
    tag = { val: tag };
  }

  if (typeof tag.val !== 'string') {
    throw new TypeError('expected a string');
  }

  options = options || {};
  var str = tag.val.trim();
  var allowsName = tag.key ? allows.name(tag) : true;

  let tok = {};
  if (tag.key) {
    define(tok, 'key', tag.key);
    tok.title = tag.key;
  }

  tok.description = '';
  tok.rawType = '';
  tok.name = '';

  define(tok, 'orig', tag);

  var len = str.length;
  var idx = -1;

  var prop = 'rawType';
  var inside = 0;

  while (++idx < len) {
    var ch = str[idx];

    switch (ch) {
      case '{':
        tok[prop] += ch;
        inside++;
        break;
      case '}':
        tok[prop] += ch;
        if (prop === 'description') {
          break;
        }

        if (inside === 0) {
          throw new Error('missing opening brace:' + str);
        }

        inside--;
        if (inside === 0) {
          prop = !tok.name ? 'name' : 'description';
        }

        break;
      default:
        if (inside === 0) {
          prop = allowsName ? 'name' : 'description';
        }

        if (allowsName === false) {
          tok[prop] += ch;
          break;
        }

        if (!tok.name && prop === 'name') {
          while (ch && ch === ' ' && idx < len) {
            ch = str[++idx];
          }

          var stopChar = ch === '[' ? ']' : ' ';

          while (ch && ch !== stopChar && ch !== '\n' && idx < len) {
            tok.name += ch;
            ch = str[++idx];
          }

          if (ch === ']') {
            tok.name += ch;
          }

          prop = 'description';
          break;

        } else if (tok.name) {
          prop = 'description';
        }

        if (!tok.description && prop === 'description' && ch === ' ') {
          break;
        }

        tok[prop] += ch;
        break;
    }
  }

  if (inside) {
    tok.invalid = true;
    return null;
  }

  tok.description = tok.description.trim();
  tok.name = tok.name.trim();

  if (tok.description.slice(-2) === '}}') {
    tok.description = tok.description.slice(0, -2).trim();
  }

  if (tok.description) {
    tok.description = tok.description.replace(/^ *- */, '');
  }

  define(tok, 'isTag', true);
  return tok;
};
