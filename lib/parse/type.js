'use strict';

var set = require('set-value');
var regex = require('floating-point-regex');
var isNumber = require('is-number');
var split = require('split-string');
var util = require('snapdragon-util');
var Node = require('snapdragon-node');
var define = require('define-property');
var extend = require('extend-shallow');
var utils = require('../utils');

module.exports = parse;

function parse(str, options) {
  if (typeof str !== 'string') {
    throw new TypeError('expected a string');
  }

  if (str.charAt(0) === '.' || str.slice(-1) === '.') {
    throw new Error('unexpected token');
  }

  // allow separator to be defined as a string
  if (typeof options === 'string') {
    options = {sep: options};
  }

  var opts = extend({}, options);
  var ast = new Node({ type: 'root', nodes: [] });
  var nodes = [ast];
  var stack = [];
  var cache = {};
  var depth = {
    brace: 0,
    bracket: 0,
    paren: 0,
    angle: 0
  };

  var bos = new Node({ type: 'bos' });
  ast.addNode(bos);

  function prev() {
    return stack.length
      ? utils.last(stack)
      : utils.last(nodes);
  }

  function last() {
    var parent = prev();
    if (parent.nodes) {
      parent = utils.last(parent.nodes);
    }
    return parent;
  }

  function isInside(type) {
    return depth[type] > 0;
  }

  function inside(node) {
    define(node, 'inside', {
      brace: isInside('brace'),
      bracket: isInside('bracket'),
      paren: isInside('paren'),
      angle: isInside('angle')
    });
  }

  function update(node, ch) {
    node = last(node);
    if (typeof node.val === 'string') {
      node.val += ch;
    } else {
      var tok = new Node({val: ch});
      inside(tok);
      node.addNode(tok);
    }
  }

  for (var i = 0; i < str.length; i++) {
    var ch = str[i];

    var parent = prev();
    var node;

    switch (ch) {
      case '{':
        node = new Node({
          type: 'brace',
          nodes: []
        });

        node.addNode(new Node({
          type: 'brace.open'
        }));

        inside(node);
        stack.push(node);
        parent.addNode(node);
        depth.brace++;
        break;
      case '}':
        node = stack.pop();
        expect(node, 'brace', 'missing opening "{"');

        node.addNode(new Node({
          type: 'brace.close'
        }));

        inside(node);
        depth.brace--;
        break;
      case '[':
        node = new Node({
          type: 'bracket',
          nodes: []
        });

        node.addNode(new Node({
          type: 'bracket.open'
        }));

        inside(node);
        stack.push(node);
        parent.nodes.push(node);
        depth.bracket++;
        break;
      case ']':
        node = stack.pop();
        expect(node, 'bracket', 'missing opening "["');

        node.addNode(new Node({
          type: 'bracket.close'
        }));

        inside(node);
        depth.bracket--;
        break;
      case '(':
        node = new Node({
          type: 'paren',
          nodes: []
        });

        node.addNode(new Node({
          type: 'paren.open'
        }));

        inside(node);
        stack.push(node);
        parent.addNode(node);
        depth.paren++;
        break;
      case ')':
        node = stack.pop();
        expect(node, 'paren', 'missing opening "("');

        node.addNode(new Node({
          type: 'paren.close'
        }));

        cache.type = 'UnionType';
        cache.inner = inner(node);

        inside(node);
        depth.paren--;
        break;
      case '<':
        node = new Node({
          type: 'angle',
          nodes: []
        });

        node.addNode(new Node({
          type: 'angle.open'
        }));

        inside(node);
        stack.push(node);
        parent.addNode(node);
        depth.angle++;
        break;
      case '>':
        node = stack.pop();
        expect(node, 'angle', 'missing opening "<"');

        node.addNode(new Node({
          type: 'angle.close'
        }));

        inside(node);
        depth.angle--;
        break;
      default: {
        if (ch === '"' || ch === '\'') {
          var close = getClose(str, ch, i + 1);
          if (close === -1) {
            throw new Error('unexpected quote');
          }

          if (close === str.length - 1) {
            return new Type(str.slice(i, close + 1));
          }

          ch = str.slice(i + 1, close);
          i = close;
        }

        node = last(parent);
        if (!node.val) {
          node = createNode(node, ch);
          parent.addNode(node);
        }

        if (ch === '|' && parent.type === 'root') {
          node.type = 'UnionType';
        }

        node.val += ch;
        break;
      }
    }
  }

  if (stack.length) {
    throw new Error('unexpected token');
  }

  ast.addNode(new Node({ type: 'eos' }));
  return updateType(ast);
};

function getClose(str, substr, startIndex) {
  var idx = str.indexOf(substr, startIndex);
  if (str.charAt(idx - 1) === '\\') {
    return getClose(str, substr, idx + 1);
  }
  return idx;
}

function updateType(ast) {
  var innerNodes = inner(ast);

  if (innerNodes.length === 1) {
    ast = innerNodes[0];
  } else {
    ast.nodes = innerNodes;
  }

  if (isPair(ast)) {
    if (ast.nodes.length === 2) {
      let node = createNode(ast.nodes[0]);
      ast.nodes.splice(1, 0, node);
    }

    if (ast.nodes.length === 3) {
      ast = inner(ast)[0];
    }
  }

  if (ast.type === 'root' && ast.nodes.length >= 2) {
    switch (ast.nodes[1].type) {
      case 'bracket':
        ast.type = 'TypeApplication';
        ast.expression = new Type('Array');
        ast.applications = [new Type(ast.nodes[0].val)];
        delete ast.nodes;
        // let rest = inner(ast.nodes[1]);
        // console.log(rest)
        break;
      case 'paren':
        if (ast.nodes[0].val === 'function') {
          ast.type = 'FunctionType';
          ast.params = [];
          ast.result = null;
          var nodes = inner(ast.nodes[1]);
          for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            var val = node.val;
            var args = split(val, ',');
            var len = args.length;
            var idx = -1;
            while (++idx < len) {
              ast.params.push(new Type(args[idx]));
            }
          }

          var rest = toString(ast.nodes[2]);
          if (rest) {
            // console.log(parse(rest.val.slice(1)));
          }

          delete ast.nodes;
        }
        break;
      default: {
        break;
      }
    }
  }

  return setType(ast);
}

function mapVisit(ast, fn) {
  for (var i = 0; i < ast.nodes.length; i++) {
    var node = ast.nodes[i];
    if (node.nodes) {
      mapVisit(node, fn);
    } else {
      fn(node, ast, i);
    }
  }
}

function isPair(node) {
  return node.type === 'paren'
    || node.type === 'brace'
    || node.type === 'bracket'
    || node.type === 'angle';
}

function setType(node) {
  define(node, 'val', node.val);

  switch (node.type) {
    case 'UnionType':
      return unionType(node);
    case 'RecordType':
      return recordType(node);
    case 'ArrayType':
      return arrayType(node);
    case 'FunctionType':
      return functionType(node);
    case null:
    case undefined:
    case '':
      node = parseFlags(node);
      return node;
    default: {
      return node;
    }
  }
}

function booleanType(node, val) {
  node.type = 'BooleanLiteralType';
  node.value = val === 'true';
  define(node, 'val', node.val);
  return node;
}

function unionType(node) {
  node.elements = [];
  var segs = node.val.split(/\s*\|\s*/);
  for (var i = 0; i < segs.length; i++) {
    var val = segs[i].trim();
    if (val) {
      node.elements.push(new Type(val));
    }
  }

  define(node, 'val', node.val);
  return node;
}

function arrayType(node) {
  node.elements = [];
  var segs = node.val.split(/\s*\,\s*/);
  for (var i = 0; i < segs.length; i++) {
    var val = segs[i].trim();
    if (val) {
      node.elements.push(new Type(val));
    }
  }

  define(node, 'val', node.val);
  return node;
}

function recordType(node) {
  node.fields = [];
  var segs = node.val.split(/\s*\,\s*/);

  for (var i = 0; i < segs.length; i++) {
    var seg = segs[i];
    var args = seg.split(/\s*:\s*/);
    if (args[0]) {
      node.fields.push(new Field(args[0], args[1]));
    }
  }

  define(node, 'val', node.val);
  return node;
}

function restType(node) {
  var val = node.val.slice(3);
  node.type = 'RestType';
  node.expression = new Type(val);

  var args = val.split(':');
  if (args.length > 1) {
    delete node.expression.name;
    delete node.expression.type;

    var exp = node.expression.expression = {};

    exp.name = args[0];
    exp.type = 'ParameterType';
    define(exp, 'val', args[1]);
    exp = parseFlags(exp);

    define(exp, 'prefix', exp.prefix);
    if (exp.type !== 'ParameterType') {
      node.expression.type = exp.type;
      exp.type = 'ParameterType';
    }
  }
  return node;
}

function functionType(node) {
  for (var i = 0; i < node.params.length; i++) {
    node.params[i] = new Param(node.params[i]);
  }
  define(node, 'val', node.val);
  return node;
}

function createNode(parent) {
  let node = new Node({val: ''});
  if (parent.type === 'brace.open') {
    node.type = 'RecordType';
  }
  if (parent.type === 'paren.open') {
    node.type = 'UnionType';
  }
  if (parent.type === 'bracket.open') {
    node.type = 'ArrayType';
  }
  return node;
}

function expect(node, type, msg) {
  if (!util.isNode(node) || node.type !== type) {
    throw new Error(msg);
  }
}

function elements(tok) {
  var types = tok.val.split(/\s*\|\s*/);
  var res = [];

  for (var i = 0; i < types.length; i++) {
    var name = types[i];

    if (name === 'true' || name === 'false') {
      res.push({
        type: 'BooleanLiteralType',
        value: name === 'true'
      });
    } else {
      res.push({val: name});
    }
  }
  return res;
}

function parseFlags(node) {
  let val = node.val.trim();
  let match = /^([!?=]*)([-a-z_.]+)([!?=]*)/i.exec(val);
  let prefix = match && (match[1] || match[3]);
  if (prefix && match[2]) {
    setFlags(node, prefix);
    node.expression = new Type(match[2]);
    node.prefix = !!match[1];
  } else if (val) {
    node = new Type(val);
  }
  return node;
}

function setFlags(node, ch) {
  var flags = ch.split('');
  for (var i = 0; i < flags.length; i++) {
    switch (flags[i]) {
      case '!':
        node.type = 'NonNullableType';
        define(node, 'nullable', false);
        break;
      case '?':
        node.type = 'NullableType';
        define(node, 'nullable', true);
        break;
      case '=':
        node.type = 'OptionalType';
        define(node, 'optional', true);
        break;
    }
  }
}

function Field(key, val) {
  this.type = 'FieldType';
  this.key = formatKey(key);

  if (utils.isString(val)) {
    this.value = new Type(val.trim());
  } else {
    this.value = null;
  }
}

function formatKey(str) {
  var key = str.trim();
  if (!isNumber(str)) {
    return key;
  }
  if (regex().test(key)) {
    return String(parseFloat(key));
  }
  return String(parseInt(key));
}

function Type(str) {
  var node = {};
  define(node, 'val', str.trim());
  var val = node.val;
  var ch = val.charAt(0);

  if (val.slice(0, 3) === '...') {
    return restType(node);
  }

  if (isNumber(val)) {
    node.type = 'NumericLiteralType';
    node.value = Number(val);
    return node;
  }

  if (val === 'true' || val === 'false') {
    node.type = 'BooleanLiteralType';
    node.value = val === 'true';
    return node;
  }

  if (ch === '"' || ch === '\'') {
    node.type = 'StringLiteralType';
    node.value = val.slice(1, -1);
    return node;
  }

  return new Name(val);
}

function Param(node) {
  var val = node.val || node.name;
  var args = val.split(':');
  var key = toString(args[0]);
  var val = toString(args[1]);
  var type = specialType(key);

  if (type === false) {
    this.name = key;
    this.type = 'NameExpression';
  } else {
    this.type = type;
  }

  if (val) {
    this.expression = new Name(val);
  }
}

function Name(val) {
  define(this, 'val', val);
  this.type = specialType(val);

  if (this.type === false) {
    this.type = 'NameExpression';
    this.name = val.trim();
  }
}

function specialType(ch) {
  switch (ch) {
    case '*':
      return 'AllLiteral';
    case '!':
      return 'NonNullableLiteral';
    case '?':
      return 'NullableLiteral';
    default: {
      return false;
    }
  }
}

function toString(val) {
  return utils.isString(val) ? val.trim() : null;
}

function inner(ast) {
  return ast.nodes.slice(1, ast.nodes.length - 1);
}
