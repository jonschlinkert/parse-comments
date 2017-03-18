'use strict';

var get = require('get-value');
var set = require('set-value');
var Snapdragon = require('snapdragon');
var Emitter = require('component-emitter');
var define = require('define-property');
var extend = require('extend-shallow');
var extract = require('extract-comments');
var tokenize = require('tokenize-comment');
var parseType = require('./lib/parse/type');
var parseTag = require('./lib/parse/tag');
var utils = require('./lib/utils');

/**
 * Create an instance of `Comments` with the given `options`.
 *
 * @param {Object|String} `options` Pass options if you need to instantiate Comments, or a string to convert HTML to markdown.
 * @api public
 */

function Comments(options) {
  if (typeof options === 'string') {
    var proto = Object.create(Comments.prototype);
    Comments.call(proto);
    return proto.render.apply(proto, arguments);
  }

  if (!(this instanceof Comments)) {
    var proto = Object.create(Comments.prototype);
    Comments.call(proto);
    return proto;
  }

  this.define('cache', {});
  this.options = extend({}, options);
  this.parsers = {};
  this.tokens = [];
  this.plugins = {
    fns: [],
    middleware: {},
    before: {},
    after: {}
  };
}

/**
 * Inherit Emitter
 */

Emitter(Comments.prototype);

Comments.prototype.parser = function(name, fn) {
  this.parsers[name] = fn;
  return this;
};

/**
 * Register a compiler plugin `fn`. Plugin functions should take an
 * options object, and return a function that takes an instance of
 * comments.
 *
 * ```js
 * // plugin example
 * function yourPlugin(options) {
 *   return function(comments) {
 *     // do stuff
 *   };
 * }
 * // usage
 * comments.use(yourPlugin());
 * ```
 *
 * @param {Function} `fn` plugin function
 * @return {Object} Returns the comments instance for chaining.
 * @api public
 */

Comments.prototype.use = function(fn) {
  this.plugins.fns = this.plugins.fns.concat(fn);
  return this;
};

/**
 * Set a non-enumerable property or method on the comments instance.
 * Useful in plugins for defining methods or properties for to be used
 * inside compiler handler functions.
 *
 * ```js
 * // plugin example
 * comments.use(function() {
 *   this.define('appendFoo', function(node) {
 *     node.val += 'Foo';
 *   });
 * });
 *
 * // then, in a compiler "handler" function
 * comments.set('text', function(node) {
 *   if (node.something === true) {
 *     this.appendFoo(node);
 *   }
 *   this.emit(node.val);
 * });
 * ```
 * @param {String} `name` Name of the property or method being defined
 * @param {any} `val` Property value
 * @return {Object} Returns the instance for chaining.
 * @api public
 */

Comments.prototype.define = function(name, val) {
  define(this, name, val);
  return this;
};

/**
 * Register a handler function to be called on a node of the given `type`.
 * Override a built-in handler `type`, or register a new type.
 *
 * ```js
 * comments.set('param', function(node) {
 *   // do stuff to node
 * });
 * ```
 * @param {String} `type` The `node.type` to call the handler on. You can override built-in middleware by registering a handler of the same name, or register a handler for rendering a new type.
 * @param {Function} `fn` The handler function
 * @return {Object} Returns the instance for chaining.
 * @api public
 */

Comments.prototype.set = function(type, fn) {
  if (Array.isArray(type)) {
    for (var i = 0; i < type.length; i++) {
      this.set(type[i], fn);
    }
  } else {
    this.plugins.middleware[type] = fn;
  }
  return this;
};

/**
 * Register a handler that will be called by the compiler on every node
 * of the given `type`, _before other middleware are called_ on that node.
 *
 * ```js
 * comments.before('param', function(node) {
 *   // do stuff to node
 * });
 *
 * // or
 * comments.before(['param', 'returns'], function(node) {
 *   // do stuff to node
 * });
 *
 * // or
 * comments.before({
 *   param: function(node) {
 *     // do stuff to node
 *   },
 *   returns: function(node) {
 *     // do stuff to node
 *   }
 * });
 * ```
 * @param {String|Object|Array} `type` Handler name(s), or an object of middleware
 * @param {Function} `fn` Handler function, if `type` is a string or array. Otherwise this argument is ignored.
 * @return {Object} Returns the instance for chaining.
 * @api public
 */

Comments.prototype.before = function(type, fn) {
  if (utils.isObject(type)) {
    for (var key in type) {
      if (type.hasOwnProperty(key)) {
        this.before(key, type[key]);
      }
    }
  } else if (Array.isArray(type)) {
    for (var i = 0; i < type.length; i++) {
      this.before(type[i], fn);
    }
  } else {
    this.plugins.before[type] = (this.plugins.before[type] || []).concat(fn);
  }
  return this;
};

/**
 * Register a handler that will be called by the compiler on every node
 * of the given `type`, _after other middleware are called_ on that node.
 *
 * ```js
 * comments.after('param', function(node) {
 *   // do stuff to node
 * });
 *
 * // or
 * comments.after(['param', 'returns'], function(node) {
 *   // do stuff to node
 * });
 *
 * // or
 * comments.after({
 *   param: function(node) {
 *     // do stuff to node
 *   },
 *   returns: function(node) {
 *     // do stuff to node
 *   }
 * });
 * ```
 * @param {String|Object|Array} `type` Handler name(s), or an object of middleware
 * @param {Function} `fn` Handler function, if `type` is a string or array. Otherwise this argument is ignored.
 * @return {Object} Returns the instance for chaining.
 * @api public
 */

Comments.prototype.after = function(type, fn) {
  if (utils.isObject(type)) {
    for (var key in type) {
      if (type.hasOwnProperty(key)) {
        this.after(key, type[key]);
      }
    }
  } else if (Array.isArray(type)) {
    for (var i = 0; i < type.length; i++) {
      this.after(type[i], fn);
    }
  } else {
    this.plugins.after[type] = (this.plugins.after[type] || []).concat(fn);
  }
  return this;
};

/**
 * Run plugin functions on a node of the given `type`.
 *
 * @param {String} `type` Either `before` or `after`
 * @param {Object} `compiler` Snapdragon compiler instance
 * @return {Function} Returns a function that takes a `node`. Any plugins registered for that `node.type` will be run on the node.
 */

Comments.prototype.run = function(type, compiler) {
  var plugins = this.plugins[type];
  return function(node) {
    var fns = plugins[node.type] || [];

    for (var i = 0; i < fns.length; i++) {
      var plugin = fns[i];
      if (typeof plugin !== 'function') {
        var err = new TypeError('expected plugin to be a function:' + plugin);
        err.node = node;
        err.type = type;
        throw err;
      }
      node = plugin.call(compiler, node) || node;
    }
    return node;
  };
};

/**
 * Tokenize a single javascript comment.
 *
 * ```js
 * var parser = new ParseComments();
 * var tokens = parser.tokenize([string]);
 * ```
 * @param {String} `javascript` String of javascript
 * @param {Object} `options`
 * @return {Object} Returns an object with `description` string, array of `examples`, array of `tags` (strings), and a `footer` if descriptions are defined both before and after tags.
 * @api public
 */

Comments.prototype.tokenize = function(str, options) {
  return tokenize(str, extend({}, this.options, options));
};

/**
 * Extracts and parses code comments from the given `str` of JavaScript.
 *
 * ```js
 * var parser = new ParseComments();
 * var comments = parser.parse(string);
 * ```
 * @param {String} `str` String of javascript
 * @param {Object} `options`
 * @return {Array} Array of objects.
 * @api public
 */

Comments.prototype.parse = function(str, options) {
  return this.extract(str, options, function(comment) {
    return this.parseComment(comment, options);
  });
};

/**
 * Parse a single code comment.
 *
 * ```js
 * var parser = new ParseComments();
 * var comments = parser.parseComment(string);
 * ```
 * @param {String} `str` JavaScript comment
 * @param {Object} `options`
 * @return {Object} Parsed comment object
 * @api public
 */

Comments.prototype.parseComment = function(comment, options) {
  var opts = extend({}, this.options, options);
  var parsers = extend({}, this.parsers, opts.parse);

  if (typeof parsers.comment === 'function') {
    return parsers.comment.call(this, comment, opts);
  }

  if (typeof comment === 'string') {
    return this.parse.apply(this, arguments)[0];
  }

  var tok = this.tokenize(comment.val, opts);
  this.tokens.push(tok);

  comment = extend({}, comment, tok);
  var tags = [];

  for (var i = 0; i < comment.tags.length; i++) {
    var raw = comment.tags[i];
    var tag = this.parseTag(raw, opts);

    if (tag) {
      define(tag, 'raw', raw);
      tags.push(tag);
    }
  }

  comment.tags = tags;

  var name = get(comment, 'code.context.name');
  if (name) {
    set(this.cache, name, comment);
  }
  return comment;
};

/**
 * Parses a single tag from a code comment. For example, each of the following
 * lines is a single tag
 *
 * ```js
 * @constructor
 * @param {String}
 * @param {String} name
 * @param {String} name The name to use for foo
 * ```
 *
 * @param {Object} tok Takes a token from
 * @return {Object}
 * @api public
 */

Comments.prototype.parseTag = function(tok, options) {
  var opts = extend({}, this.options, options);
  var parsers = extend({}, this.parsers, opts.parse);

  if (typeof tok === 'string') {
    tok = { raw: tok, val: tok };
  }

  if (typeof parsers.tag === 'function') {
    return parsers.tag.call(this, tok.raw, opts);
  }

  var tag = parseTag(tok);
  if (tag && tag.invalid === true) {
    return null;
  }
  if (tag && tag.rawType) {
    tag.type = this.parseType(tag.rawType.slice(1, -1));
  }
  return tag;
};

/**
 * Parses the types from a single tag.
 *
 * ```js
 * @param {String}
 * @param {String|Array}
 * @param {(String|Array)}
 * @param {{foo: bar}}
 * ```
 *
 * @param {String} val The
 * @return {Object}
 * @api public
 */

Comments.prototype.parseType = function(val, tag, options) {
  if (typeof val !== 'string') {
    throw new TypeError('expected a string');
  }

  var opts = extend({}, this.options, options);
  var parsers = extend({}, this.parsers, opts.parse);

  if (typeof parsers.type === 'function') {
    return parsers.type.call(this, val, tag, opts);
  }

  return parseType(val, tag, options);
};

Comments.prototype.parseParamType = function(str, options) {
  if (typeof str !== 'string') {
    throw new TypeError('expected a string');
  }

  var opts = extend({}, this.options, options);
  var parsers = extend({}, this.parsers, opts.parse);

  if (typeof parsers.paramType === 'function') {
    return parsers.paramType.call(this, str, opts);
  }

  return str;
};

Comments.prototype.decorate = function(name, obj) {
  var fn = this.decorators[name];
  if (typeof fn === 'function') {
    fn.call(this, obj);
  }
};

Comments.prototype.extract = function(str, options, fn) {
  if (typeof options === 'function') {
    fn = options;
    options = {};
  }

  var opts = extend({}, this.options, options);
  var comments = [];
  var res = [];

  if (typeof opts.extract === 'function') {
    comments = utils.arrayify(opts.extract.call(this, str, opts));
  } else {
    comments = extract(str, opts);
  }

  for (var i = 0; i < comments.length; i++) {
    if (this.isValid(comments[i]) === false) {
      continue;
    }

    var comment = this.normalize(comments[i]);

    if (typeof fn === 'function') {
      comment = fn.call(this, comment) || comment;
    } else {
      comment = comment;
    }

    this.emit('comment', comment);
    res.push(comment);
  }

  return res;
};

Comments.prototype.normalize = function(comment, options) {
  var opts = extend({}, this.options, options);

  if (typeof opts.normalize === 'function') {
    return opts.normalize.call(this, comment, opts);
  }

  var newComment = utils.copyNode(comment);
  newComment.code = utils.copyNode(comment.code);
  newComment.code.context = utils.copyNode(comment.code.context);
  return newComment;
};

/**
 * Returns true if the given `comment` is valid. By default, comments
 * are considered valid when they begin with `/**`, and do not contain
 * `jslint`, `jshint`, `eshint`, or `eslint`. A custom `isValid` function may be
 * passed on the constructor options.
 *
 * @param {Object} `comment`
 * @param {Object} `options`
 * @return {Boolean}
 * @api public
 */

Comments.prototype.isValid = function(comment, options) {
  if (!utils.isObject(comment)) {
    throw new TypeError('expected comment to be an object');
  }

  var opts = extend({}, this.options, options);
  if (typeof opts.isValid === 'function') {
    return opts.isValid(comment);
  }

  if (opts.allowSingleStar !== true) {
    if (comment.type !== 'block' || comment.raw.charAt(0) !== '*') {
      return false;
    }
  }

  if (comment.raw.charAt(1) === '!') {
    return false;
  }

  if (/^\s*eslint(?:-\S|\s*([^:]+?:))/.test(comment.val)) {
    return false;
  }

  return !/^\s*(es|js)(hint|lint)/.test(comment.val);
};

/**
 * Getter for lazily instantiating Snapdragon when `.parse` or
 * `.compile` is called.
 */

Object.defineProperty(Comments.prototype, 'snapdragon', {
  set: function(snapdragon) {
    define(this, '_snapdragon', snapdragon);
  },
  get: function() {
    if (!this._snapdragon) {
      this._snapdragon = new Snapdragon(this.options);
    }
    return this._snapdragon;
  }
});

/**
 * Expose `Comments`
 * @type {Constructor}
 */

module.exports = Comments;
