'use strict';

module.exports = function(app, options) {
  return function(snapdragon) {
    snapdragon.compiler
      .set('foo', function(node) {
        this.emit(node.fn(options.name));
      })
  };
};
