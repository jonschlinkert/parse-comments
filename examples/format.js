'use strict';

var fs = require('fs');
var path = require('path');
var Schema = require('map-schema');
var Comments = require('..');
var comments = new Comments();

var fp = path.join(__dirname, 'fixtures/cache.js');

function normalizeType(type, tag, comment) {
  tag.types = tag.types || [];
  if (!type) return;

  var schema = new Schema()
    .field('name', 'string', {
      normalize: function(val) {
        if (typeof val === 'string') {
          if (val === '*') val = 'any';
          if (tag.types.indexOf(val) === -1) {
            tag.types.push(val);
          }
        }
        return val;
      }
    })
    .field('nodes', 'array', {
      normalize: function(val) {
        if (Array.isArray(val)) {
          for (var i = 0; i < val.length; i++) {
            schema.normalize(val[i]);
          }
        }
        return val;
      }
    })

  return schema.normalize(type);
}

function normalizeTag(tag, comment) {
  var schema = new Schema()
  .field('description', 'string')
  .field('title', 'string', {
    normalize: function(val) {
      switch (val) {
        case 'ctor':
        case 'constructor':
          comment.is.ctor = true;
          break;
        case 'api':
          comment[tag.name] = true;
          break;
        default:
          break;
      }

      // console.log(val);
      return val;
    }
  })
  .field('name', 'string')
  .field('type', 'object', {
    normalize: function(val, key, tag) {
      return normalizeType(val, tag, comment);
    }
  })
  return schema.normalize(tag);
}

function normalizeCode(code, comment) {
  var schema = new Schema()
  .field('val', 'string', function(val) {
    return val;
  })
  .field('context', 'object', function(val) {
    if (val.name && typeof comment.name === 'undefined') {
      comment.name = val.name;
    }
    return val;
  })
  return schema.normalize(code);
}

function normalizeComment(comment, cache) {
  comment.is = comment.is || {};

  var schema = new Schema()
    .field('tags', function(tags) {
      for (var i = 0; i < tags.length; i++) {
        normalizeTag(tags[i], comment);
      }
      return tags;
    })
    .field('code', 'object', {
      normalize: function(val) {
        return normalizeCode(val, comment);
      }
    })
    .field('name', 'string', {
      normalize: function(val) {
        if (!comment.public) return;
        if (comment.is.ctor) {
          cache.ctor = val;

        } else if (val && cache.ctor) {
          val = cache.ctor + '#' + val;
        } else if (val) {

          console.log(comment)
        } else {

        }

        return val;
      }
    })

  return schema.normalize(comment);
}

module.exports = normalizeComment;

// function parse(str, options) {
//   var arr = comments.parse(str, options);
//   var cache = {};
//   var res = [];

//   for (var i = 0; i < arr.length; i++) {
//     var comment = normalizeComment(arr[i], cache);
//     if (comment.public === true) {
//       res.push(comment);
//     }
//   }
//   return res;
// }

// parse(fs.readFileSync(fp, 'utf8'));
