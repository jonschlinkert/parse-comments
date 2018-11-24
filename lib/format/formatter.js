'use strict';

class Formatter {
  constructor(options = {}) {
    this.rules = options.rules || {};
  }

  rule(name, rule) {
    this.rules[name] = this.rules[name] || [];
    this.rules[name].push(rule);
    return this;
  }

  run(name, comment) {
    this.rules[name].forEach(rule => rule(comment));
    return comment;
  }

  format(comment) {
    Object.keys(this.rules).forEach(name => this.run(name, comment));
    return comment;
  }
}

module.exports = Formatter;
