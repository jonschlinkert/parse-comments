/*!
 * parse-comments <https://github.com/jonschlinkert/parse-comments>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

/**
 * Module dependencies
 */

var _ = require('lodash');
var arrayify = require('arrayify-compact');
var codeBlocks = require('gfm-code-blocks');
var codeContext = require('code-context');
var inflect = require('inflection');
var utils = require('./lib/utils');


function parser(str, opts) {
  var comments = parser.codeContext(str, opts);

  return comments.filter(function (o) {
    return !_.isEmpty(o);
  });
}

parser.nolinks = [];
parser.links = {};


/**
 * Extract code comments, and merge in code context.
 *
 * @param  {String} `str`
 * @return {Array} Array of comment objects.
 */

parser.codeContext = function (str, options) {
  var opts = _.merge({}, options);
  var context = codeContext(str);
  return context.map(function (o, i) {
    var comment = {};
    o = o || {};

    var next = i;
    if (i < context.length - 1) {
      next = i + 1;
    }
    if (o.hasOwnProperty('comment')) {
      o.comment = parser.parseComment(o.comment, opts);
      comment = _.merge({}, o, o.comment);
      comment.context = context[next];
      _.merge(comment, parser.parseDescription(comment));
      _.merge(comment, parser.parseExamples(comment));
    }

    delete comment.comment;
    delete comment.type;
    return comment;
  });
};


/**
 * Normalize descriptions.
 *
 * @param  {Object} `comment`
 * @return {Object}
 */

parser.normalizeDesc = function (comment) {
  var o = {};

  // strip trailing whitespace from description
  comment.description = utils.trimRight(comment.description);

  // separate heading from description
  o = parser.splitHeading(comment.description);

  // Extract headings from comments
  comment.description = o.desc.join('\n\n');
  comment.heading = o.heading;

  // Extract leads from comments
  var parsedDesc = parser.parseLead(comment.description);
  comment.lead = parsedDesc.lead;
  comment.description = parsedDesc.desc;
  return comment;
};


/**
 * Parse code examples from a `comment.description`.
 *
 * @param  {Object} `comment`
 * @return {Object}
 */

parser.parseDescription = function (comment) {
  // strip trailing whitespace from description
  if (comment.description) {
    _.merge(comment, parser.normalizeDesc(comment));
    comment.heading = comment.heading || o.heading;
  }

  comment = _.merge({}, comment, parser.normalizeHeading(comment));

  // @example tags, strip trailing whitespace
  if (comment.example) {
    comment.example = utils.trimRight(comment.example);
  }
  return comment;
};

/**
 * Parse code examples from a `comment.description`.
 *
 * @param  {Object} `comment`
 * @return {Object}
 */

parser.parseExamples = function (comment) {
  var examples = codeBlocks(comment.description);
  if (!_.isEmpty(examples)) {
    comment.examples = examples;
  }
  return comment;
};


/**
 * Parse the parameters from a string.
 *
 * @param  {String} `param`
 * @return {Object}
 */

parser.parseParams = function (param) {
  var re = /(?:^\{([^\}]+)\}\s+)?(?:\[([\S]+)\]\s*)?(?:`([\S]+)`\s*)?([\s\S]*)?/;

  if (typeof param !== 'string') {
    return {};
  }

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

parser.parseSubprop = function (match, params) {
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

parser.mergeSubprops = function (comments, subprop) {
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

parser.parseReturns = function (str) {
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

parser.parseLead = function (str) {
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

parser.parseHeading = function (str) {
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

parser.normalizeHeading = function (obj) {
  var o = _.merge({}, obj);
  obj.context = obj.context || {};

  o.name = obj.name || obj.context.name || null;

  o.heading = o.heading || {};
  o.heading.level = o.heading.level || 2;

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


  // Strip backticks from headings
  o.heading.text = (o.heading.text || heading).replace(/^[`\.]|`$/gm, '');
  o.name = o.heading.text || null;

  // optionally prefix prototype methods with `.`
  if (o.context && o.context.type &&
    /(?:prototype )?(?:method|property)/.test(o.context.type)) {
    o.heading.prefix = '.';
  }

  return o;
};


/**
 * Parse sub-headings from a string.
 *
 * @param  {String} `str`
 * @return {Object}
 */

parser.parseSubHeading = function (str) {
  var re = /^\*\*([\s\S]+?):?\*\*(?!\*)/;
  var match = str.match(re);
  if (match) {
    return match[1];
  }
};


/**
 * Parse links.
 *
 * @param  {String} `str`
 * @return {Object}
 */

parser.parseLink = function (str) {
  var re = /^!?\[((?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*)\]\(\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*\)/;
  var match = str.match(re);
  if (match) {
    return {
      text: match[1],
      url: match[2],
      alt: match[3]
    }
  }
};


/**
 * Parse nolinks.
 *
 * @param  {String} `str`
 * @return {Object}
 */

parser.parseNolink = function (str) {
  var nolink = /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/;
  var ref = /^!?\[((?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*)\]\s*\[([^\]]*)\]/;
  var match;
  if (match = str.match(nolink)) {
    return match[0];
  } else if (match = str.match(ref)) {
    return match[0];
  }
};


/**
 * Extract links
 *
 * @param {Object} `c` Comment object.
 * @param {String} `line`
 */

parser.extractLinks = function (c, line) {
  var href = parser.parseLink(line);
  if (href) {
    parser.links[href.text] = href;
  }

  var nolink = parser.parseNolink(line);
  if (nolink) {
    parser.nolinks.push(nolink);
  }

  c.subheads = c.subheads || [];
  var subhead = parser.parseSubHeading(line);
  if (subhead) {
    c.subheads.push(subhead);
  }
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

  // parse @param tags (`singular: plural`)
  var props = _.merge({
    return  : 'returns',
    param   : 'params',
    property: 'properties',
    option  : 'options'
  }, opts.subprops);

  props = _.omit(props, ['api', 'constructor', 'class', 'static', 'type']);

  _.keys(props).forEach(function (key) {
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


/**
 * Parse comments from the given `content` string with the
 * specified `options.`
 *
 * @param  {String} `content`
 * @param  {Object} `options`
 * @return {Object}
 */

parser.parseComment = function (content, options) {
  content = content.replace(/\r/g, '');
  var opts = options || {};

  var afterNewLine = false;
  var afterTags = false;
  var props = [];
  var lastTag;
  var i = 0;

  var lines = content.split(/\n/g);


  var comment = lines.reduce(function (c, str) {
    // strip leading asterisks
    var line = utils.stripStars(str);

    if (/\s*@/.test(line)) {
      line = line.replace(/^\s+/, '');
    }

    if (line) {
      parser.extractLinks(c, line);

      var match = line.match(/^(\s*@[\S]+)\s*(.*)/);
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

  var pluralized = diff.map(function (name) {
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


module.exports = parser;
