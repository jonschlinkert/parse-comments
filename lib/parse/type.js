'use strict';

const assert = require('assert');
const Parser = require('snapdragon-parser');
const { Expression, Field, Param } = require('../nodes');
const { isNumber, define, isObject, isString, last } = require('../utils');

/**
 * Parse a type expression from the given `str`
 */

module.exports = function parseType(str, tag, options = {}) {
  if (isObject(str)) {
    options = tag;
    tag = str;
    str = tag.rawType.slice(1, -1);
  }

  if (typeof str !== 'string') {
    throw new TypeError('expected a string');
  }

  if (!isObject(tag) || !tag.isTag) {
    options = tag;
    tag = {};
  }

  let result;
  const parser = new Parser(options);
  const pop = type => {
    const node = parser.stack.pop();
    console.log(node)
    assert(node && node.type === type, `expected a ${type} node`);
    return node;
  };

  const prev = n =>  {
    return parser.stack.length > 0 ? last(parser.stack, n) : parser.ast;
  };

  const advanceTo = (str, i) => {
    let idx = parser.string.indexOf(str, i);
    if (idx !== -1) {
      let value = parser.string.slice(0, idx);
      parser.lexer.consume(idx + str.length);
      return value;
    }
  };

  parser
    .capture('text', textRegex(parser), function(tok) {
      let match = tok.match;
      let prev = this.prev();
      let lastNode = prev.nodes[prev.nodes.length - 1];

      const value = match[2] ? advanceTo(match[2]) : match[1];
      let param;

      // if no string, function is just `{function}`
      if (value === 'function' && this.string.length && !this.isInside()) {
        let node = addType(this, 'FunctionType', 'params');
        node.result = null;
        return node;
      }

      const type = match[2] ? 'StringLiteralType' : null;
      if (result === true) {
        this.last.result = new Expression(value, type);
        result = false;
        return;
      }

      switch (prev.type) {
        case 'RecordType':
          let segs = value.split(':').filter(Boolean);
          if (prev.key) {
            const field = prev.fields.pop();
            field.value = new Expression(...segs);
            prev.fields.push(field);
            delete prev.key;
            return true;
          }

          prev.fields.push(new Field(...segs));
          prev.key = value;
          break;

        case 'FunctionType':
          if (prev.key) {
            let prevParam = prev.params.pop();
            param = new Param(prev.key, value);
            if (prevParam.type === 'RestType') {
              prevParam.expression = param;
              param = prevParam;
            }
            define(param, 'value', param.value);
            prev.params.push(param);
            delete prev.key;
            return true;
          }
          param = new Expression(value, null);
          prev.params.push(param);
          define(prev, 'key', param.name);
          break;

        case 'UnionType':
          prev.elements.push(new Expression(value, type));
          break;

        case 'root':
        default: {
          const exp = new Expression(value, type);
          return this.node(exp);
        }
      }
    })

    .capture('comma', /^ *, */, function(tok) {
      let match = tok.match;
      let prev = this.prev();
      if (prev.type === 'FunctionType') {
        delete prev.key;
      }
      return true;
    })

    .capture('colon', /^ *: */, function(tok) {
      let match = tok.match;
      if (this.isInside('FunctionType')) return true;
      if (this.last && this.last.type === 'FunctionType') {
        result = true;
      }
      return true;
    })

    .capture('pipe', /^ *\| */, function(tok) {
      let match = tok.match;
      let prev = this.prev();
      if (prev.type === 'root') {
        const unionType = addType(this, 'UnionType', 'elements');
        const node = prev.nodes.pop();
        define(node, 'value', node.value);
        unionType.push(node);
        return unionType;
      }
      return true;
    })

    .capture('angle.open', /^ *< */, function(tok) {
      let match = tok.match;
      let prev = this.prev();
      const angle = addType(this, 'TypeApplication', 'applications');

      if (prev.type === 'root') {
        angle.expression = prev.nodes.pop();
      }
      return angle;
    })

    .capture('angle.close', /^ *> */, function(tok) {
      let match = tok.match;
      pop('TypeApplication');
      return true;
    })

    .capture('brace.open', /^ *\{ */, function(tok) {
      let match = tok.match;
      let prev = this.prev();
      const node = addType(this, 'RecordType', 'fields');
      prev.nodes.push(node);
      return node;
    })

    .capture('brace.close', /^ *\} */, function(tok) {
      let match = tok.match;
      let prev = this.prev();

      if (prev.type !== 'RecordType') {
        throw new Error('invalid RecordType');
      }

      delete prev.key;
      pop('RecordType');
      return true;
    })

    .capture('bracket.open', /^ *\[ */, function(tok) {
      let match = tok.match;
      return addType(this, 'TypeApplication', 'applications');
    })

    .capture('bracket.close', /^ *\] */, function(tok) {
      let match = tok.match;
      const bracket = pop('TypeApplication');

      if (bracket.nodes.length === 0) {
        const idx = bracket.index - 1;
        const sibling = bracket.parent.nodes[idx];
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

    .capture('paren.open', /^ *\( */, function(tok) {
      let match = tok.match;
      if (!this.last || this.last.type !== 'FunctionType') {
        return addType(this, 'UnionType', 'elements');
      }
      return true;
    })

    .capture('paren.close', /^ *\) */, function(tok) {
      let match = tok.match;
      pop(last(this.typeStack));
      return true;
    });

  const ast = parser.parse(str);
  const nodes = ast.nodes.slice(1, ast.nodes.length - 1);
  while (nodes.length > 1) {
    if (nodes[0].elements) {
      nodes[0].elements.push(nodes.pop());
    } else {
      nodes[0].nodes.push(nodes.pop());
    }
  }
  return nodes[0];
};

/**
 * Push a node onto `parser.nodes`, and set an array of
 * the given `type` on the node
 */

function addType(parser, type, prop) {
  let node = parser.node({ type });
  define(node, 'nodes', []);
  node[prop] = node.nodes;
  return node;
}

/**
 * Get the regex to use for matching text
 */

function textRegex(parser) {
  // add ":" to regex if not inside an expression or result
  if (!parser.isInside() && (!parser.consumed || !/\):?$/.test(parser.consumed))) {
    return /^(?:([-$\n\w_*.!?=#:]+)|(['"]))/;
  }
  return /^(?:([-$\n\w_*.!?=#]+)|(['"]))/;
}
