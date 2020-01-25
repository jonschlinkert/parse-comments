# parse-comments [![NPM version](https://img.shields.io/npm/v/parse-comments.svg?style=flat)](https://www.npmjs.com/package/parse-comments) [![NPM monthly downloads](https://img.shields.io/npm/dm/parse-comments.svg?style=flat)](https://npmjs.org/package/parse-comments) [![NPM total downloads](https://img.shields.io/npm/dt/parse-comments.svg?style=flat)](https://npmjs.org/package/parse-comments) [![Linux Build Status](https://img.shields.io/travis/jonschlinkert/parse-comments.svg?style=flat&label=Travis)](https://travis-ci.org/jonschlinkert/parse-comments)

> Parse code comments from JavaScript or any language that uses the same format.

Please consider following this project's author, [Jon Schlinkert](https://github.com/jonschlinkert), and consider starring the project to show your :heart: and support.

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install --save parse-comments
```

## Usage

```js
const Comments = require('parse-comments');
const comments = new Comments();
const ast = comments.parse(str);
console.log(ast);
```

Parses a comment like this:

```js
/**
 * Create an instance of `CustomClass` with the given `options`.
 *
 * @param {String} options
 * @api public
 */

class CustomClass {
  constructor(options) {
    this.options = options;
  }
  set(type, fn) {
    // do stuff
  }
}
```

Into an array of comment objects, like this:

```js
[
  {
    type: 'BlockComment',
    value: '\nCreate an instance of `CustomClass` with the given `options`.\n\n@param {String} options\n@api public',
    range: [0, 117],
    loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 3 } },
    codeStart: 119,
    raw:
      '*\n * Create an instance of `CustomClass` with the given `options`.\n *\n * @param {String} options\n * @api public\n ',
    code: {
      context: {
        type: 'class',
        ctor: 'CustomClass',
        name: 'CustomClass',
        extends: undefined,
        string: 'new CustomClass()'
      },
      value: 'class CustomClass {',
      range: [119, 138],
      loc: { start: { line: 8, column: 0 }, end: { line: 8, column: 19 } }
    },
    description: 'Create an instance of `CustomClass` with the given `options`.',
    footer: '',
    examples: [],
    tags: [
      {
        title: 'param',
        name: 'options',
        description: '',
        type: { type: 'NameExpression', name: 'String' }
      },
      { title: 'api', name: 'public', description: '' }
    ],
    inlineTags: []
  }
]
```

## API

### [Comments](index.js#L22)

Create an instance of `Comments` with the given `options`.

**Params**

* **{Object}**: options

**Example**

```js
const Comments = require('parse-comments');
const comments = new Comments();
```

**Params**

* `javascript` **{String}**: String of javascript
* `options` **{Object}**
* `returns` **{Object}**: Returns an object with `description` string, array of `examples`, array of `tags` (strings), and a `footer` if descriptions are defined both before and after tags.

**Example**

```js
const parser = new ParseComments();
const tokens = parser.tokenize([string]);
```

**Params**

* `str` **{String}**: String of javascript
* `options` **{Object}**
* `returns` **{Array}**: Array of objects.

**Example**

```js
const parser = new ParseComments();
const comments = parser.parse(string);
```

**Params**

* `str` **{String}**: JavaScript comment
* `options` **{Object}**
* `returns` **{Object}**: Parsed comment object

**Example**

```js
let parser = new ParseComments();
let comments = parser.parseComment(string);
```

**Params**

* **{Object}**: tok Takes a token from
* `returns` **{Object}**

**Example**

```js
// @constructor
// @param {String}
// @param {String} name
// @param {String} name The name to use for foo
```

**Params**

* **{Object}**: tok
* `returns` **{Object}**

**Example**

```js
// @constructor
// @param {String}
// @param {String} name
// @param {String} name The name to use for foo
```

**Params**

* **{String}**: value The
* `returns` **{Object}**

**Example**

```js
// @param {String}
// @param {...string}
// @param {function(...a)}
// @param {function(...a:b)}
// @param {String|Array}
// @param {(String|Array)}
// @param {{foo: bar}}
// @param {String[]}
// @param {Array<String|Function|Array>=}
```

**Params**

* **{string}**: str The string to parse
* `returns` **{object}**

**Example**

```js
// @param {String}
// @param {String|Array}
// @param {(String|Array)}
// @param {{foo: bar}}
```

Returns true if the given `comment` is valid (meaning the comment
may be parsed). Comments are considered valid when they begin with
`/**`, and do not contain `jslint`, `jshint`, `eshint`, or `eslint`.
A custom `isValid` function may be passed on the constructor options.

**Params**

* `comment` **{Object}**
* `options` **{Object}**
* `returns` **{Boolean}**

## About

<details>
<summary><strong>Contributing</strong></summary>

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](../../issues/new).

Please read the [contributing guide](.github/contributing.md) for advice on opening issues, pull requests, and coding standards.

</details>

<details>
<summary><strong>Running Tests</strong></summary>

Running and reviewing unit tests is a great way to get familiarized with a library and its API. You can install dependencies and run tests with the following command:

```sh
$ npm install && npm test
```

</details>

<details>
<summary><strong>Building docs</strong></summary>

_(This project's readme.md is generated by [verb](https://github.com/verbose/verb-generate-readme), please don't edit the readme directly. Any changes to the readme must be made in the [.verb.md](.verb.md) readme template.)_

To generate the readme, run the following command:

```sh
$ npm install -g verbose/verb#dev verb-generate-readme && verb
```

</details>

### Contributors

| **Commits** | **Contributor** |  
| --- | --- |  
| 73 | [jonschlinkert](https://github.com/jonschlinkert) |  
| 4  | [doowb](https://github.com/doowb) |  

### Author

**Jon Schlinkert**

* [GitHub Profile](https://github.com/jonschlinkert)
* [Twitter Profile](https://twitter.com/jonschlinkert)
* [LinkedIn Profile](https://linkedin.com/in/jonschlinkert)

### License

Copyright © 2020, [Jon Schlinkert](https://github.com/jonschlinkert).
Released under the [MIT License](LICENSE).

***

_This file was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme), v0.8.0, on January 25, 2020._