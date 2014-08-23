/*!
 * parse-comments <https://github.com/jonschlinkert/parse-comments>
 * Originally based on https://github.com/caolan/scrawl
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

/**
 * Module dependencies
 */

var _ = require('lodash');
var arrayify = require('arrayify-compact');
var codeContext = require('code-context');
var lineCount = require('count-lines');
var inflect = require('inflection');
var range = require('extract-range');
var utils = require('./lib/utils');


var parser = module.exports = function parser(str, options) {
  var opts = _.extend({}, options);
  var arr = [];

  var context = codeContext(str);
  var len = context.length;
  var newObj = {};

  context.forEach(function (obj, i) {
    obj = obj || {};

    if (i < len + 1) {

      if (obj.type === 'comment') {
        var num = 0;
        if (context.length > 1) {
          num = i + 1;
        }

        var ctx = context[num];
        if (ctx) {
          var comment = range(str, obj.begin, obj.end);
          ctx.string = comment;

          var parsed = parser.extractComments(comment, opts);
          _.extend(ctx, parsed[0]);

          if (ctx.api !== 'private') {
            arr.push(_.omit(parser.normalizeHeading(ctx)));
          }
        }
      }
    }
  });

   return arr;
};


/**
 * Parse the parameters from a string.
 *
 * @param  {String} `param`
 * @return {Object}
 */

parser.parseParams = function(param) {
  var re = /(?:^\{([^\}]+)\}\s+)?(?:\[([\S]+)\]\s*)?(?:`([\S]+)`\s*)?([\s\S]*)?/;
  var match = param.match(re);

  var params = {
    type: match[1],
    name: match[3],
    description: (match[4] || '').replace(/^\s*-\s*/, '')
  };

  if (match[2]) {
    parser.parseSubprop(match, params);
  }

  return params;
};


/**
 * Parse the subproperties from parameters.
 *
 * @param  {String} `param`
 * @return {Object}
 */

parser.parseSubprop = function(match, params) {
  var subprop = match[2];

  if (/\./.test(subprop)) {
    var parts = subprop.split('.');
    var def = parts[1].split('=');
    params.name = def[0];
    params._default = def[1] || null;
    subprop = parts[0];
  }

  params.parent = subprop;
  return params;
};


/**
 * Parse the parameters from a string.
 *
 * @param  {String} `param`
 * @return {Object}
 */

parser.mergeSubprops = function(comments, subprop) {
  if (comments.hasOwnProperty(subprop) && typeof comments[subprop] === 'object') {
    var o = {};

    comments[subprop].forEach(function (child) {
      o[child.parent] = o[child.parent] || [];
      o[child.parent].push(child);
      delete child.parent;
    });

    if (comments.hasOwnProperty('params')) {
      comments.params = comments.params.map(function (param) {
        if (o[param.name]) {
          param[subprop] = o[param.name];
        }
        return param;
      });
    }

  }
  return comments;
};


/**
 * Parse `@return` comments.
 *
 * @param  {String} `str`
 * @return {Object}
 */

parser.parseReturns = function(str) {
  var match = /^\{([^\}]+)\}/.exec(str);
  if (match) {
    return match[1];
  }
  return;
};


/**
 * Parse the "lead" from a description.
 *
 * @param  {String} `str`
 * @return {Object}
 */

parser.parseLead = function(str) {
  var re = /^([\s\S]+?)(?:\n\n)/;

  var lead = '';
  var description = str.replace(re, function (match, a) {
    lead += a.replace(/\n/g, ' ');
    return match.replace(a, '');
  });

  return {
    desc: description,
    lead: lead
  };
};


/**
 * Parse the method name from a string.
 *
 * @param  {String} `str`
 * @return {Object}
 */

parser.parseHeading = function(str) {
  var re = /(#{1,6})\s+(\.?[\s\S]+?)(?:(\([\s\S]+\)?)|$)/;
  var match = str.match(re);
  if (match) {
    return {
      level: match[1].split('').length,
      text: match[2].replace(/^\s*|\s*$/gm, ''),
    };
  }
};


/**
 * Parse the method name from a string.
 *
 * @param  {String} `str`
 * @return {Object}
 */

parser.splitHeading = function (str) {
  var lines = str.split(/\n\n/g);
  var obj = {}, non = [];

  lines.forEach(function (line) {
    if (/^#/.test(line)) {
      obj = parser.parseHeading(line);
    } else {
      non.push(line);
    }
  });
  return {heading: obj, desc: non};
};


/**
 * Normalize the title based on the given fields.
 *
 * @param  {String} `obj`
 * @return {Object}
 */

parser.normalizeHeading = function(obj) {
  var o = _.extend({}, obj);
  o.name = obj.name || '';
  o.heading = {};
  o.heading.level = 2;

  // @method tags
  if (o.hasOwnProperty('method')) {
    o.type = 'method';
  }

  // @class tags
  if (o.hasOwnProperty('class')) {
    o.type = 'class';
    o.heading.level = 1;
  } else {
    o.heading.level = 2;
  }

  var heading =
    o.name ||
    o.class ||
    o.method || '';

  o.heading.text = heading.replace(/^`|`$/g, '');
  o.name = o.heading.text;
  return o;
};


/**
 * Parse `@tags`.
 *
 * @param  {Object} `comment` A comment object.
 * @param  {Object} `options`
 * @return {Object}
 */

parser.parseTags = function (comment, options) {
  var opts = options || {};
  var extracted = {};

  // strip trailing whitespace from description
  if (comment.description) {
    comment.description = utils.trimRight(comment.description);
    extracted = parser.splitHeading(comment.description);

    // Extract headings from comments
    comment.description = extracted.desc.join('\n\n');

    // Extract leads from comments
    var parsedDesc = parser.parseLead(comment.description);
    comment.lead = parsedDesc.lead;
    comment.description = parsedDesc.desc;
  }

  var h = extracted.heading || {};
  comment.heading = h;
  comment.name = h.text;

  if (h && !h.text) {
    _.extend(comment, parser.normalizeHeading(comment));
  }
  comment.name = (comment.name || '').replace(/`/g, '');

  // @example tags, strip trailing whitespace
  if (comment.example) {
    comment.example = utils.trimRight(comment.example);
  }

  // parse @param tags (`singular: plural`)
  var props = _.extend({
    return  : 'returns',
    param   : 'params',
    property: 'properties',
    option  : 'options'
  }, opts.subprops);

  props = _.omit(props, ['api', 'constructor', 'class', 'static', 'type']);

  _.keys(props).forEach(function(key) {
    var value = props[key];
    if (comment[key]) {

      var arr = comment[key] || [];
      comment[value] = arrayify(arr).map(function (str) {
        return parser.parseParams(str);
      });
    }
  });

  return comment;
};



parser.parseComment = function (content, options) {
  var opts = options || {};

  var re = /^(\s*@[\S]+)\s*(.*)/;
  var afterTags = false;
  var lines = content.split('\n');
  var afterNewLine = false;
  var lastTag;
  var props = [];

  var i = 0;

  var comment = lines.reduce(function (c, str) {
    var line = utils.stripStars(str);
    if (/\s*@/.test(line)) {
      line = line.replace(/^\s+/, '');
    }

    if (line) {
      var match = line.match(re);

      if (match) {
        afterTags = true;
        var tagname = match[1].replace(/@/, '');
        props.push(tagname);

        var tagvalue = match[2].replace(/^\s+/, '');
        lastTag = tagname;
        if (c.hasOwnProperty(tagname)) {
          // tag already exists
          if (!Array.isArray(c[tagname])) {
            c[tagname] = [c[tagname]];
          }

          c[tagname].push(tagvalue);
        } else {
          // new tag
          c[tagname] = tagvalue || true;
        }
      } else if (lastTag && !afterNewLine) {
        var val = line.replace(/^\s+/, '');
        if (Array.isArray(c[lastTag])) {
          c[lastTag][c[lastTag].length - 1] += ' ' + val;
        } else {
          c[lastTag] += ' ' + val;
        }
      } else {
        lastTag = null;
        if (!afterTags) {
          if (c.description) {
            c.description += '\n' + line;
          } else {
            c.description = line;
          }
        } else {
          if (c.example) {
            c.example += '\n' + line;
          } else {
            c.example = line;
          }
        }
      }
      afterNewLine = false;
    } else {
      afterNewLine = true;
      if (!afterTags) {
        if (c.description) {
          c.description += '\n' + line;
        }
      } else {
        if (c.example) {
          c.example += '\n' + line;
        }
      }
    }
    i++;
    return c;
  }, {});


  var singular = _.keys(opts.subprops);
  var plural = _.values(opts.subprops);

  var diff = _.difference(props, singular).filter(function (prop) {
    return prop !== 'param' &&
      prop !== 'constructor' &&
      prop !== 'return' &&
      prop !== 'static' &&
      prop !== 'class' &&
      prop !== 'type' &&
      prop !== 'api';
  });

  var pluralized = diff.map(function(name) {
    return inflect.pluralize(name);
  });

  singular = _.union(diff, singular);
  plural = _.union([], pluralized, plural);

  var comments = this.parseTags(comment, {
    subprops: _.zipObject(singular, plural)
  });

  // Pass custom subprops (plural/arrays)
  plural.forEach(function (prop) {
    this.mergeSubprops(comments, prop);
  }.bind(this));

  return comments;
};



/**
 * Parse comments
 * @param   {String}  str
 * @return  {String}
 */


parser.extractComments = function (str, options) {
  var opts = _.extend({}, options);

  var re = /\/\*{1,2}([\s\S]*?)\*\//g;
  var data = [];


  var lineNumber = 1;
  var match;

  while (match = re.exec(str)) {
    var _str = str;

    // add lines from before the comments
    lineNumber += lineCount(_str.substr(0, match.index));
    str = str.substr(match.index + match[1].length);
    var params = parser.parseComment(match[1], opts);

    params.line = lineNumber;

    // Allow @words to be escaped with a single backtick, e.g. `@word,
    // then remove the backtick before the final result.
    if (params.description) {
      params.description = params.description.replace(/^`@/gm, '@');
    }

    data.push(params);

    // add lines from the comment itself
    lineNumber += lineCount(_str.substr(match.index, match[1].length));
  }
  return data;
};
