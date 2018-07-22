'use strict';

const Node = require('snapdragon-node');

class UnionType extends Node {
  constructor() {
    this.nodes = [];
    this.elements = this.nodes;
  }
  push(...args) {
    let res = super.push(...args);
    this.elements = this.nodes;
    return res;
  }
  pop(...args) {
    let res = super.pop(...args);
    this.elements = this.nodes;
    return res;
  }
}

module.exports = UnionType;
