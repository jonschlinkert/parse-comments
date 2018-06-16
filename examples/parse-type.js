'use strict';

const Comments = require('..');
const comments = new Comments();
const tags = [
  '{...(Array|String)}',
  '{!...(Array|String)}',
  '{...(array|string)}',
  '{(Array|String)}',
  '{Array|String}',
  '{({stream: Writable}|String|Array)}',
  '{({stream: Writable})|String|Array}',
  '{{stream: Writable}|(String|Array)}',
  '{{stream: Writable|Foo}|String|Array}'
];

tags.forEach(function(tag) {
  const ast = comments.parseTag(tag, 'param');
  console.log(ast);
});
