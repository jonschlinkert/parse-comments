'use strict';

/**
 * Examples:
 * JSDoc: {Type} [name]
 * Google: {Type=} name
 * TypeScript: {Type?} name
 */

module.exports = function(app, options) {
  return function(snapdragon) {
    var queue = [];
    var cache = {};

    snapdragon.parser
      .set('bos', function(node) {
        this.ast.types = ['blah'];
      })

      .set('text', function() {
        var pos = this.position();
        var match = this.match(/^[^{}:]+/);
        if (!match) return;

        var val = match[0].trim();
        cache[val] = true;
        console.log(match)
        var node = this.node({
          type: 'text',
          val: match[0]
        });
        return node;
      })

      .set('colon', function() {
        var pos = this.position();
        var match = this.match(/^:/);
        if (!match) return;

        console.log(match)
        return this.node({
          type: 'colon',
          val: match[0]
        });
      })

      .set('eos', function(node) {
        this.ast.type = 'type';
      })

  };
};
