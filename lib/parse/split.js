'use strict';

var define = require('define-property');
var extend = require('extend-shallow');
var utils = require('./utils');

// module.exports =

function parse(str, options) {
  if (typeof str !== 'string') {
    throw new TypeError('expected a string');
  }

  // allow separator to be defined as a string
  if (typeof options === 'string') {
    options = {sep: options};
  }

  var opts = extend({}, options);
  var ast = { type: 'root', nodes: [] };
  var nodes = [ast];
  var stack = [];
  var depth = {
    brace: 0,
    bracket: 0,
    paren: 0,
    angle: 0
  };

  var bos = { type: 'bos' };
  ast.nodes.push(bos);

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
    // console.log(parent)
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

  function update(node) {
    node = last(node);
    if (typeof node.name === 'string') {
      node.name += ch;
    } else {
      var tok = {name: ch};
      inside(tok);
      parent.nodes.push(tok);
    }
  }

  for (var i = 0; i < str.length; i++) {
    var ch = str[i];

    var parent = prev();
    var node;

    switch (ch) {
      case '{':
        node = {
          type: 'brace',
          nodes: [{
            type: 'brace.open'
          }]
        };

        inside(node);
        stack.push(node);
        parent.nodes.push(node);
        depth.brace++;
        break;
      case '}':
        node = stack.pop();
        node.nodes.push({
          type: 'brace.close',
        });

        inside(node);
        depth.brace--;
        break;
      case '[':
        node = {
          type: 'bracket',
          nodes: [{
            type: 'bracket.open',
          }]
        };

        inside(node);
        stack.push(node);
        parent.nodes.push(node);
        depth.bracket++;
        break;
      case ']':
        node = stack.pop();
        node.nodes.push({
          type: 'bracket.close',
        });

        inside(node);
        depth.bracket--;
        break;
      case '(':
        node = {
          type: 'paren',
          nodes: [{
            type: 'paren.open'
          }]
        };

        inside(node);
        stack.push(node);
        parent.nodes.push(node);
        depth.paren++;
        break;
      case ')':
        node = stack.pop();
        node.nodes.push({
          type: 'paren.close',
        });

        inside(node);
        depth.paren--;
        break;
      case '<':
        node = {
          type: 'angle',
          nodes: [{
            type: 'angle.open',
          }]
        };

        inside(node);
        stack.push(node);
        parent.nodes.push(node);
        depth.angle++;
        break;
      case '>':
        node = stack.pop();
        node.nodes.push({
          type: 'angle.close',
        });

        inside(node);
        depth.angle--;
        break;
      default: {
        if (!isInside('brace')) {
          update(parent);
          break;
        }

        node = last(parent);
        node.type = 'object';
        node.fields = node.fields || [];
        let match = /^:\s*([!?=]*)([-a-z_.]+)([!?=]*)/.exec(str.slice(i));

        if (match && match[2]) {
          let field = {name: match[2].trim(), type: 'field'};
          let flags = match[1] || match[3];
          if (flags) {
            setFlags(field, flags);
          }
          node.fields.push(field);
          i += match[0].length + 1;
        }

        parent.nodes.push({name: ''});


        break;
      }
    }
  }

  var eos = { type: 'eos' };
  ast.nodes.push(eos);

  // console.log(ast.nodes[1].inside)
  return ast;
};

function setFlags(node, val) {
  var flags = val.split('');
  for (var i = 0; i < flags.length; i++) {
    switch (flags[i]) {
      case '!':
        node.nullable = false;
        break;
      case '?':
        node.nullable = true;
        break;
      case '=':
        node.optional = true;
        break;
    }
  }
}

function inner(ast) {
  return ast.nodes.slice(1, ast.nodes.length - 1);
}

// var ast = parse('foo{bar{qux}}baz');
var ast = parse('{foo: =number, bar: string, array}');
console.log(ast.nodes[1].nodes[2])

