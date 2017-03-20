'use strict';

var Snapdragon = require('snapdragon');
var regex = require('floating-point-regex');
var isNumber = require('is-number');
var define = require('define-property');
var extend = require('extend-shallow');
var utils = require('../utils');
var flags = require('./flags');

function parse(str, tag, options) {
  if (typeof str !== 'string') {
    throw new TypeError('expected a string');
  }

  if (str === '()') {
    return {
      type: 'UnionType',
      elements: []
    };
  }

  if (!utils.isObject(tag) || !tag.isTag) {
    options = tag;
    tag = {};
  }

  var snapdragon = new Snapdragon(options);
  var parser = snapdragon.parser;
  var ast = {};
  var field = null;
  var fields = [];

  parser.queue = [];
  parser.on('node', function(node) {
    if (node.val) {
      parser.queue.push(new Expression(node.val));
    }
  });

  parser
    .set('text', function() {
      var match = this.match(/^[-$\n\w_*.!?=#]+/);
      if (match) {
        var val = match[0];
        if (val === 'function') {
          ast.type = 'FunctionType';
          ast.params = [];
          ast.result = null;
          return true;
        }

        if (ast.type === 'RecordType') {
          if (field) {
            field.value = val;
            fields.push(field);
            field = null;
          } else {
            field = new Field(val);
          }
        }

        return this.node(val);
      }
    })

    .set('quote', function() {
      var match = this.match(/^["']/);
      if (match) {
        var open = match[0];
        var idx = utils.getClose(this.input, open, 0);
        if (idx === -1) {
          throw new Error('missing quote');
        }

        var val = this.input.slice(0, idx);
        this.consume(val.length + 1);

        if (val === 'function') {
          ast.type = 'FunctionType';
          ast.params = [];
          ast.result = null;
          return true;
        }

        if (ast.type === 'RecordType') {
          if (field) {
            field.value = val;
            fields.push(field);
            field = null;
          } else {
            field = new Field(val);
          }
        } else {
          this.queue.push(new Expression(val, 'StringLiteralType'));
        }

        return true;
      }
    })

    .set('comma', function() {
      var match = this.match(/^ *, */);
      if (match) {
        return true;
      }
    })

    .set('colon', function() {
      var match = this.match(/^ *: */);
      if (match) {
        var prev = this.prev();
        var last = utils.last(prev.nodes);
        if (last) {
          last.name = last.val;
          last.type = 'ParameterType';
          last.expression = {};
        }
        return true;
      }
    })

    .set('pipe', function() {
      var match = this.match(/^ *\| */);
      if (match) {
        var current = extend({}, ast);

        ast.type = 'UnionType';
        ast.elements = ast.elements || [];

        if (current.type === 'FunctionType') {
          ast.elements.push(current);
          current.result = this.queue.pop() || null;
          delete ast.params;
          delete ast.result;
        } else {
          ast.elements.push(this.queue.pop());
        }

        return true;
      }
    })

    .set('angle.open', function() {
      var match = this.match(/^ *< */);
      if (!match) return;

      var angle = this.node({
        type: 'angle',
        nodes: []
      });

      ast.type = 'TypeApplication';
      ast.expression = this.queue.pop();
      ast.applications = [];

      this.push('angle', angle);
      return angle;
    })

    .set('angle.close', function() {
      var match = this.match(/^ *> */);
      if (!match) return;

      var angle = this.pop('angle');
      angle.nodes.forEach(function(node) {
        if (node.val !== ',') {
          ast.applications.push(new Expression(node.val));
        }
      });
      return true;
    })

    .set('brace.open', function() {
      var match = this.match(/^ *\{ */);
      if (!match) return;

      var brace = this.node({
        type: 'brace',
        nodes: []
      });

      ast.type = 'RecordType';
      ast.fields = [];

      this.push('brace', brace);
      return brace;
    })

    .set('brace.close', function() {
      var match = this.match(/^ *\} */);
      if (!match) return;

      var brace = this.pop('brace');
      while (fields.length) {
        var field = fields.shift();
        ast.fields.push(new Field(field.key, field.value));
      }

      brace.nodes = [];
      return true;
    })

    .set('bracket.open', function() {
      var match = this.match(/^ *\[ */);
      if (!match) return;

      var bracket = this.node({
        type: 'bracket',
        nodes: []
      });

      this.push('bracket', bracket);
      return bracket;
    })

    .set('bracket.close', function() {
      var match = this.match(/^ *\] */);
      if (!match) return;

      var bracket = this.pop('bracket');

      if (bracket.nodes.length === 0) {
        ast.type = 'TypeApplication';
        ast.expression = new Expression('Array');
        ast.applications = [this.queue.pop()];
        return true;
      }

      ast.type = 'ArrayType';
      ast.elements = [];

      bracket.nodes.forEach(function(node) {
        if (node.val !== ',') {
          ast.elements.push(new NodeExpression(node));
        }
      });

      return true;
    })

    .set('paren.open', function() {
      var match = this.match(/^ *\( */);
      if (!match) return;

      var paren = this.node({
        type: 'paren',
        nodes: []
      });

      this.push('paren', paren);
      return paren;
    })

    .set('paren.close', function() {
      var match = this.match(/^ *\) */);
      if (!match) return;
      var paren = this.pop('paren');

      if (ast.type === 'FunctionType') {
        functionType(ast, paren, this.queue);
      }

      if (typeof ast.type === 'undefined') {
        ast.type = 'UnionType';
        ast.elements = [];
      }
      return true;
    });

  var AST = parser.parse(str);

  if (ast.type === 'UnionType') {
    while (parser.queue.length) {
      ast.elements.push(parser.queue.shift());
    }
  }

  if (ast.type === 'RecordType' && field !== null) {
    ast.fields.push(new Field(field.key, null));
    field = null;
  }

  if (parser.queue.length === 1 && !ast.type) {
    return parser.queue.pop();
  }

  return ast;
};

function NodeExpression(node, parent) {
  if (node.val.length > 1) {
    var val = node.val;
    node = flags(node, parent);

    if (node.val !== val) {
      node.expression = new Expression(node.val);
      if (parent && parent.type) {
        var type = parent.type;
        parent.type = node.type;
        node.type = type;
      }

      if (parent) {
        node.name = parent.name;
        delete parent.name;
      }

      if (node.type === 'ParameterType') {
        define(node, 'prefix', node.prefix);
      }

      delete node.val;
      return node;
    }
  }

  var expression = new Expression(node.val);

  if (node.val.slice(0, 3) === '...') {
    expression.expression = new Expression(node.val.slice(3));
    expression.type = 'RestType';
    delete expression.name;
  }

  if (parent && parent.name.slice(0, 3) === '...') {
    var name = parent.name.slice(3);
    parent.expression = new Expression(name);
    parent.type = 'RestType';
    delete parent.name;

    return {
      type: 'ParameterType',
      expression: expression,
      name: name
    };
  }

  return expression;
}

function Expression(name, type) {
  name = name.trim();

  if (name.slice(0, 3) === '...') {
    this.expression = new Expression(name.slice(3));
    this.type = 'RestType';
    delete this.name;
    return;
  }

  if (isNumber(name)) {
    this.type = 'NumericLiteralType';
    this.value = name;
    return;
  }

  if (type === 'StringLiteralType') {
    this.type = type;
    this.value = name;
    return;
  }

  switch (name) {
    case 'true':
    case 'false':
      this.type = 'BooleanLiteralType';
      this.value = name === 'true';
      break;
    case '*':
      this.type = 'AllLiteral';
      break;
    case '!':
      this.type = 'NonNullableLiteral';
      break;
    case '?':
      this.type = 'NullableLiteral';
      break;
    default: {
      this.type = 'NameExpression';
      this.name = name ? clean(name) : null;
      define(this, 'val', this.name);

      var tok = flags(this);

      if (tok.val !== this.name) {
        this.name = tok.val;
        delete this.prefix;
        delete this.name;
        this.expression = new Expression(tok.val);
      }
      break;
    }
  }
}

function Field(key, val) {
  this.type = 'FieldType';

  if (typeof val === 'string') {
    val = new Expression(val);
  }

  if (typeof key === 'string') {
    this.key = key.trim();
  }

  if (isNumber(this.key)) {
    if (isFloatingPoint(this.key)) {
      this.key = String(parseFloat(this.key));
    } else {
      this.key = String(parseInt(this.key, 16));
    }
  }

  if (!utils.isString(val)) {
    this.value = val;
  }
}

function isFloatingPoint(str) {
  return regex().test(str);
}

function functionType(ast, parent, queue) {
  var node = parent.nodes[0];

  if (node && node.type === 'ParameterType') {
    var tok;

    if (node.val.slice(0, 3) === '...') {
      node.val = node.val.slice(3);
      tok = {};
      tok.expression = new Expression(node.val);
      tok.type = 'RestType';
      delete tok.name;
      delete tok.expression.name;
    }

    var right = parent.nodes[1] || {};
    var expression = new NodeExpression(right, node);

    if (tok && node.type === 'OptionalType') {
      expression.name = node.val;
      tok.expression.type = 'OptionalType';
      tok.expression.expression = expression;
      ast.params.push(tok);
    } else {
      node.expression = expression;
      ast.params.push(node);
    }

    delete node.val;
    return;
  }

  var len = queue.length;
  var idx = -1;
  while (++idx < len) {
    ast.params.push(queue.shift());
  }
}

function clean(name) {
  if (utils.isString(name)) {
    return name.replace(/^([,|]|\.(?!\.))*|([,|]|\.(?!\.))*$/g, '');
  }
}

/**
 * Expose `parse`
 */

module.exports = parse;
