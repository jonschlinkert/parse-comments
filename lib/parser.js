'use strict';

const Emitter = require('events');
const Node = require('snapdragon-node');
const Position = require('./position');

/**
 * Create a new `Parser` with the given `string` and `options`.
 *
 * ```js
 * let Snapdragon = require('snapdragon');
 * let Parser = Snapdragon.Parser;
 * let parser = new Parser();
 * ```
 * @param {String} `string`
 * @param {Object} `options`
 * @api public
 */

class Parser extends Emitter {
  constructor(options) {
    super();
    this.options = Object.assign({ source: 'string' }, options);
    this.init(this.options);
  }

  init(options) {
    this.input = '';
    this.string = '';
    this.consumed = '';

    this.count = 0;
    this.loc = {
      index: 0,
      column: 1,
      line: 0
    };

    this.parsers = this.parsers || {};
    this.types = this.types || [];
    this.sets = this.sets || {};
    this.fns = this.fns || [];
    this.tokens = [];
    this.stack = [];

    this.typeStack = [];
    this.setStack = [];

    const pos = this.position();
    this.bos = pos(this.node({ type: 'bos', value: '' }));
    this.ast = pos(this.node({ type: this.options.type || 'root' }));

    this.ast.push(this.bos);
    this.nodes = [this.ast];
  }

  /**
   * Define a non-enumberable property on the `Parser` instance. This is useful
   * in plugins, for exposing methods inside handlers.
   *
   * ```js
   * parser.define('foo', 'bar');
   * ```
   * @name .define
   * @param {String} `key` propery name
   * @param {any} `value` property value
   * @return {Object} Returns the Parser instance for chaining.
   * @api public
   */

  define(key, value) {
    define(this, key, value);
    return this;
  }

  /**
   * Create a new [Node](#node) with the given `value` and `type`.
   *
   * ```js
   * parser.node('/', 'slash');
   * ```
   * @name .node
   * @param {Object} `value`
   * @param {String} `type`
   * @return {Object} returns the [Node](#node) instance.
   * @api public
   */

  node(value, type) {
    return new Node(value, type);
  }

  /**
   * Mark position and patch `node.position`.
   *
   * ```js
   * parser.set('foo', function(node) {
   *   let pos = this.position();
   *   let match = this.match(/foo/);
   *   if (match) {
   *     // call `pos` with the node
   *     return pos(this.node(match[0]));
   *   }
   * });
   * ```
   * @name .position
   * @return {Function} Returns a function that takes a `node`
   * @api public
   */

  position() {
    let start = { line: this.line, column: this.column };
    return node => {
      node.define('position', new Position(start, this));
      return node;
    };
  }

  /**
   * Add parser `type` with the given visitor `fn`.
   *
   * ```js
   *  parser.set('all', function() {
   *    let match = this.match(/^./);
   *    if (match) {
   *      return this.node(match[0]);
   *    }
   *  });
   * ```
   * @name .set
   * @param {String} `type`
   * @param {Function} `fn`
   * @api public
   */

  set(type, fn) {
    if (this.types.indexOf(type) === -1) {
      this.types.push(type);
    }
    this.parsers[type] = fn.bind(this);
    return this;
  }

  /**
   * Get parser `type`.
   *
   * ```js
   * let fn = parser.get('slash');
   * ```
   * @name .get
   * @param {String} `type`
   * @api public
   */

  get(type) {
    return this.parsers[type];
  }

  /**
   * Push a node onto the stack for the given `type`.
   *
   * ```js
   * parser.set('all', function() {
   *   let match = this.match(/^./);
   *   if (match) {
   *     let node = this.node(match[0]);
   *     this.push(node);
   *     return node;
   *   }
   * });
   * ```
   * @name .push
   * @param {String} `type`
   * @return {Object} `token`
   * @api public
   */

  push(type, token) {
    this.sets[type] = this.sets[type] || [];
    this.count++;
    this.stack.push(token);
    this.setStack.push(token);
    this.typeStack.push(type);
    return this.sets[type].push(token);
  }

  /**
   * Pop a token off of the stack of the given `type`.
   *
   * ```js
   * parser.set('close', function() {
   *   let match = this.match(/^\}/);
   *   if (match) {
   *     let node = this.node({
   *       type: 'close',
   *       value: match[0]
   *     });
   *
   *     this.pop(node.type);
   *     return node;
   *   }
   * });
   * ```
   * @name .pop
   * @param {String} `type`
   * @returns {Object} Returns a token
   * @api public
   */

  pop(type) {
    if (this.sets[type]) {
      this.count--;
      this.stack.pop();
      this.setStack.pop();
      this.typeStack.pop();
      return this.sets[type].pop();
    }
  }

  /**
   * Return true if inside a "set" of the given `type`. Sets are created
   * manually by adding a type to `parser.sets`. A node is "inside" a set
   * when an `*.open` node for the given `type` was previously pushed onto the set.
   * The type is removed from the set by popping it off when the `*.close`
   * node for the given type is reached.
   *
   * ```js
   * parser.set('close', function() {
   *   let pos = this.position();
   *   let m = this.match(/^\}/);
   *   if (!m) return;
   *   if (!this.isInside('bracket')) {
   *     throw new Error('missing opening bracket');
   *   }
   * });
   * ```
   * @name .isInside
   * @param {String} `type`
   * @return {Boolean}
   * @api public
   */

  isInside(type) {
    if (typeof type === 'undefined') {
      return this.count > 0;
    }
    if (!Array.isArray(this.sets[type])) {
      return false;
    }
    return this.sets[type].length > 0;
  }

  /**
   * Get the previous AST node from the `parser.stack` (when inside a nested
   * context) or `parser.nodes`.
   *
   * ```js
   * let prev = this.prev();
   * ```
   * @name .prev
   * @return {Object}
   * @api public
   */

  prev(n) {
    return this.stack.length > 0 ? last(this.stack, n) : last(this.nodes, n);
  }

  /**
   * Update line and column based on `str`.
   */

  consume(len) {
    this.string = this.string.substr(len);
  }

  /**
   * Returns the string up to the given `substring`,
   * if it exists, and advances the cursor position past the substring.
   */

  advanceTo(str, i) {
    let idx = this.string.indexOf(str, i);
    if (idx !== -1) {
      let value = this.string.slice(0, idx);
      this.consume(idx + str.length);
      return value;
    }
  }

  /**
   * Update column based on `str`.
   */

  updatePosition(str, len) {
    let lines = str.match(/\n/g);
    if (lines) this.loc.line += lines.length;
    let i = str.lastIndexOf('\n');
    this.loc.column = ~i ? len - i : this.loc.column + len;
    this.consumed += str;
    this.consume(len);
  }

  /**
   * Match `regex`, return captures, and update the cursor position by `match[0]` length.
   *
   * ```js
   * // make sure to use the starting regex boundary: "^"
   * let match = this.match(/^\./);
   * ```
   * @name .prev
   * @param {RegExp} `regex`
   * @return {Object}
   * @api public
   */

  match(regex) {
    let m = regex.exec(this.string);
    if (m) {
      this.updatePosition(m[0], m[0].length);
      return m;
    }
  }

  /**
   * Push `node` to `parent.nodes` and assign `node.parent`
   */

  pushNode(node, parent) {
    if (node && parent) {
      if (parent === node) parent = this.ast;
      define(node, 'parent', parent);

      if (parent.nodes) {
        parent.nodes.push(node);
      }
    }
  }

  /**
   * Capture end-of-string
   */

  eos() {
    if (this.string) return;
    let pos = this.position();
    let node = pos(this.node(this.append || '', 'eos'));

    define(node, 'parent', this.ast);
    return node;
  }

  /**
   * Run parsers to advance the cursor position
   */

  getNext() {
    let consumed = this.consumed;
    let len = this.types.length;
    let idx = -1;

    while (++idx < len) {
      let type = this.types[idx];
      let tok = this.parsers[type].call(this);
      if (tok === true) {
        break;
      }

      if (tok) {
        tok.type = tok.type || type;
        define(tok, 'rest', this.string);
        define(tok, 'consumed', consumed);
        this.last = tok;
        this.tokens.push(tok);
        this.emit('node', tok);
        return tok;
      }
    }
  }

  /**
   * Run parsers to get the next AST node
   */

  advance() {
    let string = this.string;
    this.pushNode(this.getNext(), this.prev());

    // if we're here and string wasn't modified, throw an error
    if (this.string && string === this.string) {
      let err = new Error('no parser for: "' + this.string.slice(0, 10));
      if (this.listenerCount('error') > 0) {
        this.emit('error', err);
      } else {
        throw err;
      }
    }
  }

  /**
   * Parse the given string an return an AST object.
   *
   * ```js
   * let ast = parser.parse('foo/bar');
   * ```
   * @param {String} `string`
   * @return {Object} Returns an AST with `ast.nodes`
   * @api public
   */

  parse(string) {
    if (typeof string !== 'string') {
      throw new TypeError('expected a string');
    }

    this.init(this.options);
    this.input = string;
    this.string = string;

    // run parsers
    while (this.string) this.advance();

    // balance unmatched sets, if not disabled
    balanceSets(this, this.stack.pop());

    // create end-of-string node
    let eos = this.eos();
    let ast = this.prev();
    if (ast.type === 'root') {
      this.pushNode(eos, ast);
    }
    return this.ast;
  }
}

function balanceSets(parser, node) {
  if (node && parser.options.strict === true) {
    throw parser.error(`imbalanced "${node.type}": "${parser.input}"`);
  }
  if (node && node.nodes && node.nodes.length) {
    node.nodes[0].value = '\\' + node.nodes[0].value;
  }
}

function last(arr = []) {
  return arr[arr.length - 1];
}

/**
 * Returns true if value is an object
 */

function isObject(val) {
  return val && typeof val === 'object' && !Array.isArray(val);
}

function hasOpenAndClose(node) {
  return (
    isObject(node) &&
    typeof node.type === 'string' &&
    node.nodes &&
    node.nodes.length >= 2 &&
    node.nodes[0].type === node.type + '.open' &&
    node.nodes[node.nodes.length - 1].type === node.type + '.close'
  );
}

/**
 * Define a non-enumerable property on `obj`
 */

function define(obj, key, value) {
  Reflect.defineProperty(obj, key, {
    configurable: true,
    value
  });
}

/**
 * Expose `Parser`
 */

module.exports = Parser;
