'use strict';

const { define, getNext } = require('../utils');
const normalize = require('../normalize');
const delimiters = {
  '`': '`',
  '<': '>',
  '{': '}',
  '[': ']',
  '(': ')',
  '@': ' ',
  ' ': ' '
};

module.exports = (tok, options = {}) => {
  if (typeof tok === 'string') {
    tok = { raw: tok };
  }

  const input = tok.raw;
  let tag = { key: '', title: '', rawType: '', name: '', description: '' };

  if (tok.key) {
    define(tag, 'key', tok.key);
  }

  if (tok.raw) {
    define(tag, 'raw', tok.raw);
  }

  function splitString(str) {
    str = str.trim();

    const open = str.charAt(0);
    const close = delimiters[open];
    const stack = [];
    const parts = [];
    let substr = '';

    const len = str.length;
    let idx = -1;

    if (isBracket(open)) {
      stack.push(open);
      substr += str[++idx];

      while (++idx < len && stack.length) {
        let ch = str[idx];
        substr += ch;

        if (ch === close) {
          const last = stack.pop();
          if (last !== open) {
            throw new Error(`missing "${open}"`);
          }
        }

        if (ch === open) {
          stack.push(ch);
        }
      }

      if (stack.length) {
        throw new Error(`missing "${open}"`);
      }

      update(parts, substr);
      let rest = str.slice(idx).trim();

      if (open === '[') {
        if (!tag.name) tag.name = substr;
        return parts.concat(splitString(rest));
      }

      if (open === '{') {
        if (!tag.rawType) tag.rawType = substr;
        return parts.concat(splitString(rest));
      }

      if (rest) {
        parts.push(rest);
      }

      return parts;
    }

    if (open === '`') {
      substr += str[++idx];

      while (++idx < len) {
        let ch = str[idx];
        substr += ch;

        if (ch === close) {
          ++idx;
          break;
        }
      }

      let rest = str.slice(idx);
      if (!tag.name) {
        tag.name = substr;
        tag.description = rest;
      }

      update(parts, substr);
      parts.push(rest);
      return parts;
    }

    const nextIdx = getNext(str, /\s/);
    substr = str.slice(0, nextIdx);
    let rest = str.slice(nextIdx).trim();

    if (open === '@' && !parts.length) {
      tag.key = substr;
      parts.push(tag.key);

      if (tag.key === '@example') {
        parts.push(rest);
        tag = Object.assign({}, tok, tag);
        tag.description = tok.description;
        return parts;
      }
      return parts.concat(splitString(rest));
    }

    if (!tag.name) {
      tag.name = substr.trim();
      tag.description = rest;

    } else if (!tag.description) {
      tag.description = str;
    }

    parts.push(rest);
    return parts;
  }

  define(tag, 'tokens', splitString(input));
  tag.description = tag.description.trim();

  if (tag.description.slice(-2) === '}}') {
    tag.description = tag.description.slice(0, -2);
  }

  if (tag.description) {
    tag.description = tag.description.replace(/^ *- */, '');
  }

  tag.name = tag.name.trim();
  normalize.title(tag);

  define(tag, 'isTag', true);
  return tag;
};

function isBracket(ch) {
  return ch === '[' || ch === '{' || ch === '{' || ch === '<';
}

function update(arr, str) {
  if (!arr.length) arr.push('');
  arr[arr.length - 1] += str;
}
