'use strict';

const assert = require('assert');
const Parser = require('snapdragon-parser');
const { Expression, Field, Param } = require('../nodes');

const {
  isFloatingPoint,
  isNumber,
  define,
  isObject,
  isString,
  last
} = require('../utils');

const Types = {
  NullableLiteral: 'NullableLiteral',
  AllLiteral: 'AllLiteral',
  NullLiteral: 'NullLiteral',
  // UndefinedLiteral: 'UndefinedLiteral',
  // VoidLiteral: 'VoidLiteral',

  ArrayType: 'ArrayType',
  RecordType: 'RecordType',
  FieldType: 'FieldType',
  FunctionType: 'FunctionType',
  ParameterType: 'ParameterType',
  RestType: 'RestType',
  NonNullableType: 'NonNullableType',
  OptionalType: 'OptionalType',
  NullableType: 'NullableType',
  NameExpression: 'NameExpression',
  StringLiteralType: 'StringLiteralType',
  NumericLiteralType: 'NumericLiteralType',
  BooleanLiteralType: 'BooleanLiteralType',
  UnionType: 'UnionType',

  TypeUnion: 'TypeUnion',
  TypeApplication: 'TypeApplication',
};

/**
 * Parse a type expression from the given `input`
 */

module.exports = (input, tag, options) => {
  if (isObject(input)) {
    options = tag;
    tag = input;
    input = tag.rawType.slice(1, -1);
  }

  assert.equal(typeof input, 'string', 'expected a string');
  const parser = new Parser(options);
  let result;

  const FieldType = (key, value) => {
    let field = {};
    field.type = 'FieldType';
    field.key = key;

    if (typeof value === 'string') {
      field.value = NameExpression(value);
    } else {
      field.value = value;
    }

    field.key = String(toNumber(field.key));
    return field;
  };

  const toNumber = value => {
    if (isFloatingPoint(value)) {
      value = parseFloat(value);
    } else if (isNumber(value)) {
      value = parseInt(value, 16);
    }
    return value;
  };

  const AllLiteral = () => ({ type: 'AllLiteral' });
  const ArrayType = () => ({ type: 'ArrayType', elements: [] });
  const TypeApplication = (name = 'Array', node) => {
    return {
      type: 'TypeApplication',
      expression: NameExpression(name.replace(/\.$/, '')),
      applications: node ? [toNodeType(node)] : []
    };
  };

  const RecordType = () => ({ type: 'RecordType', fields: [] });
  const UnionType = () => ({ type: 'UnionType', elements: [] });
  const TypeUnion = () => ({ type: 'TypeUnion', elements: [] });
  const NumericLiteralType = value => ({ type: 'NumericLiteralType', value: toNumber(value) });
  const NameExpression = name => {
    switch (name) {
      case 'undefined':
        return { type: 'UndefinedLiteral' };
      case 'true':
      case 'false':
        return BooleanLiteralType(name);
      case 'null':
        return { type: 'NullLiteral' };
      default: {
        return { type: 'NameExpression', name };
      }
    }
  };

  const NullableType = node => {
    let result = {
      type: 'NullableType',
      expression: NameExpression(node.value),
      prefix: !!node.prefix
    };
    if (node.suffix === '=') {
      return OptionalType(result);
    }
    return result;
  };

  const NonNullableType = node => {
    let result = {
      type: 'NonNullableType',
      expression: NameExpression(node.value),
      prefix: !!node.prefix
    };
    if (node.suffix === '=') {
      return OptionalType(result);
    }
    return result;
  };

  const FunctionType = node => {
    return { type: 'FunctionType', params: [], result: null };
  };

  const OptionalType = expression => ({ type: 'OptionalType', expression });
  const RestType = expression => ({ type: 'RestType', expression });
  const ParameterType = (name, node) => {
    return {
      type: 'ParameterType',
      name,
      expression: toNodeType(node)
    }
  };

  const BooleanLiteralType = value => ({ type: 'BooleanLiteralType', value: value === 'true' });
  const StringLiteralType = value => ({ type: 'StringLiteralType', value });
  const NonNullableLiteral = value => ({ type: 'NonNullableLiteral' });
  const NullableLiteral = value => ({ type: 'NullableLiteral' });

  const toNodeType = (node, parent, next) => {
    if (node.value === '*') return AllLiteral(node.value);
    if (node.value === '?') return NullableLiteral(node.value);
    if (node.value === '!') return NonNullableLiteral(node.value);
    if (node.value === '=') return OptionalLiteral(node.value);
    if (node.value === 'true' || node.value === 'false') {
      return BooleanLiteralType(node.value);
    }

    if (node.prefix === '?' || node.suffix === '?') {
      return NullableType(node);
    }

    if (node.prefix === '!' || node.suffix === '!') {
      return NonNullableType(node);
    }

    if (node.isQuoted) return StringLiteralType(node.value);
    if (isNumber(node.value)) return NumericLiteralType(node.value);

    if (node.functionType === true) {
      delete node.functionType;
      return FunctionType();
    }

    if (node.rest === true && (!parent || parent.rest !== true)) {
      delete node.rest;

      if (next && next.type === 'colon') {
        let text = parser.lexer.skipTo('text').pop();
        let suffix = text.suffix;
        delete text.suffix;

        let param = ParameterType(node.value, text);
        if (suffix === '=') {
          param = OptionalType(param);
        }
        return RestType(param);
      }

      if (node.suffix === '=') {
        delete node.suffix;
        return RestType(OptionalType(toNodeType(node)));
      }
      return RestType(toNodeType(node));
    }

    if (node.suffix === '=') {
      delete node.suffix;
      return OptionalType(toNodeType(node));
    }

    if (next && next.type === 'colon') {
      let text = parser.lexer.skipTo('text').pop();
      let suffix = text.suffix;
      delete text.suffix;

      let param = ParameterType(node.value, text);
      if (suffix === '=') {
        return OptionalType(param);
      }
      return param;
    }

    return NameExpression(node.value);
  };

  const push = (result, node) => {
    if (result) {
      let arr = result.params || result.elements || result.applications;
      if (arr) arr.push(node);
    } else {
      result = node;
    }
  };

  parser
    .capture('space', /^\s+/)
    .capture('negative', /^\!(?!.)/, tok => {
      if (!parser.isInside()) {
        result = NonNullableLiteral();
      }
      return tok;
    })
    .capture('qmark', /^\?(?!.)/, tok => {
      if (!parser.isInside()) {
        if (result) {
          result.result = NullableLiteral();
        } else {
          result = NullableLiteral();
        }
      }
      return tok;
    })
    .capture('star', /^\*(?!.)/, tok => {
      if (!parser.isInside()) {
        result = AllLiteral();
      }
      return tok;
    })

    .capture('text', /^(?:(?:\\.[^\1])*?(['"`])((?:\\.|[^\1])*?)(\1)|([!?]?)(\.{3})?((?:[-._$\w*?!=#])+)(\[\])?)/, function(tok) {
      let suffix = (tok.match[6] || '').slice(-1);
      let prefix = tok.match[4];
      let nextChar = parser.string[0];

      tok.value = (tok.match[2] || tok.match[6] || tok.match[0]).trim();
      tok.isQuoted = !!(tok.match[1] && tok.match[3]);
      tok.nextChar = nextChar;
      tok.prevChar = parser.parsed.slice(-1);
      if (prefix) tok.prefix = prefix;

      if (tok.value.length > 1 && (suffix === '!' || suffix === '?' || suffix === '=')) {
        tok.suffix = suffix;
        tok.value = tok.value.slice(0, -1);
      }

      tok.raw = tok.match[0];
      if (tok.value === 'function' && nextChar === '(') tok.functionType = true;
      if (tok.match[7]) tok.TypeApplication = true;
      if (tok.match[5]) tok.rest = true;
      if (tok.match[2]) tok.literal = true;
      return tok;
    }, tok => {
      if (result && result.type === 'NameExpression') {
        let tokens = parser.lexer.state.tokens;

        if (tokens[tokens.length - 2].type === 'colon') {
          result.name += `:${tok.value}`;
          return tok;
        }
      }

      let next = parser.peek();
      if (next) {
        next.previous = tok;
      }

      if (tok.value === '...' && next && next.value === '[') {
        if (result && !parser.peeking) {
          let nodes = parser.lexer.skipTo('bracket.close');
          let text = nodes[nodes.length - 2];
          let arrayType = ArrayType();
          arrayType.elements.push(toNodeType(text));
          let restType = RestType(arrayType);
          push(result, restType);
          return tok;
        }
      }

      if (tok.TypeApplication === true) {
        result = TypeApplication('Array', tok);
        return tok;
      }

      if (!parser.isInside()) {
        if (next && next.value === '<') {
          result = TypeApplication(tok.value);
          return tok;
        }

        if (!result && next && next.type === 'pipe') {
          result = UnionType();
          result.elements.push(toNodeType(tok, result));
          return;
        }

        if (result && result.elements) {
          result.elements.push(toNodeType(tok, result));
          return;
        }

        if (result && result.params) {
          result.result = result.result || TypeUnion();
          result.result.elements.push(toNodeType(tok, result));
          return;
        }

        result = toNodeType(tok, result);
        return tok;
      }

      if (next && next.value === '<') {
        let app = TypeApplication(tok.value);
        if (result && result.type === 'TypeApplication') {
          result.applications.push(app);
          parser.peeking = true;
          parser.next();
          app.applications.push(toNodeType(parser.next()));
          parser.peeking = false;
          return;
        }
      }

      if (result && result.type === 'FunctionType') {
        if (tok.value === 'this' || tok.value === 'new') {
          if (next && next.type === 'colon') {
            let prop = parser.lexer.skipTo('text').pop();
            result.this = toNodeType(prop);
            if (tok.value === 'new') {
              result.new = true;
            }
          }
          return;
        }

        result.result = result.result || TypeUnion();
        let n = toNodeType(tok, result, next);
        let prev = parser.prev();
        let first = prev.nodes[0];
        let previous = first && first.previous;

        if (parser.isInside('paren') && previous && previous.value === 'function') {
          result.params.push(n);
        } else {
          result.result.elements.push(n);
        }
        return
      }

      if (result && !parser.peeking) {
        push(result, toNodeType(tok, result));
      }
      return tok;
    })

    .capture('comma', /^ *, */)
    .capture('colon', /^ *: */)
    .capture('pipe', /^ *\| */)

    .capture('brace.open', /^{/, tok => ({ type: 'brace', nodes: [tok] }))
    .capture('brace.close', /^}/, tok => {
      let recordType = RecordType();

      if (!result) {
        result = recordType;
      } else if (result.type === 'RecordType') {
        let unionType = UnionType();

        unionType.elements.push(result);
        unionType.elements.push(recordType);
        result = unionType;
      }

      let parent = parser.prev();
      let nodes = parent.nodes.slice(1).filter(n => n.type !== 'space');
      let field;

      for (let i = 0; i < nodes.length; i++) {
        let node = nodes[i];
        let next = nodes[i + 1] || {};
        let prev = nodes[i - 1];

        if (node.type !== 'comma' && node.type !== 'colon' && (prev === void 0 || prev.type === 'comma')) {
          if (next.type === 'colon') {
            i++;
            next = nodes[i + 1] || {};
          }

          let value = next.type === 'comma' ? null : next.value;
          recordType.fields.push(FieldType(node.value, value));
          continue;
        }
      }

      return tok;
    })

    .capture('bracket.open', /^\[/, tok => ({ type: 'bracket', nodes: [tok] }))
    .capture('bracket.close', /^\]/, tok => {
      let arrayType = ArrayType();
      if (result) {
        // console.log(result)
      } else {
        result = arrayType;
      }

      let parent = parser.prev();
      let first = parent.nodes[0];
      let nodes = parent.nodes.slice(1).filter(n => n.type !== 'space');
      let field;

      for (let i = 0; i < nodes.length; i++) {
        let node = nodes[i];
        let next = nodes[i + 1] || {};
        let prev = nodes[i - 1];

        if (node.type !== 'comma' && (prev === void 0 || prev.type === 'comma')) {
          if (next.type === 'colon') {
            i++;
            next = nodes[i + 1] || {};
          }

          let value = next.type === 'comma' ? null : next.value;
          if (node.rest === true) {
            arrayType.elements.push(RestType(toNodeType(node, node)));
            continue;
          }

          arrayType.elements.push(toNodeType(node, arrayType));
          continue;
        }
      }
      return tok;
    })

    .capture('angle.open', /^</, tok => {
      let node = parser.node({ type: 'angle', nodes: [tok] });
      if (!result || (result.type !== 'NameExpression' && result.type !== 'TypeApplication')) {
        throw new Error('TypeApplication does not have a name');
      }

      return node;
    })
    .capture('angle.close', /^>/)

    .capture('paren.open', /^\(/, tok => ({ type: 'paren', nodes: [tok] }))
    .capture('paren.close', /^\)/, tok => {
      let parent = parser.prev();
      let first = parent.nodes[0];
      let nodes = parent.nodes.slice(1).filter(n => n.type !== 'space');
      let field;

      result = result || UnionType();
      for (let i = 0; i < nodes.length; i++) {
        let node = nodes[i];
        let next = nodes[i + 1] || {};
        let prev = nodes[i - 1];

        if (node.type !== 'pipe' && node.type !== 'colon' && node.type !== 'comma' && (prev === void 0 || prev.type === 'pipe')) {
          if (next.type === 'colon') {
            i++;
            next = nodes[i + 1] || {};
          }

          let value = next.type === 'pipe' ? null : next.value;
          let arr = result.elements || result.params || result.applications;
          if (node.literal) {
            arr.push(StringLiteralType(node.value, value));
          } else if (isNumber(node.value)) {
            arr.push(NumericLiteralType(node.value));
          } else if (arr) {
            arr.push(NameExpression(node.value, value));
          }
          continue;
        }
      }
      return tok;
    })

  parser.parse(input);

  if (result && result.elements) {
    result.elements = result.elements.filter(res => {
      return res.type !== 'NameExpression' || res.name !== void 0;
    });
  }

  if (result && result.result && result.result.elements) {
    if (result.result.elements.length === 1) {
      result.result = result.result.elements[0];
    } else if (result.result.elements.length === 0) {
      result.result = null;
    }
  }


  return result;
};

/**
 * Get the regex to use for matching text
 */

function textRegex(parser) {
  // add ":" to regex if not inside an expression or result
  if (!parser.lexer.bos() && !parser.isInside() && !/\):?$/.test(parser.parsed)) {
    return /^(?:([-_$\n\w*.!?;=#:]+)|(?:(?:\\['"`].)*?(['"`])((?:\\\1|.)*?)(\2)))/;
  }
  return /^(?:([-_$\n\w*.!?;=#]+)|(?:(?:\\['"`].)*?(['"`])((?:\\\1|.)*?)(\2)))/;
}
