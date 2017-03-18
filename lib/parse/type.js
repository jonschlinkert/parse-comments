'use strict';

var set = require('set-value');
var Snapdragon = require('snapdragon');
var regex = require('floating-point-regex');
var isNumber = require('is-number');
var split = require('split-string');
var define = require('define-property');
var extend = require('extend-shallow');
var utils = require('../utils');

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
  var res = {};

  var parser = snapdragon.parser;
  parser.stash = '';

  parser.on('node', function(node) {
    if (node.val) {
      parser.stash += node.val;
    }
  });

  parser
    .set('text', function() {
      var match = this.match(/^([!?=]*)([-\w_*.]+)([!?=]*)/);
      if (match) {
        var node = this.node({type: 'text', val: match[2]});
        if (match[1]) node.prefix = match[1];
        if (match[3]) node.suffix = match[3];
        return node;
      }
    })

    .set('comma', function() {
      var match = this.match(/^ *, */);
      if (match) {
        return this.node(',');
      }
    })

    .set('colon', function() {
      var match = this.match(/^ *: */);
      if (match) {
        var prev = this.prev();
        var last = utils.last(prev.nodes);
        last.name = last.val;
        last.type = 'ParameterType';
        last.expression = {};
        return true;
      }
    })

    .set('pipe', function() {
      var match = this.match(/^ *\| */);
      if (match) {
        res.type = 'UnionType';
        res.elements = res.elements || [];
        res.elements.push(new Expression(this.stash));
        this.stash = '';
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

      res.type = 'TypeApplication';
      res.expression = new Expression(this.stash);
      res.applications = [];
      this.stash = '';

      this.push('angle', angle);
      return angle;
    })

    .set('angle.close', function() {
      var match = this.match(/^ *>/);
      if (!match) return;

      var angle = this.pop('angle');
      angle.nodes.forEach(function(node) {
        if (node.val !== ',') {
          res.applications.push(new Expression(node.val));
        }
      });

      this.stash = '';
      return true;
    })

    .set('brace.open', function() {
      var match = this.match(/^\{/);
      if (!match) return;

      var brace = this.node({
        type: 'brace',
        nodes: []
      });

      res.type = 'RecordType';
      res.fields = [];

      this.push('brace', brace);
      return brace;
    })

    .set('brace.close', function() {
      var match = this.match(/^\}/);
      if (!match) return;

      var brace = this.pop('brace');
      console.log(brace)
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
        res.type = 'TypeApplication';
        res.expression = new Expression('Array');
        res.applications = [new Expression(this.stash)];
        this.stash = '';
        return true;
      }

      res.type = 'ArrayType';
      res.elements = [];

      bracket.nodes.forEach(function(node) {
        if (node.val !== ',') {
          res.elements.push(new NodeExpression(node));
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

      if (this.stash === 'function') {
        res.type = 'FunctionType';
        res.params = [];
        res.result = null;
        this.stash = '';
      }

      this.push('paren', paren);
      return paren;
    })

    .set('paren.close', function() {
      var match = this.match(/^\)/);
      if (!match) return;

      var paren = this.pop('paren');

      if (res.type === 'FunctionType') {
        res.params = res.params || [];
        var node = paren.nodes[0];

        if (node && node.type === 'ParameterType') {
          var right = paren.nodes[1] || {};
          node.expression = new NodeExpression(right, node);
          res.params.push(node);
          delete node.val;
        } else if (node) {
          res.params.push(new NodeExpression(node));
        }
      }

      return true;
    })

  var ast = parser.parse(str);

  if (typeof res.type === 'undefined') {
    var inner = utils.unwrap(ast);
    if (inner.length === 1) {
      return new NodeExpression(inner[0]);
    }
  }

  if (res.type === 'UnionType' && parser.stash) {
    res.elements.push(new Expression(parser.stash));
  }

  if (res.type === 'RecordType' && parser.stash && parser.stash !== ',') {
    res.fields.push(new Expression(parser.stash));
  }
  return res;
};

function NodeExpression(node, parent) {
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

  if (node.suffix === '=') {
    expression = {expression: expression};

    if (parent) {
      expression.type = parent.type;
      expression.name = parent.name;
      parent.type = 'OptionalType';
      delete parent.name;
    } else {
      expression.type = rest ? 'RestType' : 'OptionalType';
      // node.type = !rest ? 'RestType' : 'OptionalType';
    }
  }

  switch (node.prefix) {
    case '!':
      node.expression = expression
      node.type = 'NonNullableType';
      node.prefix = true;
      node.expression = expression;
      delete node.val;
      return node;
      break;
    case '?':

      break;
    default: {
      break;
    }
  }

  switch (node.suffix) {
    case '!':
      node.expression = expression
      node.type = 'NonNullableType';
      node.prefix = false;
      node.expression = expression;
      delete node.suffix;
      delete node.val;
      return node;
    case '?':

      break;
    default: {
      break;
    }
  }

  return expression;
}

function Expression(name) {
  if (isNumber(name)) {
    this.type = 'NumericLiteralType';
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
      break;
    }
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
