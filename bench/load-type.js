console.time('catharsis');
require('catharsis');
console.timeEnd('catharsis');

console.time('parse-comments');
require('../lib/parse/type');
console.timeEnd('parse-comments');

console.time('doctrine');
require('doctrine');
console.timeEnd('doctrine');
console.time('total');
