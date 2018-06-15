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
const comments = require('parse-comments');
const ast = comments.parse(str);
console.log(ast);
```

Parses a comment like this:

```js
/**
 * Register a handler function to be called on a node of the given `type`.
 * Override a built-in handler `type`, or register a new type.
 *
 * ```js
 * comments.set('param', function(node) {
 *   // do stuff to node
 * });
 * ```
 * @param {String} `type` The `node.type` to call the handler on. You can override built-in middleware by registering a handler of the same name, or register a handler for rendering a new type.
 * @param {Function} `fn` The handler function
 * @return {Object} Returns the instance for chaining.
 * @api public
 */

set(type, fn) {
  // do stuff
}
```

Into an array of comment objects, like this:

```js
[
  {
    type: 'BlockComment',
    val:
      '\nRegister a handler function to be called on a node of the given `type`.\nOverride a built-in handler `type`, or register a new type.\n\n```js\ncomments.set("param", function(node) {\n  // do stuff to node\n});\n```\n@param {String} `type` The `node.type` to call the handler on. You can override built-in middleware by registering a handler of the same name, or register a handler for rendering a new type.\n@param {Function} `fn` The handler function\n@return {Object} Returns the instance for chaining.\n@api public',
    range: [0, 549],
    loc: {
      start: {
        line: 1,
        column: 0
      },
      end: {
        line: 14,
        column: 3
      }
    },
    codeStart: 551,
    raw:
      '*\n * Register a handler function to be called on a node of the given `type`.\n * Override a built-in handler `type`, or register a new type.\n *\n * ```js\n * comments.set("param", function(node) {\n *   // do stuff to node\n * });\n * ```\n * @param {String} `type` The `node.type` to call the handler on. You can override built-in middleware by registering a handler of the same name, or register a handler for rendering a new type.\n * @param {Function} `fn` The handler function\n * @return {Object} Returns the instance for chaining.\n * @api public\n ',
    code: {
      context: {
        type: 'method',
        ctor: undefined,
        name: 'undefinedset',
        params: ['type', 'fn'],
        string: 'undefinedset()'
      },
      val: 'set(type, fn) {',
      range: [551, 566],
      loc: {
        start: {
          line: 16,
          column: 0
        },
        end: {
          line: 16,
          column: 15
        }
      }
    },
    description:
      'Register a handler function to be called on a node of the given `type`.\nOverride a built-in handler `type`, or register a new type.',
    footer: '',
    examples: [
      {
        type: 'gfm',
        raw: '```js\ncomments.set("param", function(node) {\n  // do stuff to node\n});\n```',
        description: '',
        language: 'js',
        val: '\ncomments.set("param", function(node) {\n  // do stuff to node\n});\n'
      }
    ],
    tags: [
      {
        title: 'param',
        name: 'type',
        description:
          'The `node.type` to call the handler on. You can override built-in middleware by registering a handler of the same name, or register a handler for rendering a new type.',
        type: {
          type: 'NameExpression',
          name: 'String'
        }
      },
      {
        title: 'param',
        name: 'fn',
        description: 'The handler function',
        type: {
          type: 'NameExpression',
          name: 'Function'
        }
      },
      {
        title: 'return',
        name: '',
        description: 'Returns the instance for chaining.',
        type: {
          type: 'NameExpression',
          name: 'Object'
        }
      },
      {
        title: 'api',
        name: 'public',
        description: ''
      }
    ]
  }
]
```

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
| 35 | [jonschlinkert](https://github.com/jonschlinkert) |
| 4 | [doowb](https://github.com/doowb) |

### Author

**Jon Schlinkert**

* [LinkedIn Profile](https://linkedin.com/in/jonschlinkert)
* [GitHub Profile](https://github.com/jonschlinkert)
* [Twitter Profile](https://twitter.com/jonschlinkert)

### License

Copyright © 2018, [Jon Schlinkert](https://github.com/jonschlinkert).
Released under the [MIT License](LICENSE).

***

_This file was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme), v0.6.0, on March 25, 2018._