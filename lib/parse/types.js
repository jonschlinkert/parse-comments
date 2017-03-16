'use strict';

const extend = require('extend-shallow');

function parseTypes(tag, str, options, nested) {
  var opts = extend({sep: '|'}, options);
  var sep = opts.sep;

  if (str.trim() === '') {
    return [];
  }

  if (str.trim() === '{}') {
    return [{ name: 'boolean' }];
  }

  let stack = [];
  let tok = {type: 'NameExpression', name: ''};
  let len = str.length;
  let closeIdx;
  let i = -1;

  while (++i < len) {
    let ch = str[i];
    let next = str[i + 1];

    if (ch === '\\') {
      tok.name += next;
      i++;
      continue;
    }

    switch (ch) {
      case '"':
        closeIdx = getClose(str, '"', i + 1);
        if (closeIdx === -1) {
          throw new Error('unclosed double quote: ' + str);
        }

        ch = str.slice(i + 1, closeIdx);
        i = closeIdx;
        break;
      case '\'':
        closeIdx = getClose(str, '\'', i + 1);
        if (closeIdx === -1) {
          throw new Error('unclosed double quote: ' + str);
        }

        ch = str.slice(i + 1, closeIdx);
        i = closeIdx;
        break;
      case '{':
        closeIdx = getClose(str, '}', i + 1);
        if (closeIdx === -1) {
          throw new Error('unclosed brace: ' + str);
        }

        ch = str.slice(i + 1, closeIdx);
        if (tok.name) {
          tok = addToken(tag, stack, tok, opts, nested);
        }

        if (/^[!=\w][^:]+?:/.test(ch.trim())) {
          let segs = ch.split(':');
          let key = segs[0].trim();
          let val = segs[1].trim();

          let args = parseTypes(tag, val, extend({}, options, {sep: ','}));
          let first = [args.shift()];
          if (args.length === 0) {
            first = parseTypes(tag, val, options);
          }

          let entry = { name: key };

          entry.typeUnion = {types: first};
          let entries = [entry];

          for (let j = 0; j < args.length; j++) {
            let arg = args[j];
            entries.push({
              name: arg.name.trim(),
              typeUnion: {
                types: [],
                all: true
              }
            });
          }

          stack.push({entries: entries});
        } else {
          stack = stack.concat(parseTypes(tag, ch, options));
        }

        tok.name = '';
        ch = '';
        i = closeIdx;
        break;
      case '[':
        closeIdx = getClose(str, ']', i + 1);
        if (closeIdx === -1) {
          throw new Error('unclosed bracket: ' + str);
        }

        ch = str.slice(i + 1, closeIdx);
        let types = stack;
        stack = [];

        if (types.length === 0) {
          types.push(tok);
        }

        let obj = {
          parameterTypeUnions: [ { types: types } ],
          genericTypeName: { name: 'Array' }
        };

        stack.push(obj);
        tok = {name: ''};

        i = closeIdx;
        break;
      case '(':
        closeIdx = getClose(str, ')', i + 1);
        if (closeIdx === -1) {
          throw new Error('unclosed paren: ' + str);
        }

        ch = str.slice(i + 1, closeIdx);
        if (tok.name === 'function') {
          let types = parseTypes(tag, ch, options, true);

          if (types.length <= 1) {
            types = [];
            let opt = extend({}, options, {sep: ','});
            let res = parseTypes(tag, ch, opt, true);
            let len = res.length;
            let idx = -1;
            while (++idx < len) {
              types.push({types: [res[idx]]});
            }

          } else if (types.length) {
            types = [{types: types}];
          }

          stack.push({ parameterTypeUnions: types });
          tok = {name: ''};
          ch = '';
          i = closeIdx;
          continue;
        }

        if (tok.name) {
          tok = addToken(tag, stack, tok, opts, nested);
        }

        stack = stack.concat(parseTypes(tag, ch, options));
        ch = '';
        i = closeIdx;
        break;
      case '<':
        closeIdx = getClose(str, '>', i + 1);
        if (closeIdx === -1) {
          throw new Error('unclosed angle bracket: ' + str);
        }

        ch = str.slice(i + 1, closeIdx);
        i = closeIdx;
        break;
      case ':':
        let subTag = { types: [] };
        subTag.types = parseTypes(subTag, str.slice(i + 1).trim(), options);
        tok = stack.pop();
        tok.returnTypeUnion = subTag;
        stack.push(tok);
        return stack;
      default: {
        break;
      }
    }

    if (ch === sep) {
      tok = addToken(tag, stack, tok, opts, nested);
    } else {
      tok.name += ch;
    }
  }

  if (tok.name) {
    tok = addToken(tag, stack, tok, opts, nested);
  }

  return stack;
};

function addToken(tag, stack, tok, options, nested) {
  tok.name = tok.name.trim();
  let obj = nested ? tok : tag;

  if (!tok.name || isUnknown(tok, obj) || isWildcard(tok, obj, options)) {
    return { type: 'NameExpression', name: '' };
  }

  if (isVariadic(tok, obj, options)) {
    return addToken.apply(null, arguments);
  }

  switch (tok.name.charAt(0)) {
    case '?':
      chopName(tok, 1);
      obj.nullable = true;
      break;
    case '!':
      chopName(tok, 1);
      obj.nullable = false;
      break;
    case '=':
      chopName(tok, 1);
      obj.optional = true;
      break;
  }

  switch (tok.name.slice(-1)) {
    case '?':
      chopName(tok, -1);
      obj.nullable = true;
      break;
    case '!':
      chopName(tok, -1);
      obj.nullable = false;
      break;
    case '=':
      chopName(tok, -1);
      obj.optional = true;
      break;
  }

  if (tok.name) {
    stack.push(tok);
  }
  return { type: 'NameExpression', name: ''};
}

function getClose(str, substr, startIndex) {
  var idx = str.indexOf(substr, startIndex);
  if (str.charAt(idx - 1) === '\\') {
    return getClose(str, substr, idx + 1);
  }
  return idx;
}

function isUnknown(tok, tag) {
  if (tok.name === '?' || tok.name === 'unknown') {
    tag.unknown = true;
    return true;
  }
}

function isVariadic(tok, tag, options) {
  var prop = options.jsdoc ? 'variable' : 'variadic';
  if (startsWith(tok.name, '...')) {
    chopName(tok, 3);
    tag[prop] = true;
    return true;
  }

  if (endsWith(tok.name, '...')) {
    chopName(tok, -3);
    tag[prop] = true;
    return true;
  }
}

function isWildcard(tok, tag, options) {
  var prop = options.jsdoc ? 'all' : 'any';
  if (tok.name === '*' || tok.name === 'all' || tok.name === 'any') {
    tag[prop] = true;
    return true;
  }
}

function chopName(tok, n) {
  if (n < 0) {
    tok.name = tok.name.slice(0, n);
  } else {
    tok.name = tok.name.slice(n);
  }
}

function startsWith(str, ch) {
  return str.slice(0, ch.length) === ch;
}

function endsWith(str, ch) {
  return str.slice(-ch.length) === ch;
}

/**
 * Expose `parseTypes`
 */

module.exports = parseTypes;
