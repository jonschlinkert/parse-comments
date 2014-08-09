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

var utils = require('./utils');


/**
 * Parse comments
 * @param   {String}  str
 * @return  {String}
 */

var parse = module.exports = function (str, fn) {
  var match, comments = [];
  var lineNumber = 1;

  fn = fn || function(comment) {
    return /private/.test(comment.api);
  };

  while (match = (/\/\*\*([\s\S]*?)\*\//g).exec(str)) {
    var _str = str;

    // add lines from before the comment
    lineNumber += utils.countNewLines(_str.substr(0, match.index));
    str = str.substr(match.index + match[1].length);
    var comment = parse.parseComment(match[1]);
    comment.line = lineNumber;

    // Allow @words to be escaped with a single backtick, e.g. `@word,
    // then remove the backtick before the final result.
    if (/^\`\@/gm.test(comment.description)) {
      comment.description = comment.description.replace(/^`@/gm, '@');
    }

    if (!fn(comment)) {
      comments.push(comment);
    }

    // add lines from the comment itself
    lineNumber += utils.countNewLines(_str.substr(match.index, match[1].length));
  }
  return comments;
};


/**
 * ## .parseParams
 *
 * Parse the parameters from a string.
 *
 * @param  {String} `param`
 * @return {Object}
 */

parse.parseParams = function(param) {
  var re = /(?:^\{([^\}]+)\}\s+)?(?:`([\S]+)`\s*)?([\s\S]*)?/;
  var match = param.match(re);

  return {
    type: match[1],
    name: match[2],
    description: (match[3] || '').replace(/^\s*-\s*/, '')
  };
};


/**
 * ## .parseReturns
 *
 * Parse `@return` comments.
 *
 * @param  {String} `str`
 * @return {Object}
 */

parse.parseReturns = function(str) {
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

parse.parseHeading = function(str) {
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

parse.extractHeading = function(str) {
  var lines = str.split(/\n\n/g);
  var heading, non = [];

  lines.forEach(function(line) {
    line = line.replace(/^\s*|\s*$/gm, '');
    if (/^#/.test(line)) {
      heading = parse.parseHeading(line);
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

parse.parseLead = function(str) {
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


parse.parseTags = function (comment) {
  var heading;

  // strip trailing whitespace from description
  if (comment.description) {
    comment.description = utils.trimRight(comment.description);
    var extractHeading = parse.extractHeading(comment.description);

    // Extract headings from comments
    heading = extractHeading.heading;
    comment.description = extractHeading.desc.join('\n\n');

    // Extract leads from comments
    var parsedDesc = parse.parseLead(comment.description);
    comment.lead = parsedDesc.lead;
    comment.description = parsedDesc.desc;
  }

  comment.heading = heading || '';

  if (comment.method) {
    comment.method = comment.method.replace(/`/g, '');
  }

  // strip trailing whitespace from examples
  if (comment.example) {
    comment.example = utils.trimRight(comment.example);
  }

  // parse @param tags
  if (comment.param) {
    var params = comment.param || [];
    params = !Array.isArray(params) ? [params] : params;
    comment.params = params.map(function (str) {
      return parse.parseParams(str);
    });
  }

  comment.returns = comment.returns || comment.return;

  // parse @returns tags
  if (comment.returns) {
    comment.returns = parse.parseReturns(comment.returns);
  }
  return comment;
};



parse.parseComment = function (str) {
  var afterTags = false;
  var lines = str.split('\n');
  var afterNewLine = false;
  var lastTag;

  var comment = lines.reduce(function (c, str) {
    var line = utils.stripStars(str);

    if (line) {
      var match = line.match(/^\s*@([\S]+)\s*(.*)/);

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
    return c;
  }, {});

  return parse.parseTags(comment);
};


