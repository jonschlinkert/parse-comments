'use strict';

const parseInlineTags = (input, options = {}) => {
  const regex = /(?<!`){@(\S+)(?:\s+([^}]+))?}(?<!`)/gm;
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
    let [raw, name, value = ''] = match;
    let tag = { raw, name, value };
    let idx = match.index;
    str = str.slice(0, idx) + replacerFn(tag, str) + str.slice(idx + raw.length);
    tok.tags.push(tag);
  }

  tok.value = str;
  return tok;
};

// defaults provided for debugging
function replacer(name) {
  switch (name) {
    case 'handlebars':
      return tag => `{{${tag.name} "${tag.value}"}}`;
    case 'lodash':
    case 'underscore':
    case 'erb':
      return tag => `<%= ${tag.name}("${tag.value}") %>`;
    default: {
      throw new Error(`invalid replacer name: "${name}"`);
    }
  }
}

module.exports = parseInlineTags;
