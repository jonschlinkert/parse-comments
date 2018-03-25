'use strict';

var union = require('union-value');

function Formatter() {
  this.rules = {};
}

Formatter.prototype.rule = function(name, rule) {
  union(this.rules, name, rule);
  return this;
};

Formatter.prototype.format = function(comment) {
  var keys = Object.keys(this.rules);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var rules = this.rules[key];
    var len = rules.length;
    var idx = -1;
    while (++idx < len) {
      var rule = rules[idx];

    }
  }
  return comment;
};
