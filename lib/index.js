/*!
 * parse-comments <https://github.com/jonschlinkert/parse-comments>
 *
 * NOTE: Although substantially changed, this was
 * originally based on https://github.com/caolan/scrawl
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var arrayify = require('arrayify-compact');
var codeContext = require('code-context');
var lineCount = require('count-lines');
var range = require('extract-range');
var utils = require('./utils');



var parser = module.exports = function parser(str) {
  var o = {};
  o.comments = parser.extractComments(str);

  var context = codeContext(str);
  var len = context.length;

  var c = context.filter(function (obj, i) {
    if (i < len + 1) {
      if (obj && obj.type === 'comment') {
        var next = context[i + 1];
        if (next) {
          next.comment = {};

          var comment = range(str, obj.begin, obj.end);
          var parsed = parser.extractComments(comment)[0];

          if (next.type !== 'comment') {
            for (var key in parsed) {
              if (parsed.hasOwnProperty(key) && key !== 'line') {
                next.comment[key] = parsed[key];
              }
            }
            for (var prop in obj) {
              if (obj.hasOwnProperty(prop) && prop !== 'type') {
                next[prop] = obj[prop];
              }
            }
            next = parser.normalizeHeading(next);
            return false;
          }
        }
      }
    }
    return o;
  });
  o.context = c;
  return o;
};


/**
 * ## .parseParams
 *
 * Parse the parameters from a string.
 *
 * @param  {String} `param`
 * @return {Object}
 */

parser.parseParams = function(param) {
  var re = /(?:^\{([^\}]+)\}\s+)?(?:\[([\S]+)]\s*)?(?:`([\S]+)`\s*)?([\s\S]*)?/;
  var match = param.match(re);

  var params = {
    type: match[1],
    name: match[3],
    description: (match[4] || '').replace(/^\s*-\s*/, '')
  };
  if (match[2]) {
    params.parent = match[2];
  }
  return params;
};


var each = function(fn, obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      return fn(obj[key], key);
    }
  }
  return obj;
};

/**
 * ## .moveParams
 *
 * Parse the parameters from a string.
 *
 * @param  {String} `param`
 * @return {Object}
 */

parser.moveParams = function(comments, subprop) {
  var o = {};
  if (comments[subprop]) {
    comments[subprop].forEach(function (child) {
      o[child.parent] = o[child.parent] || [];
      o[child.parent].push(child);
      delete child.parent;
    });
    comments.params = comments.params.map(function (param) {
      if (o[param.name]) {
        param[subprop] = o[param.name];
      }
      return param;
    });
  }
  return comments;
};


/**
 * ## .parseReturns
 *
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
 * ## .parseHeading
 *
 * Parse the method name from a string.
 *
 * @param  {String} `str`
 * @return {Object}
 */

parser.parseHeading = function(str) {
  var re = /#{1,6}\s+([\s\S]+?)(?:(\([\s\S]+\)?)|$)/;
  var match = str.match(re);
  if (match) {
    return match[1].replace(/^\s*|\s*$/gm, '');
  }
};


/**
 * ## .extractHeading
 *
 * Parse the method name from a string.
 *
 * @param  {String} `str`
 * @return {Object}
 */

parser.extractHeading = function(str) {
  var lines = str.split(/\n\n/g);
  var heading, non = [];

  lines.forEach(function(line) {
    line = line.replace(/^\s*|\s*$/gm, '');
    if (/^#/.test(line)) {
      heading = parser.parseHeading(line);
    } else {
      non.push(line);
    }
  });
  return {heading: heading, desc: non};
};


/**
 * ## .parseLead
 *
 * Parse the method name from a string.
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


parser.parseTags = function (comment) {
  var heading;

  // strip trailing whitespace from description
  if (comment.description) {
    comment.description = utils.trimRight(comment.description);
    var extractHeading = parser.extractHeading(comment.description);

    // Extract headings from comments
    heading = extractHeading.heading;
    comment.description = extractHeading.desc.join('\n\n');

    // Extract leads from comments
    var parsedDesc = parser.parseLead(comment.description);
    comment.lead = parsedDesc.lead;
    comment.description = parsedDesc.desc;
  }

  comment.heading = heading || '';

  // @method tags
  if (comment.method) {
    comment.method = comment.method.replace(/`/g, '');
  }

  // @example tags, strip trailing whitespace
  if (comment.example) {
    comment.example = utils.trimRight(comment.example);
  }

  // parse @param tags (`singular: plural`)
  var props = {
    param:    'params',
    property: 'properties'
  };

  Object.keys(props).forEach(function(key) {
    var value = props[key];
    var obj = {};
    if (comment[key]) {
      var arr = comment[key] || [];
      comment[value] = arrayify(arr).map(function (str) {
        return parser.parseParams(str);
      });
    }
  });

  // parse @returns tags
  comment.returns = comment.returns || comment.return;
  if (comment.returns) {
    comment.returns = parser.parseReturns(comment.returns);
  }
  return comment;
};



parser.parseComment = function (str) {
  var re = /^\s*@([\S]+)\s*(.*)/;
  var afterTags = false;
  var lines = str.split('\n');
  var afterNewLine = false;
  var lastTag;

  var i = 0;

  var comment = lines.reduce(function (c, str) {
    var line = utils.stripStars(str);

    if (line) {
      var match = line.match(re);

      if (match) {
        afterTags = true;
        var tagname = match[1];
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

  var comments = parser.parseTags(comment);

  var n = parser.moveParams(comments, 'properties');
  console.log(n);
  return comments;
};


parser.normalizeHeading = function(obj) {
  obj.heading = {};

  if (obj.hasOwnProperty('constructor') ||
    obj.hasOwnProperty('class')) {

    obj.heading.level = 1;
  } else {
    obj.heading.level = 2;
  }

  if (obj.name) {
    obj.heading.text =
      obj.class ||
      obj.method ||
      obj.name;
  }
  return obj;
};


/**
 * Parse comments
 * @param   {String}  str
 * @return  {String}
 */

parser.extractComments = function (str, options) {
  options = options || {};
  var re = /\/\*{1,2}([\s\S]*?)\*\//g;
  var data = [];

  var fn = options.fn || function(params) {
    return /private/.test(params.api);
  };

  var lineNumber = 1;
  var match;

  while (match = re.exec(str)) {
    var _str = str;

    // add lines from before the comments
    lineNumber += lineCount(_str.substr(0, match.index));
    str = str.substr(match.index + match[1].length);
    var params = parser.parseComment(match[1]);
    params.line = lineNumber;

    // Allow @words to be escaped with a single backtick, e.g. `@word,
    // then remove the backtick before the final result.
    if (/^\`\@/gm.test(params.description)) {
      params.description = params.description.replace(/^`@/gm, '@');
    }

    if (!fn(params)) {
      data.push(params);
    }

    // add lines from the comment itself
    lineNumber += lineCount(_str.substr(match.index, match[1].length));
  }
  return data;
};
