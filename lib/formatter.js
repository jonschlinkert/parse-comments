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

// const formatter = new Formatter();
// const set = (prop, val) => {
//   return comment => {
//     comment[prop] = val;
//     return comment;
//   };
// };

// formatter.rule('foo', set('a', true));
// formatter.rule('foo', set('b', true));
// formatter.rule('foo', set('c', true));
// formatter.rule('foo', set('d', true));
// formatter.rule('foo', set('e', true));

// const comment = {};
// formatter.run('foo', comment);
// console.log(comment);
