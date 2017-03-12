'use strict';

var get = require('get-value');
var set = require('set-value');
var isObject = require('isobject');
var Snapdragon = require('snapdragon');
var Emitter = require('component-emitter');
var extract = require('extract-comments');
var define = require('define-property');
var extend = require('extend-shallow');
var tokenize = require('tokenize-comment');
var utils = require('./lib/utils');
var types = require('./lib/types');
var tags = require('./lib/tags');

/**
 * Create an instance of `Comments` with the given `options`.
 *
 * @param {Object|String} `options` Pass options if you need to instantiate Comments, or a string to convert HTML to markdown.
 * @api public
 */

function Comments(options) {
  if (typeof options === 'string') {
    let proto = Object.create(Comments.prototype);
    Comments.call(proto);
    return proto.render.apply(proto, arguments);
  }

  if (!(this instanceof Comments)) {
    let proto = Object.create(Comments.prototype);
    Comments.call(proto);
    return proto;
  }

  this.define('cache', {});
  this.options = extend({}, options);
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
  if (isObject(type)) {
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
  if (isObject(type)) {
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
 * Parses a string of `javascript` and returns an AST.
 *
 * ```js
 * var comments = new Comments();
 * var ast = comments.parse([string]);
 * ```
 * @param {String} `javascript` String of javascript
 * @param {Object} `options`
 * @return {Object} AST (abstract syntax tree)
 * @api public
 */

Comments.prototype.parse = function(str, options) {
  let opts = extend({}, this.options, options);
  let ast = { type: 'root', nodes: [] };

  this.extract(str, options, function(comment) {
    // console.log('-----');
    comment.tags = [];

    let name = get(comment, 'code.context.name');

    if (typeof name === 'undefined') {
      return comment;
    }

    let tok = this.tokenize(comment.val, opts);
    this.tokens.push(tok);

    let tags = tok.tags.slice();
    let len = tags.length;
    let idx = -1;

    set(this.cache, name, comment);

    while (++idx < len) {
      let tag = tok.tags[idx];
      // console.log(tag)
      let node = this.parseTag(tag.val, opts);
      node.type = tag.key;
      ast.nodes.push(node);
      node.parent = ast;
      define(node, 'parent', ast);
      comment.tags.push(tag.key);

      // if (types.indexOf(tag.key) === -1) {
      //   types.push(tag.key);
      // }
    }
    // console.log(tok)

    // let ast = this.snapdragon.parse(node.val.trim(), opts);
    // console.log(ast);
    // ast.type = 'comment';
    // ast.nodes = ast.nodes.slice(1, ast.nodes.length - 1);
    // // console.log(ast);

    return comment;
  });

  // console.log(this.cache);

  // console.log(types)
  ast.nodes.unshift({type: 'bos'});
  ast.nodes.push({type: 'eos'});
  return ast;
};

Comments.prototype.parseTypes = function(str, options) {
  return this.typeParser.parse(str, options);
};

Comments.prototype.parseTag = function(str, options) {
  return this.tagParser.parse(str, options);
  // switch (tag.key) {
  //   case 'api':
  //     break;
  //   case 'kind':
  //     break;
  //   case 'license':
  //     break;
  //   case 'module':
  //     break;
  //   case 'name':
  //     break;
  //   case 'option':
  //     break;
  //   case 'param':
  //     break;
  //   case 'private':
  //     break;
  //   case 'protected':
  //     break;
  //   case 'public':
  //     break;
  //   case 'return':
  //   case 'returns':
  //     break;
  // }
};

Comments.prototype.tokenize = function(str, options) {
  return tokenize(str, extend({}, this.options, options));
};

Comments.prototype.filter = function(comment, options) {
  if (!isObject(comment)) {
    throw new TypeError('expected comment to be an object');
  }
  var opts = extend({}, this.options, options);
  if (typeof opts.filter === 'function') {
    return opts.filter(comment);
  }
  if (comment.type !== 'block' || comment.raw.charAt(0) !== '*') {
    return false;
  }
  if (comment.raw.charAt(1) === '!') {
    return false;
  }
  return !/(jslint|jshint|eshint)/.test(comment.val);
};

Comments.prototype.extract = function(str, options, fn) {
  if (typeof options === 'function') {
    fn = options;
    options = {};
  }

  var opts = extend({}, this.options, options);
  var extractFn = opts.extractFn || extract;
  var comments = extractFn(str, opts);

  for (var i = 0; i < comments.length; i++) {
    var comment = comments[i];

    if (this.filter(comment) === false) {
      continue;
    }

    var token = utils.copyNode(comment);
    token.code = utils.copyNode(comment.code);
    token.code.context = utils.copyNode(comment.code.context);

    this.emit('token', token);
    if (typeof fn === 'function') {
      comments[i] = fn.call(this, token) || token;
    } else {
      comments[i] = token;
    }
  }

  return comments;
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
 * Getter for lazily instantiating Snapdragon when `.parse` or
 * `.compile` is called.
 */

Object.defineProperty(Comments.prototype, 'typeParser', {
  set: function(typeParser) {
    define(this, '_typeParser', typeParser);
  },
  get: function() {
    if (!this._typeParser) {
      this._typeParser = new Snapdragon(this.options);
      this._typeParser.use(types(this, this.options));
    }
    return this._typeParser;
  }
});

/**
 * Getter for lazily instantiating Snapdragon when `.parse` or
 * `.compile` is called.
 */

Object.defineProperty(Comments.prototype, 'tagParser', {
  set: function(tagParser) {
    define(this, '_tagParser', tagParser);
  },
  get: function() {
    if (!this._tagParser) {
      this._tagParser = new Snapdragon(this.options);
      this._tagParser.use(tags(this, this.options));
    }
    return this._tagParser;
  }
});

/**
 * Expose `Comments`
 * @type {Constructor}
 */

module.exports = Comments;
