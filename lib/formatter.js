'use strict';

const union = require('union-value');

class Formatter {
  constructor() {
    this.rules = {};
  }

  rule(name, rule) {
    union(this.rules, name, rule);
    return this;
  }

  format(comment) {
    for (const name of Object.keys(this.rules)) {
      for (const rule of this.rules[name]) {
        console.log(rule);
      }
    }
    return comment;
  }
}

module.exports = Formatter;
