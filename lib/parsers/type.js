'use strict';

const Expression = require('../expression');
const Parser = require('../parser');
const utils = require('../utils');
const { isNumber, define, isObject, isString } = utils;

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

  const parser = new Parser(options);
  let result;

  parser
    .set('text', function() {
      let match = this.match(textRegex(parser));
      if (!match) return;
      const prev = this.prev();
      const value = match[2] ? this.advanceTo(match[2]) : match[1];
      let param;

      // if no string, function is just `{function}`
      if (value === 'function' && this.string.length && !this.isInside()) {
        const node = addType(this, 'FunctionType', 'params');
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
          if (prev.key) {
            const field = prev.fields.pop();
            field.value = new Expression(value);
            prev.fields.push(field);
            delete prev.key;
            return true;
          }
          prev.fields.push(new Field(value, null));
          prev.key = value;
          break;

        case 'FunctionType':
          if (prev.key) {
            const prevParam = prev.params.pop();
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

    .set('comma', function() {
      let match = this.match(/^ *, */);
      if (!match) return;
      const prev = this.prev();
      if (prev.type === 'FunctionType') {
        delete prev.key;
      }
      return true;
    })

    .set('colon', function() {
      let match = this.match(/^ *: */);
      if (!match) return;
      if (this.isInside('FunctionType')) {
        return true;
      }

      if (this.last && this.last.type === 'FunctionType') {
        result = true;
        return true;
      }
      return true;
    })

    .set('pipe', function() {
      let match = this.match(/^ *\| */);
      if (!match) return;
      const prev = this.prev();
      if (prev.type === 'root') {
        const unionType = addType(this, 'UnionType', 'elements');
        const node = prev.nodes.pop();
        define(node, 'value', node.value || node.val);
        unionType.push(node);
        return unionType;
      }
      return true;
    })

    .set('angle.open', function() {
      let match = this.match(/^ *< */);
      if (!match) return;

      const prev = this.prev();
      const angle = addType(this, 'TypeApplication', 'applications');

      if (prev.type === 'root') {
        angle.expression = prev.nodes.pop();
      }
      return angle;
    })

    .set('angle.close', function() {
      let match = this.match(/^ *> */);
      if (!match) return;
      this.pop('TypeApplication');
      return true;
    })

    .set('brace.open', function() {
      let match = this.match(/^ *\{ */);
      if (!match) return;
      const prev = this.prev();
      const node = addType(this, 'RecordType', 'fields');
      prev.nodes.push(node);
      return node;
    })

    .set('brace.close', function() {
      let match = this.match(/^ *\} */);
      if (!match) return;
      const prev = this.prev();

      if (prev.type !== 'RecordType') {
        throw new Error('invalid RecordType');
      }

      delete prev.key;
      this.pop('RecordType');
      return true;
    })

    .set('bracket.open', function() {
      let match = this.match(/^ *\[ */);
      if (!match) return;
      return addType(this, 'TypeApplication', 'applications');
    })

    .set('bracket.close', function() {
      let match = this.match(/^ *\] */);
      if (!match) return;
      const bracket = this.pop('TypeApplication');

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

    .set('paren.open', function() {
      let match = this.match(/^ *\( */);
      if (!match) return;
      if (!this.last || this.last.type !== 'FunctionType') {
        return addType(this, 'UnionType', 'elements');
      }
      return true;
    })

    .set('paren.close', function() {
      let match = this.match(/^ *\) */);
      if (!match) return;
      this.pop(utils.last(this.typeStack));
      return true;
    });

  const ast = parser.parse(str);
  return utils.unwrap(ast)[0];
};

/**
 * Push a node onto `parser.nodes`, and set an array of
 * the given `type` on the node
 */

function addType(parser, type, prop) {
  let node = parser.node({type: type});
  if (node.val) {
    node.value = node.val;
    delete node.val;
  }
  define(node, 'nodes', []);
  node[prop] = node.nodes;
  parser.push(type, node);
  return node;
}

/**
 * Create a field to add to the `fields` array in a `RecordType` node.
 */

function Field(key, value) {
  this.type = 'FieldType';

  if (typeof value === 'string') {
    value = new Expression(value);
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

  if (!isString(value)) {
    this.value = value;
  }
}

/**
 * Create a param to add to the `params` array in a `FunctionType` node
 * with a RestType argument
 */

function Param(name, value) {
  this.type = 'ParameterType';

  if (typeof value === 'string') {
    value = new Expression(value);

    if (value.type === 'OptionalType') {
      const param = new Param(name, value.name || value.value);
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

  if (!isString(value)) {
    this.expression = value;
  }
}

/**
 * Get the regex to use for matching text
 */

function textRegex(parser) {
  // add ":" to regex if not inside an expression or result
  if (!parser.isInside() && !/\):?$/.test(parser.consumed)) {
    return /^(?:([-$\n\w_*.!?=#:]+)|(['"]))/;
  }
  return /^(?:([-$\n\w_*.!?=#]+)|(['"]))/;
}
