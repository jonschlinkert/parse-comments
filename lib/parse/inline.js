'use strict';

var extend = require('extend-shallow');

module.exports = function inlineTags(input, options) {
  var opts = extend({}, options);
  var replacerFn = opts.replaceInlineTag;
  var regex = /{@(\S+)\s+([^}]+)}/gm;
  var match;
  var tok = { tags: [], val: input };
  var str = input;
  var pos = 0;

  if (typeof replacerFn === 'string') {
    replacerFn = replacer(replacerFn);
  }

  if (typeof replacerFn !== 'function') {
    replacerFn = function(tok) {
      return tok.raw;
    };
  }

  while ((match = regex.exec(str))) {
    var tag = {raw: match[0], name: match[1], val: match[2]};
    var len = match[0].length;
    var idx = match.index;
    str = str.slice(0, idx) + replacerFn(tag, str) + str.slice(idx + len);
    tok.tags.push(tag);
  }

  tok.val = str;
  return tok;
};

function replacer(name) {
  switch (name) {
    case 'handlebars':
      return toHandlebars;
    case 'lodash':
    case 'underscore':
    case 'erb':
      return toErb;
    default: {
      throw new Error('invalid replacer: "' + name + '"');
    }
  }
}

function toHandlebars(tag) {
  return '{{' + tag.name + ' "' + tag.val + '"}}';
}

function toErb(tag) {
  return '<%= ' + tag.name + '("' + tag.val + '") %>';
}
