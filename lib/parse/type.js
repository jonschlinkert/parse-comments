'use strict';

var define = require('define-property');
var Snapdragon = require('snapdragon');
var isNumber = require('is-number');
var Expression = require('../expression');
var utils = require('../utils');

/**
 * Parse a type expression from the given `str`
 */

module.exports = function parseType(str, tag, options) {
  if (utils.isObject(str)) {
    options = tag;
    tag = str;
    str = tag.rawType.slice(1, -1);
  }

  if (typeof str !== 'string') {
    throw new TypeError('expected a string');
  }

  if (!utils.isObject(tag) || !tag.isTag) {
    options = tag;
    tag = {};
  }

  var snapdragon = new Snapdragon(options);
  var parser = snapdragon.parser;
  var result;

  parser
    .set('text', function() {
      var match = this.match(textRegex(parser));
      if (match) {
        var prev = this.prev();
        var val = match[2] ? this.advanceTo(match[2]) : match[1];
        var param;

        // if no input, function is just `{function}`
        if (val === 'function' && this.input.length && !this.isInside()) {
          var node = addType(this, 'FunctionType', 'params');
          node.result = null;
          return node;
        }

        var type = match[2] ? 'StringLiteralType' : null;
        if (result === true) {
          this.last.result = new Expression(val, type);
          result = false;
          return;
        }

        switch (prev.type) {
          case 'RecordType':
            if (prev.key) {
              var field = prev.fields.pop();
              field.value = new Expression(val);
              prev.fields.push(field);
              delete prev.key;
              return true;
            }

            prev.fields.push(new Field(val, null));
            prev.key = val;
            break;
          case 'FunctionType':
            if (prev.key) {
              var prevParam = prev.params.pop();
              param = new Param(prev.key, val);
              if (prevParam.type === 'RestType') {
                prevParam.expression = param;
                param = prevParam;
              }
              define(param, 'val', param.val);
              prev.params.push(param);
              delete prev.key;
              return true;
            }

            param = new Expression(val, null);
            prev.params.push(param);
            define(prev, 'key', param.name);
            break;
          case 'UnionType':
            prev.elements.push(new Expression(val, type));
            break;
          case 'root':
          default: {
            var exp = new Expression(val, type);
            return this.node(exp);
          }
        }
      }
    })

    .set('comma', function() {
      var match = this.match(/^ *, */);
      if (match) {
        var prev = this.prev();
        if (prev.type === 'FunctionType') {
          delete prev.key;
        }
        return true;
      }
    })

    .set('colon', function() {
      var match = this.match(/^ *: */);
      if (match) {
        if (this.isInside('FunctionType')) {
          return true;
        }

        if (this.last && this.last.type === 'FunctionType') {
          result = true;
          return true;
        }

        return true;
      }
    })

    .set('pipe', function() {
      var match = this.match(/^ *\| */);
      if (match) {
        var prev = this.prev();
        if (prev.type === 'root') {
          var unionType = addType(this, 'UnionType', 'elements');
          var node = prev.nodes.pop();
          define(node, 'val', node.val);
          unionType.addNode(node);
          return unionType;
        }
        return true;
      }
    })

    .set('angle.open', function() {
      var match = this.match(/^ *< */);
      if (!match) return;

      var prev = this.prev();
      var angle = addType(this, 'TypeApplication', 'applications');

      if (prev.type === 'root') {
        angle.expression = prev.nodes.pop();
      }
      return angle;
    })

    .set('angle.close', function() {
      var match = this.match(/^ *> */);
      if (match) {
        this.pop('TypeApplication');
        return true;
      }
    })

    .set('brace.open', function() {
      var match = this.match(/^ *\{ */);
      if (match) {
        var prev = this.prev();
        var node = addType(this, 'RecordType', 'fields');
        prev.nodes.push(node);
        return node;
      }
    })

    .set('brace.close', function() {
      var match = this.match(/^ *\} */);
      if (match) {
        var prev = this.prev();

        if (prev.type !== 'RecordType') {
          throw new Error('invalid RecordType');
        }

        delete prev.key;
        this.pop('RecordType');
        return true;
      }
    })

    .set('bracket.open', function() {
      var match = this.match(/^ *\[ */);
      if (match) {
        return addType(this, 'TypeApplication', 'applications');
      }
    })

    .set('bracket.close', function() {
      var match = this.match(/^ *\] */);
      if (!match) return;
      var bracket = this.pop('TypeApplication');

      if (bracket.nodes.length === 0) {
        var idx = bracket.index - 1;
        var sibling = bracket.parent.nodes[idx];
        bracket.parent.nodes.splice(idx, 1);
        bracket.type = 'TypeApplication';
        bracket.expression = new Expression('Array');
        bracket.applications = [sibling];
        return true;
      }

      bracket.type = 'ArrayType';
      bracket.elements = bracket.applications;
      delete bracket.applications;
      return true;
    })

    .set('paren.open', function() {
      var match = this.match(/^ *\( */);
      if (match) {
        if (!this.last || this.last.type !== 'FunctionType') {
          return addType(this, 'UnionType', 'elements');
        }
        return true;
      }
    })

    .set('paren.close', function() {
      var match = this.match(/^ *\) */);
      if (match) {
        this.pop(utils.last(this.typeStack));
        return true;
      }
    });

  var AST = parser.parse(str);
  return utils.unwrap(AST)[0];
};

/**
 * Push a node onto `parser.nodes`, and set an array of
 * the given `type` on the node
 */

function addType(parser, type, prop) {
  var node = parser.node({type: type});
  define(node, 'nodes', []);
  node[prop] = node.nodes;
  parser.push(type, node);
  return node;
}

/**
 * Create a field to add to the `fields` array in a `RecordType` node.
 */

function Field(key, val) {
  this.type = 'FieldType';

  if (typeof val === 'string') {
    val = new Expression(val);
  }

  if (typeof key === 'string') {
    this.key = key.trim();
  }

  if (isNumber(this.key)) {
    if (utils.isFloatingPoint(this.key)) {
      this.key = String(parseFloat(this.key));
    } else {
      this.key = String(parseInt(this.key, 16));
    }
  }

  if (!utils.isString(val)) {
    this.value = val;
  }
}

/**
 * Create a param to add to the `params` array in a `FunctionType` node
 * with a RestType argument
 */

function Param(name, val) {
  this.type = 'ParameterType';

  if (typeof val === 'string') {
    val = new Expression(val);

    if (val.type === 'OptionalType') {
      var param = new Param(name, val.name || val.val);
      this.type = 'OptionalType';
      this.expression = param;
      return;
    }
  }

  if (typeof name === 'string') {
    this.name = name.trim();
  }

  if (isNumber(this.name)) {
    if (utils.isFloatingPoint(this.name)) {
      this.name = String(parseFloat(this.name));
    } else {
      this.name = String(parseInt(this.name, 16));
    }
  }

  if (!utils.isString(val)) {
    this.expression = val;
  }
}

/**
 * Create the regex to use for matching text
 */

function textRegex(parser) {
  var regex = /^(?:([-$\n\w_*.!?=#]+)|(['"]))/;

  // add ":" to regex if not inside an expression or result
  if (!parser.isInside() && !/\):?$/.test(parser.parsed)) {
    regex = /^(?:([-$\n\w_*.!?=#:]+)|(['"]))/;
  }

  return regex;
}
