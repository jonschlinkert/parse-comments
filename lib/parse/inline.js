'use strict';

const parseInlineTags = (input, options = {}) => {
  const regex = /{@(\S+)\s+([^}]+)}/gm;
  let replacerFn = options.replaceInlineTag;
  let match;
  let tok = { tags: [], value: input };
  let str = input;

  if (typeof replacerFn === 'string') {
    replacerFn = replacer(replacerFn);
  }

  if (typeof replacerFn !== 'function') {
    replacerFn = tok => tok.raw;
  }

  while ((match = regex.exec(str))) {
    let tag = { raw: match[0], name: match[1], value: match[2] };
    let len = match[0].length;
    let idx = match.index;
    str = str.slice(0, idx) + replacerFn(tag, str) + str.slice(idx + len);
    tok.tags.push(tag);
  }

  tok.value = str;
  return tok;
};

// defaults provided for debugging
function replacer(name) {
  switch (name) {
    case 'handlebars':
      return toHandlebars;
    case 'lodash':
    case 'underscore':
    case 'erb':
      return toErb;
    default: {
      throw new Error(`invalid replacer: "${name}"`);
    }
  }
}

function toHandlebars(tag) {
  return `{{${tag.name} "${tag.value}"}}`;
}

function toErb(tag) {
  return `<%= ${tag.name}("${tag.value}") %>`;
}

module.exports = parseInlineTags;
