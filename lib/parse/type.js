'use strict';

const assert = require('assert');
const Parser = require('snapdragon-parser');
const { Expression, Field, Param } = require('../nodes');
const { isNumber, define, isObject, isString, last } = require('../utils');
const {
  FunctionType,
  UnionType,
  RecordType,
  TypeApplication
} = require('../types');

/**
 * Parse a type expression from the given `str`
 */

module.exports = (str, tag, options) => {
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

  const parser = new Parser(options);
  // parser.lexer.on('match', m => console.log(m.slice()));
  let result;

  const prev = n => {
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

  parser.capture('text', textRegex(parser), function(tok) {
    let match = tok.match;
    let prev = this.prev();

    let value = match[2] ? advanceTo(match[2]) : match[1];
    let param;

    // if no string, function is just `{function}`
    if (value === 'function' && this.string.length && !this.isInside()) {
      let node = new FunctionType();
      node.result = null;
      return node;
    }

    let type = match[2] ? 'StringLiteralType' : null;
    if (result === true) {
      let prev = this.prev();
      if (prev.type === 'root') {
        prev = prev.nodes[prev.nodes.length - 1];
      }
      prev.result = new Expression(value, type);
      result = false;
      return;
    }

    switch (prev.type) {
      case 'RecordType':
        let segs = value.split(':').filter(Boolean);
        if (prev.key) {
          let field = prev.fields[prev.fields.length - 1];
          field.value = new Expression(...segs);
          delete prev.key;
          return;
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
          return;
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
        if (prev.type === 'root' && prev.nodes.length > 1) {
          let last = prev.nodes[prev.nodes.length - 1];
          last.push(new Expression(value, type));
        }

        return new Expression(value, type);
      }
    }
  });

  parser.capture('comma', /^ *, */, function(tok) {
    let prev = this.prev();
    if (prev.type === 'FunctionType') {
      delete prev.key;
    }
  });

  parser.capture('colon', /^ *: */, function(tok) {
    if (this.isInside('FunctionType')) return;
    let prev = this.prev();
    let last = prev.nodes[prev.nodes.length - 1];
    if (last && last.type === 'FunctionType') {
      result = true;
    }
  });

  parser.capture('pipe', /^ *\| */, function(tok) {
    let prev = this.prev();
    if (prev.type === 'root') {
      let node = new UnionType();
      let last = prev.nodes.pop();
      define(last, 'value', last.value);
      node.push(last);
      return node;
    }
  });

  parser.capture('angle.open', /^ *< */, function(tok) {
    let prev = this.prev();
    let node = new TypeApplication();
    if (prev.type === 'root' && prev.nodes.length > 1) {
      node.expression = prev.nodes.pop();
    }
    this.push(node);
  });

  parser.capture('angle.close', /^ *> */, function(tok) {
    let prev = this.pop();
    if (prev.type !== 'TypeApplication') {
      throw new Error('expected a closing ">" (Invalid TypeApplication)');
    }
  });

  parser.capture('brace.open', /^ *\{ */, function(tok) {
    let prev = this.prev();
    let node = new RecordType();
    this.push(node);
  });

  parser.capture('brace.close', /^ *\} */, function(tok) {
    let prev = this.pop();
    if (prev.type !== 'RecordType') {
      throw new Error('expected a closing "}" (Invalid RecordType)');
    }
    delete prev.key;
  });

  parser.capture('bracket.open', /^ *\[ */, function(tok) {
    let prev = this.prev();
    let node = new TypeApplication();
    this.push(node);
  });

  parser.capture('bracket.close', /^ *\] */, function(tok) {
    let bracket = this.pop();

    if (bracket.nodes.length === 0) {
      let prevIdx = bracket.parent.nodes.indexOf(bracket) - 1;
      let sibling = bracket.parent.nodes[prevIdx];
      bracket.parent.nodes.splice(prevIdx, 1);
      bracket.type = 'TypeApplication';
      bracket.expression = new Expression('Array');
      bracket.push(sibling);
      return;
    }

    bracket.type = 'ArrayType';
    bracket.elements = bracket.applications;
    delete bracket.applications;
  });

  parser.capture('paren.open', /^ *\( */, function(tok) {
    let prev = this.prev();
    if (!prev || prev.type !== 'FunctionType') {
      this.push(new UnionType());
    }
  });

  parser.capture('paren.close', /^ *\) */, function(tok) {
    let prev = this.prev();
    if (prev.type === 'UnionType' || prev.type === 'FunctionType') {
      this.pop();
    }
  });

  const ast = parser.parse(str);
  const nodes = ast.nodes.slice(1, ast.nodes.length - 1);
  const first = nodes.shift();

  let children = first.nodes ? first.nodes.slice() : [];
  if (children) {
    for (let i = children.length - 1; i >= 0; i--) {
      let node = children[i];
      // console.log(node)
      if (first.type === 'NameExpression') {
        first.name += `:${node.value}`;
        break;
      }
    }
  }

  delete first.nodes;
  return first;
};

/**
 * Get the regex to use for matching text
 */

function textRegex(parser) {
  // add ":" to regex if not inside an expression or result
  if (!parser.lexer.bos() && !parser.isInside() && !/\):?$/.test(parser.parsed)) {
    return /^(?:([-_$\n\w*.!?;=#:]+)|(['"]))/;
  }
  return /^(?:([-_$\n\w*.!?;=#]+)|(['"]))/;
}
