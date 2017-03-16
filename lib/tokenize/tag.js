'use strict';

/**
 * Tokenize the `rawType`, `name` and `description` on a javadoc-style tag.
 * @param {String} str
 * @param {Boolean} nameAllowed False if a name is not allowed for the current tag.
 * @return {Object}
 * @api public
 */

module.exports = function tokenizeTag(tag, nameAllowed) {
  if (typeof tag.val !== 'string') {
    throw new TypeError('expected a string');
  }

  var str = tag.val.trim();
  if (str.trim() === '') {
    return null;
  }

  if (typeof nameAllowed === 'undefined') {
    nameAllowed = true;
  }

  tag.title = tag.key;
  tag.rawType = ''
  tag.name = ''
  tag.description = '';
  tag.type = 'NameExpression';

  var len = str.length;
  var idx = -1;

  var prop = 'rawType';
  var inside = 0;

  while (++idx < len) {
    var ch = str[idx];

    switch (ch) {
      case '{':
        tag[prop] += ch;
        inside++;
        break;
      case '}':
        tag[prop] += ch;
        if (prop === 'description') {
          break;
        }

        if (inside === 0) {
          throw new Error('missing opening brace:' + str);
        }

        inside--;
        if (inside === 0) {
          prop = !tag.name ? 'name' : 'description';
        }

        break;
      default:
        if (inside === 0) {
          prop = nameAllowed ? 'name' : 'description';
        }

        if (nameAllowed === false) {
          tag[prop] += ch;
          break;
        }

        if (!tag.name && prop === 'name') {
          while (ch && ch === ' ' && idx < len) {
            ch = str[++idx];
          }

          var stopChar = ch === '[' ? ']' : ' ';

          while (ch && ch !== stopChar && ch !== '\n' && idx < len) {
            tag.name += ch;
            ch = str[++idx];
          }

          if (ch === ']') {
            tag.name += ch;
          }

          prop = 'description';
          break;

        } else if (tag.name) {
          prop = 'description'
        }

        if (!tag.description && prop === 'description' && ch === ' ') {
          break;
        }

        tag[prop] += ch;
        break;
    }
  }

  tag.description = tag.description.trim();
  tag.name = tag.name.trim();

  if (tag.description.slice(-2) === '}}') {
    tag.description = tag.description.slice(0, -2).trim();
  }

  return tag;
};
