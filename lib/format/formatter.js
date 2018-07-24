'use strict';

class Formatter {
  constructor() {
    this.rules = {};
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

const formatter = new Formatter();
const set = (key, value) => comment => (comment[key] = value);

formatter.rule('foo', set('a', true));
formatter.rule('foo', set('b', true));
formatter.rule('foo', set('c', true));
formatter.rule('foo', set('d', true));
formatter.rule('foo', set('e', true));
formatter.rule('bar', set('x', false));
formatter.rule('bar', set('y', false));
formatter.rule('bar', set('z', false));

const comment = { foo: {} };
formatter.format(comment);
console.log(comment);
