'use strict';

var union = require('union-value');

/**
 * Examples:
 * JSDoc: {Type} [name]
 * Google: {Type=} name
 * TypeScript: {Type?} name
 */

module.exports = function(app, tag, options) {
  return function(snapdragon) {
    var textRegex = /^[^{}()[\]<>]+/;
    var parser = this.parser;
    tag.name = '';

    // each tag has the following:
    // - style: javadoc|google (closure compiler)|typescript
    // - isOptional: false
    // - default: null
    // - params: []

    // function prev() {
    //   return parser.stack.length ? last(parser.stack) : last(parser.nodes);
    // }

    pair('bracket', /^\s*\[/, /^\s*\]/);
    pair('paren', /^\s*\(/, /^\s*\)/);
    pair('angle', /^\s*</, /^\s*>/);
    pair('brace', /^\s*\{/, /^\s*\}/);
    parser
      .set('text', function() {
        var match = this.match(textRegex);
        if (!match) return;

        var val = match[0].trim();
        // console.log(val)
        if (this.isInside('brace')) {
          // console.log('inside brace');

          // var types = app.parseTypes(val, tag, options);

        } else if (this.isInside('bracket')) {
          // console.log('inside bracket');
        } else {
          textRegex = /^[\s\S]+/;
          // console.log('outside');
          tag.name = val;
          // console.log(this)
        }

        var node = this.node({
          type: 'text',
          val: val
        });

        return node;
      })

      .set('eos', function(node) {
        this.ast.nodes.forEach(function(n) {
          if (n.type === 'brace') {
          }
            // console.log(n);
        });
      })


    function pair(name, openRe, closeRe, fn) {
      parser.set(`${name}.open`, open(name, openRe));
      parser.set(`${name}.close`, close(name, closeRe, fn));
    }
  };
};

function open(name, re) {
  return function() {
    var match = this.match(re);
    if (!match) return;

    var prev = this.prev();
    var parent = this.node({
      type: name,
      nodes: []
    });

    var open = this.node({
      type: `${name}.open`,
      val: match[0].trim()
    });

    parent.addNode(open);
    this.push(name, parent);
    prev.addNode(parent);
    return true;
  };
}

function close(name, re, fn) {
  return function() {
    var match = this.match(re);
    if (!match) return;

    var parent = this.pop(name);
    var node = this.node({
      type: `${name}.close`,
      val: match[0].trim()
    });

    parent.addNode(node);
    if (typeof fn === 'function') {
      fn.call(this, node);
    }
    return true;
  };
}
