'use strict';

var normalize = require('./normalize');
var format = module.exports;

format.comment = function(comment, options) {
  if (options && typeof options.format === 'function') {
    return options.format(comment);
  }

  comment.raw = new Buffer(comment.raw);
  comment.val = new Buffer(comment.val);

  comment.tag = comment.tag || {};
  comment.tags = format.tags(comment.tags, comment, options);
  return comment;
};

format.tags = function(tags, comment, options) {
  var res = [];
  for (var i = 0; i < tags.length; i++) {
    var tag = format.tag(tags[i], comment, options);
    if (tag && tag.invalid !== true) {
      var obj = comment.tag[normalize.key(tag)] = {};
      if (tag.description) {
        obj.description = tag.description || '';
      }
      if (tag.types.length) {
        obj.types = tag.types;
      }
      // console.log(tag)
      res.push(tag);
    }
  }
  return res;
};

format.tag = function(tag, comment, options) {
  switch (tag.title) {
    case 'api':
      comment[tag.name] = true;
      break;
    case 'public':
    case 'private':
    case 'protected':
      comment[tag.title] = true;
      break;
  }

  tag.types = tag.types || [];
  tag.type = format.type(tag.type, tag, comment, options);
  return tag;
};

format.type = function(type, tag, comment, options) {
  if (!type) return;

  if (type.type === 'OptionalType') {
    tag.optional = true;
  }

  if (type.nodes) {
    for (var i = 0; i < type.nodes.length; i++) {
      format.type(type.nodes[i], tag, comment, options);
    }
  } else {
    if (type.expression) {
      format.type(type.expression, tag, comment, options);
    } else {

      if (!type.name) {
        throw new Error('no name');
      }

      tag.types.push(type.name);
    }
  }

  return type;
};
