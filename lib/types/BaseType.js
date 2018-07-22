'use strict';

const Node = require('snapdragon-node');
const { define } = require('../utils');

module.exports = prop => {
  return class BaseType extends Node {
    constructor(...args) {
      super(...args)
      define(this, 'nodes', []);
      this[prop] = this.nodes;
    }
    push(...args) {
      let res = super.push(...args);
      this[prop] = this.nodes;
      return res;
    }
    pop(...args) {
      let res = super.pop(...args);
      this[prop] = this.nodes;
      return res;
    }
  }
};
