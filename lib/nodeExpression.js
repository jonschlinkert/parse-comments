'use strict';

var define = require('define-property');
var Expression = require('./expression');
var flags = require('./parse/flags');

module.exports = function NodeExpression(node, parent) {
  if (node.val.length > 1) {
    var val = node.val;
    node = flags(node, parent);

    if (node.val !== val) {
      node.expression = new Expression(node.val);
      if (parent && parent.type) {
        var type = parent.type;
        parent.type = node.type;
        node.type = type;
      }

      if (parent) {
        node.name = parent.name;
        delete parent.name;
      }

      if (node.type === 'ParameterType') {
        define(node, 'prefix', node.prefix);
      }

      delete node.val;
      return node;
    }
  }

  var expression = new Expression(node.val);

  if (node.val.slice(0, 3) === '...') {
    expression.expression = new Expression(node.val.slice(3));
    expression.type = 'RestType';
    delete expression.name;
  }

  if (parent && parent.name.slice(0, 3) === '...') {
    var name = parent.name.slice(3);
    parent.expression = new Expression(name);
    parent.type = 'RestType';
    delete parent.name;

    return {
      type: 'ParameterType',
      expression: expression,
      name: name
    };
  }

  return expression;
};
