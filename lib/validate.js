'use strict';

var expects = require('./expects');
var normalize = require('./normalize');
var isNumber = require('is-number');

exports.tag = function(tag, options) {
  var key = normalize.key(tag);
  if (typeof key === 'undefined') {
    throw new Error('expected tag to have a name or key');
  }

  switch (key) {
    case 'access':
      switch (tag.access) {
        case 'private':
        case 'protected':
        case 'public':
          break;
        default: {
          tag.errors = tag.errors || [];
          tag.errors.push('Invalid access name "' + tag.access + '"');
          break;
        }
      }
      break;
    case 'kind':
      switch (tag.kind) {
        case 'class':
        case 'constant':
        case 'event':
        case 'external':
        case 'file':
        case 'function':
        case 'member':
        case 'mixin':
        case 'module':
        case 'namespace':
        case 'typedef':
          break;
        default: {
          tag.errors = tag.errors || [];
          tag.errors.push('Invalid kind name "' + tag.kind + '"');
          break;
        }
      }
      break;
    case 'inner':
    case 'instance':
    case 'global':
    case 'readonly':
    case 'static':
      if (options.strict && tag.description) {
        tag.errors = tag.errors || [];
        tag.errors.push('@' + key + ' cannot have a description in strict mode');
      }
      break;
    case 'this':
      if (tag.type && !tag.name) {
        tag.errors = tag.errors || [];
        tag.errors.push('Invalid name for @this');
      }
      if (!tag.type && !tag.name) {
        tag.errors = tag.errors || [];
        tag.errors.push('expected @this tag to have type and name properties');
      }
      break;
    case 'variation':
      if (!isNumber(tag.variation)) {
        tag.errors = tag.errors || [];
        tag.errors.push('Invalid variation "' + tag.variation + '"');
      }
      break;
    default: {
      break;
    }
  }

  if (options.strict === true) {
    if (!tag.name && expects.name(tag)) {
      return;
    }

    if (tag.name && !isValidTagName(tag.name)) {
      return;
    }
  }

  return tag;
};

function isValidTagName(str) {
  return /^[\w,:*?!=[{(|)}\]<>"'\/.]+$/.test(str);
}
