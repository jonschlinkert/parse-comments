'use strict';

var set = require('set-value');
var union = require('union-value');
var util = require('snapdragon-util');
var Snapdragon = require('snapdragon');
var regex = require('floating-point-regex');
var isNumber = require('is-number');
var split = require('split-string');
var define = require('define-property');
var extend = require('extend-shallow');
var utils = require('../utils');
var flags = require('./flags');

function parse(str, options) {
  if (typeof str !== 'string') {
    throw new TypeError('expected a string');
  }

  if (str === '()') {
    return {
      type: 'UnionType',
      elements: []
    };
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
      var match = this.match(/^[-\w_*.!?=]+/);
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
            field = { key: val };
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
            field = { key: val };
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

        } else if (this.queue.length) {
          last = this.queue.pop();
          var node = {
            key: last.value,
            type: 'FieldType',
            value: {}
          };

          ast.fields.push(node);
        }
        return true;
      }
    })

    .set('pipe', function() {
      var match = this.match(/^ *\| */);
      if (match) {
        ast.type = 'UnionType';
        ast.elements = ast.elements || [];
        ast.elements.push(this.queue.pop());
        return true;
      }
    })

    .set('angle.open', function() {
      var parsed = this.parsed;
      var match = this.match(/^< */);
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
      var match = this.match(/^ *>/);
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
      var match = this.match(/^\{/);
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
      var match = this.match(/^\}/);
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
      var match = this.match(/^\[/);
      if (!match) return;

      var bracket = this.node({
        type: 'bracket',
        nodes: []
      });

      this.push('bracket', bracket);
      return bracket;
    })

    .set('bracket.close', function() {
      var match = this.match(/^\]/);
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
      var match = this.match(/^\(/);
      if (!match) return;

      var paren = this.node({
        type: 'paren',
        nodes: []
      });

      this.push('paren', paren);
      return paren;
    })

    .set('paren.close', function() {
      var match = this.match(/^\)/);
      if (!match) return;

      var paren = this.pop('paren');
      if (ast.type === 'FunctionType') {
        functionType(ast, paren, this.queue);
      }
      return true;
    })

  var AST = parser.parse(str);

  if (ast.type === 'UnionType') {
    while (parser.queue.length) {
      ast.elements.push(parser.queue.pop());
    }
  }

  if (ast.type === 'RecordType' && parser.queue.length && !ast.fields.length) {
    ast.fields.push(parser.queue.shift());
    return ast;
  }

  if (typeof ast.type === 'undefined') {
    var inner = utils.unwrap(AST);
    if (inner.length === 1) {
      return new NodeExpression(inner[0]);
    }
  }

  if (parser.queue.length === 1 && !ast.type) {
    return parser.queue.pop();
  }

  return ast;
};

function NodeExpression(node, parent) {
  if (node.val.length > 1) {
    var val = node.val;
    var res = flags(node);
    if (res.val !== val) {
      res.expression = new Expression(res.val);
      delete res.val;
      return res;
    }
  }

  var expression = new Expression(node.val);
  var rest = false;

  if (node.val.slice(0, 3) === '...') {
    rest = true;
    expression.expression = new Expression(node.val.slice(3));
    expression.type = 'RestType';
    delete expression.name;
  }

  if (parent && parent.name.slice(0, 3) === '...') {
    rest = true;
    var name = parent.name.slice(3);
    parent.expression = new Expression(name);
    parent.type = 'RestType';
    delete parent.name;

    return {
      type: 'ParameterType',
      expression: expression,
      name: name
    }
  }

  // if (node.suffix === '=') {
  //   expression = {expression: expression};
  //   if (parent) {
  //     // expression.type = parent.type;
  //     expression.name = parent.name;
  //     expression.type = 'OptionalType';
  //     delete parent.name;
  //   } else {
  //     // expression.type = rest ? 'RestType' : 'OptionalType';
  //     // node.type = !rest ? 'RestType' : 'OptionalType';
  //   }
  // }

  // switch (node.prefix) {
  //   case '!':
  //     node.expression = expression
  //     node.type = 'NonNullableType';
  //     node.prefix = true;
  //     node.expression = expression;
  //     delete node.val;
  //     return node;
  //     break;
  //   case '?':

  //     break;
  //   default: {
  //     break;
  //   }
  // }

  // switch (node.suffix) {
  //   case '!':
  //     node.expression = expression
  //     node.type = 'NonNullableType';
  //     node.prefix = false;
  //     node.expression = expression;
  //     delete node.suffix;
  //     delete node.val;
  //     return node;
  //   case '?':

  //     break;
  //   default: {
  //     break;
  //   }
  // }

  return expression;
}

function Expression(name, type) {
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
      this.key = String(parseInt(this.key));
    }
  }

  if (!utils.isString(val)) {
    this.value = val;
  } else {
  }
}

// function Field(keyNode, val) {
//   this.type = 'FieldType';
//   var key = keyNode.val || keyNode.key;
//   console.log(keyNode)
//   if (utils.isObject(val) && val.val && val.type !== 'NameExpression') {
//     val = new Expression(val.val);
//   }

//   if (typeof key === 'string') {
//     this.key = key.trim();
//   }

//   if (isNumber(this.key)) {
//     if (isFloatingPoint(this.key)) {
//       this.key = String(parseFloat(this.key));
//     } else {
//       this.key = String(parseInt(this.key));
//     }
//   }

//   if (!utils.isString(val)) {
//     this.value = val;
//   }
// }

function isFloatingPoint(str) {
  return regex().test(str);
}

function functionType(ast, parent, queue) {
  var node = parent.nodes[0];

  if (node && node.type === 'ParameterType') {
    var right = parent.nodes[1] || {};
    node.expression = new NodeExpression(right, node);
    ast.params.push(node);
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
    return name.replace(/^[,|.]*|[,|.]*$/g, '');
  }
}

/**
 * Expose `parse`
 */

module.exports = parse;
