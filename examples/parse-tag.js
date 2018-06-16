'use strict';

const Comments = require('..');
const comments = new Comments();
const tags = [
  '@param {...(Array|String)} foo Bar baz',
  '@param {!...(Array|String)} foo Bar baz',
  '@param {...(array|string)} foo Bar baz',
  '@param {(Array|String)} foo Bar baz',
  '@param {Array|String} foo Bar baz',
  '@param {({stream: Writable}|String|Array)} options',
  '@param {({stream: Writable})|String|Array} options',
  '@param {{stream: Writable}|(String|Array)} options',
  '@param {{stream: Writable|Foo}|String|Array} options',
];

tags.forEach(function(tag) {
  const ast = comments.parseTag(toTag(tag));
  console.log(ast);
});

function toTag(str) {
  let m = /@(\S+)(.*)/.exec(str);
  return {
    type: 'tag',
    raw: str,
    key: m[1],
    val: m[2].trim()
  };
}
