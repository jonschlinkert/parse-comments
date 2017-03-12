'use strict';

/**
 * Examples:
 * JSDoc: {Type} [name]
 * Google: {Type=} name
 * TypeScript: {Type?} name
 */

module.exports = function(app, options) {
  return function(snapdragon) {
    var parser = snapdragon.parser;
    var tag = { types: [], name: '' };

    // each tag has the following:
    // - style: javadoc|google (closure compiler)|typescript
    // - isOptional: false
    // - default: null
    // - params: []

    function prev() {
      return parser.stack.length ? last(parser.stack) : last(parser.nodes);
    }

    parser
      .set('bracket.open', function() {
        if (hasType(tag)) return;
        var match = this.match(/^\s*\[/);
        if (!match) return;

        var prev = this.prev();
        var bracket = this.node({
          type: 'bracket',
          nodes: []
        });

        var open = this.node({
          type: 'bracket.open',
          val: '['
        });

        bracket.addNode(open);
        this.push('bracket', bracket);
        prev.addNode(bracket);
        return true;
      })

      .set('bracket.close', function() {
        var match = this.match(/^\s*\]/);
        if (!match) return;

        var bracket = this.pop('bracket');
        var node = this.node({
          type: 'bracket.close',
          val: ']'
        });

        bracket.addNode(node);
        return true;
      })

      .set('brace.open', function() {
        var match = this.match(/^\s*\{/);
        if (!match) return;

        var prev = this.prev();
        var brace = this.node({
          type: 'brace',
          nodes: []
        });

        var open = this.node({
          type: 'brace.open',
          val: '{'
        });

        brace.addNode(open);
        this.push('brace', brace);
        prev.addNode(brace);
        return true;
      })

      .set('brace.close', function() {
        var match = this.match(/^\s*\}/);
        if (!match) return;

        var brace = this.pop('brace');
        var node = this.node({
          type: 'brace.close',
          val: '}'
        });

        brace.addNode(node);
        return true;
      })

      .set('text', function() {
        var match = this.match(/^[^{}]+/);
        if (!match) return;

        var val = match[0].trim();
        if (!hasType(tag)) {
          // var ast = app.parseTypes(match[0], options);
          console.log(val)
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
            console.log(n);
          }
        });
      })

  };
};

function hasType(tag) {
  return tag.types.length > 0;
}

function last(arr) {
  return arr[arr.length - 1];
}

function pair(parser, name, openRe, closeRe) {
  parser.set(`${name}.open`, open(name, openRe));
  parser.set(`${name}.close`, close(name, closeRe));
}

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

function close(name, re) {
  return function() {
    var match = this.match(re);
    if (!match) return;

    var parent = this.pop(name);
    var node = this.node({
      type: `${name}.close`,
      val: match[0].trim()
    });

    parent.addNode(node);
    return true;
  };
}
