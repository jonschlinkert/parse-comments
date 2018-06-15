'use strict';

const Schema = require('map-schema');
const union = require('union-value');
const inflection = require('inflection');
const normalize = require('./normalize');
const utils = require('./utils');

function formatType(type, tag, comment) {
  tag.types = tag.types || [];
  if (!type) return;

  const schema = new Schema()
    .field('type', 'string', {
      normalize(val) {
        switch (val) {
          case 'AllLiteral':
            tag.types = ['all'];
            break;
          case 'OptionalType':
            tag.optional = true;
            break;
          case 'NullableType':
            tag.nullable = true;
            break;
          case 'NonNullableType':
            tag.nullable = false;
            break;
          default:
            break;
        }
        return val;
      }
    })
    .field('name', 'string', {
      normalize(val) {
        if (utils.isString(val)) {
          if (val === '*') val = 'any';
          if (tag.types.indexOf(val) === -1) {
            tag.types.push(val);
          }
        }
        return val;
      }
    })
    .field('key', 'string', {
      normalize(val) {
        if (utils.isString(val)) {
          tag.name = val;
        }
        return val;
      }
    })
    .field('nodes', 'array', {
      normalize(val) {
        if (Array.isArray(val)) {
          for (var i = 0; i < val.length; i++) {
            schema.normalize(val[i]);
          }
        }
        return val;
      }
    });

  return schema.normalize(type);
}

function formatTag(tag, comment) {
  const schema = new Schema()
    .field('key', 'string', {
      normalize(val) {
        switch (val) {
          case 'const':
          case 'constant':
            return 'constant';

          case 'ctor':
          case 'constructor':
            return 'ctor';

          case 'fn':
          case 'func':
          case 'function':
            return 'function';

          case 'arg':
          case 'argument':
          case 'param':
          case 'parameter':
            return 'param';

          case 'prop':
          case 'property':
            return 'prop';

          case 'return':
          case 'returns':
            return 'returns';

          case 'var':
          case 'variable':
            return 'variable';

          default: {
            return val;
          }
        }
      }
    })
    .field('default', '*', {
      normalize(val) {
        if (utils.isString(val)) {
          tag.default = val;
          tag.optional = true;
        }
        return val;
      }
    })
    .field('description', 'string')
    .field('title', 'string', {
      normalize(val) {
        const key = normalize.key(tag);
        switch (key) {
          case 'class':
          case 'classdesc':
          case 'constant':
          case 'copyright':
          case 'deprecated':
          case 'description':
          case 'event':
          case 'external':
          case 'file':
          case 'function':
          case 'kind':
          case 'lends':
          case 'member':
          case 'memberof':
          case 'mixin':
          case 'module':
          case 'name':
          case 'namespace':
          case 'summary':
          case 'typedef':
            // assumed to be singletons, and are flattened to a top-level
            // property on the result whose value is extracted from the tag.
            comment[key] = tag;
            break;
          case 'augments':
          case 'example':
          case 'param':
          case 'prop':
          case 'property':
          case 'returns':
          case 'option':
          case 'see':
          case 'throws':
          case 'todo':
            // flatten to a top-level array property
            union(comment.tag, pluralize(val), tag);
            break;
          case 'global':
          case 'inner':
          case 'instance':
          case 'stack':
            // The "@global", "@static", "@instance", and "@inner" tags are
            // flattened to a "scope" property that may have one of the
            // following values: "global", "static", "instance", or "inner".
            comment.scope = val;
            break;
          case 'interface':
            comment[val] = tag.name || 'anonymous';
            break;
          case 'ignore':
            comment[val] = true;
            comment.access = 'private';
            comment.api = 'private';
            break;
          case 'private':
          case 'protected':
          case 'public':
            if (comment.ignore === true) {
              break;
            }
            // The "@access", "@public", "@protected", and "@private" tags
            // are flattened to an "access" property whose value is "protected"
            // or "private". The assumed default value is "public", so
            // "@access public" or "@public" tags result in no "access" property.
            comment[val] = true;
            comment.access = val;
            comment.api = val;
            break;
          case 'api':
          case 'access':
            // The "@access", "@public", "@protected", and "@private"
            // tags are flattened to an "access" property whose value
            // is "protected" or "private". The assumed default value
            // is "public", so "@access public" or "@public" tags result
            // in no "access" property being defined.
            comment[tag.name] = true;
            comment.access = tag.name;
            comment.api = tag.name;
            break;

          default: {
            return val;
          }
        }

        return val;
      }
    })
    .field('type', 'object', {
      normalize(val) {
        return formatType(val, tag, comment);
      }
    });

  return schema.normalize(tag);
}

function formatCode(code, comment, cache) {
  const schema = new Schema()
    .field('val', 'string', val => val)
    .field('context', 'object', function(context) {
      switch (context.type) {
        case 'class':
        case 'constructor':
          throw new Error('unsupported context.type: ' + context.type);
        case 'declaration':
          throw new Error('unsupported context.type: ' + context.type);
        case 'expression':
          throw new Error('unsupported context.type: ' + context.type);
        case 'function':
          throw new Error('unsupported context.type: ' + context.type);
        case 'method':
          if (context.receiver) {
            const prop = context.receiver + '.' + context.name;
            // set(comment.prop, comment);
            console.log(context);
          }

          break;
        case 'property':
          if (context.receiver) {
            const prop = context.receiver + '.' + context.name;
            // set(comment.prop, comment);
            console.log(context);
          }

          break;
        case 'prototype method':
          throw new Error('unsupported context.type: ' + context.type);
        case 'prototype property':
          throw new Error('unsupported context.type: ' + context.type);
        case 'prototype':
          throw new Error('unsupported context.type: ' + context.type);
        case 'statement':
          throw new Error('unsupported context.type: ' + context.type);
        default: {
          // do nothing
          break;
        }
      }

      if (context.name && typeof comment.name === 'undefined') {
        comment.name = context.name;
      }
      return context;
    });
  return schema.normalize(code);
}

function formatComment(comment, options) {
  var cache = this.cache || {};
  comment.tag = comment.tag || {};
  comment.is = comment.is || {};

  var schema = new Schema()
    .field('tags', function(tags) {
      for (var i = 0; i < tags.length; i++) {
        formatTag(tags[i], comment);
      }
      return tags;
    })
    .field('code', 'object', {
      normalize(val) {
        console.log(cache);
        return formatCode(val, comment, cache);
      }
    })
    .field('name', 'string', {
      normalize(val) {
        if (comment.access !== 'public') return;

        if (val && cache.ctor) {
          val = cache.ctor + '#' + val;
        }
        console.log(val);
        return val;
      }
    })
    .field('title', 'string', {
      normalize(val) {
        return val || comment.name;
      }
    });

  const res = schema.normalize(comment);
  // console.log(res.tag.params);
  return res;
}

function Type(name, types, description) {
  if (name) this.name = name;
  if (types) this.types = types;
  if (description) this.description = description;
}

function pluralize(str) {
  return inflection.pluralize(str);
}

module.exports = formatComment;
