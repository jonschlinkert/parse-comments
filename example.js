/**
 * Example output from `test/fixtures/strings.js`
 */

{
  comments: [
    {
      description: '\n\nCopyright (c) 2014 Sellside, Jon Schlinkert and Brian Woodward\nLicensed under the MIT License (MIT).\n/',
      lead: '/** Strings <https://github.com/sellside/strings>',
      heading: '',
      returns: undefined,
      line: 1
    },
    {
      description: '\n\nGet or set a propstring.\n\n**Example**\n\n```js\nstrings.propstring(\'permalinks\', \':destBase/:dirname/:basename/index.:ext\');\n```',
      param: ['{String} `name`', '{String} `propstring`'],
      return :'{Object} Instance of the current Strings object',
      api: 'public /',
      lead: '/** ## .propstring (name, propstring)',
      heading: '',
      params: [
        {
          type: 'String',
          name: 'name',
          description: ''
        },
        {
          type: 'String',
          name: 'propstring',
          description: ''
        }],
      returns: 'Object',
      line: 44
    },
    {
      description: '\n\nDefine a named parser to be used against any given string.\n\n**Example**\n\nPass an object:\n\n```js\nstrings.parser(\'prop\', {\npattern: /:([\\\\w]+)/,\nreplacement: function(match) {\nreturn match.toUpperCase();\n}\n);\n```\n\nOr an array\n\n```js\nstrings.parser(\'prop\', [\n{\npattern: \'a\',\nreplacement: \'b\'\n},\n{\npattern: \'c\',\nreplacement: \'d\'\n}\n]);\n```',
      param: ['{String} `name` name of the parser.',
          '{Object|Array} `pairings` array of replacement patterns to store with the given name.',
          '{String|RegExp} `pattern`',
          '{String|Function} `replacement`'],
      return :'{Object} Instance of the current Strings object',
      api: 'public /',
      lead: '/** ## .parser ( name, replacement-patterns )',
      heading: '',
      params: [
        {
          type: 'String',
          name: 'name',
          description: 'name of the parser.'
        },
        {
          type: 'Object|Array',
          name: 'pairings',
          description: 'array of replacement patterns to store with the given name.'
        },
        {
          type: 'String|RegExp',
          name: 'pattern',
          description: ''
        },
        {
          type: 'String|Function',
          name: 'replacement',
          description: ''
        }],
      returns: 'Object',
      line: 127
    },
    {
      description: '\n\nSimilar to `.process`, except that the first parameter is the name\nof the stored `propstring` to use, rather than any given string.\n\n**Example**\n\n```js\nstrings.transform(\'propstring\', [\'parser\'], {\nfoo: \'aaa\',\nbar: \'bbb\',\nbaz: \'ccc\'\n});\n```\n\nOr pass an object, `strings.transform({})`:\n\n```js\nstrings.transform({\npropstring: \'prop\',\nparsers: [\'prop\'],\ncontext: {\nfoo: \'aaa\',\nbar: \'bbb\',\nbaz: \'ccc\'\n}\n});\n```',
      param: ['{String} `name` The name of the stored template to use',
          '{Object} `context` The optional context object to bind to replacement functions as `this`'],
      return :'{String}',
      api: 'public /',
      lead: '/** ## .transform( named-propstring, named-parsers, context)',
      heading: '',
      params: [
        {
          type: 'String',
          name: 'name',
          description: 'The name of the stored template to use'
        },
        {
          type: 'Object',
          name: 'context',
          description: 'The optional context object to bind to replacement functions as `this`'
        }],
      returns: 'String',
      line: 301
    }],
  context: [
    {
      begin: 1,
      type: 'declaration',
      name: 'util',
      value: 'require(\'util\')',
      string: 'util',
      original: 'var util = require(\'util\');',
      comment: {
        description: '\n\nCopyright (c) 2014 Sellside, Jon Schlinkert and Brian Woodward\nLicensed under the MIT License (MIT).\n/',
        lead: '/** Strings <https://github.com/sellside/strings>',
        heading: '',
        returns: undefined
      },
      end: 6,
      heading: {
        level: 2,
        text: 'util'
      }
    },
    {
      begin: 11,
      type: 'declaration',
      name: 'frep',
      value: 'require(\'frep\')',
      string: 'frep',
      original: 'var frep = require(\'frep\');'
    },
    {
      begin: 12,
      type: 'declaration',
      name: '_',
      value: 'require(\'lodash\')',
      string: '_',
      original: 'var _ = require(\'lodash\');'
    },
    {
      begin: 13,
      type: 'declaration',
      name: 'utils',
      value: 'require(\'./lib/utils.js\')',
      string: 'utils',
      original: 'var utils = require(\'./lib/utils.js\');'
    },
    {
      begin: 17,
      type: 'function',
      name: 'Strings',
      string: 'Strings()',
      original: 'function Strings(context) {',
      comment: {
        description: '\n\n> Strings constructor method\n\nInstantiate a new instance of Strings, optionally passing a default context to use.',
        class: 'Strings',
        return :'{Object} Instance of a Strings object',
        constructor: 'true /',
        lead: '/** ## new Strings()',
        heading: '',
        returns: 'Object'
      },
      end: 27,
      heading: {
        level: 2,
        text: 'Strings'
      }
    },
    {
      begin: 34,
      type: 'property',
      receiver: 'this',
      name: '_context',
      value: 'context || {}',
      string: 'this._context',
      original: 'this._context = context || {};'
    },
    {
      begin: 35,
      type: 'property',
      receiver: 'this',
      name: '_replacements',
      value: '{}',
      string: 'this._replacements',
      original: 'this._replacements = {};'
    },
    {
      begin: 36,
      type: 'property',
      receiver: 'this',
      name: '_propstrings',
      value: '{}',
      string: 'this._propstrings',
      original: 'this._propstrings = {};'
    },
    {
      begin: 37,
      type: 'property',
      receiver: 'this',
      name: '_templates',
      value: '{}',
      string: 'this._templates',
      original: 'this._templates = {};'
    },
    {
      begin: 38,
      type: 'property',
      receiver: 'this',
      name: '_patterns',
      value: '{}',
      string: 'this._patterns',
      original: 'this._patterns = {};'
    },
    {
      begin: 39,
      type: 'property',
      receiver: 'this',
      name: '_parsers',
      value: '{}',
      string: 'this._parsers',
      original: 'this._parsers = {};'
    },
    {
      begin: 40,
      type: 'property',
      receiver: 'this',
      name: '_groups',
      value: '{}',
      string: 'this._groups',
      original: 'this._groups = {};'
    },
    {
      begin: 44,
      type: 'method',
      constructor: 'Strings',
      name: 'propstring',
      string: 'Strings.prototype.propstring()',
      original: 'Strings.prototype.propstring = function (name, str) {',
      comment: {
        description: '\n\nGet or set a propstring.\n\n**Example**\n\n```js\nstrings.propstring(\'permalinks\', \':destBase/:dirname/:basename/index.:ext\');\n```',
        param: ['{String} `name`', '{String} `propstring`'],
        return :'{Object} Instance of the current Strings object',
        api: 'public /',
        lead: '/** ## .propstring (name, propstring)',
        heading: '',
        params: [
          {
            type: 'String',
            name: 'name',
            description: ''
          },
          {
            type: 'String',
            name: 'propstring',
            description: ''
          }],
        returns: 'Object'
      },
      end: 59,
      heading: {
        level: 1,
        text: 'propstring'
      }
    },
    {
      begin: 70,
      type: 'method',
      constructor: 'Strings',
      name: 'pattern',
      string: 'Strings.prototype.pattern()',
      original: 'Strings.prototype.pattern = function (name, pattern, flags) {',
      comment: {
        description: '\n\nGet or set regular expression or string.\n\n**Example**\n\n```js\nstrings.pattern(\'prop\', \':([\\\\w]+)\');\n```',
        param: ['{String} `name`', '{String} `pattern`'],
        return :'{Object} Instance of the current Strings object',
        api: 'public /',
        lead: '/** ## .pattern (name, pattern)',
        heading: '',
        params: [
          {
            type: 'String',
            name: 'name',
            description: ''
          },
          {
            type: 'String',
            name: 'pattern',
            description: ''
          }],
        returns: 'Object'
      },
      end: 85,
      heading: {
        level: 1,
        text: 'pattern'
      }
    },
    {
      begin: 99,
      type: 'method',
      constructor: 'Strings',
      name: 'replacement',
      string: 'Strings.prototype.replacement()',
      original: 'Strings.prototype.replacement = function (name, replacement) {',
      comment: {
        description: '\n\nGet or set a replacement string or function.\n\n**Example**\n\n```js\nstrings.replacement(\'prop\', function(match) {\nreturn match.toUpperCase();\n});\n```',
        param: ['{String} `name`', '{String} `replacement`'],
        return :'{Object} Instance of the current Strings object',
        api: 'public /',
        lead: '/** ## .replacement (name, replacement)',
        heading: '',
        params: [
          {
            type: 'String',
            name: 'name',
            description: ''
          },
          {
            type: 'String',
            name: 'replacement',
            description: ''
          }],
        returns: 'Object'
      },
      end: 116,
      heading: {
        level: 1,
        text: 'replacement'
      }
    },
    {
      begin: 127,
      type: 'method',
      constructor: 'Strings',
      name: 'parser',
      string: 'Strings.prototype.parser()',
      original: 'Strings.prototype.parser = function (name, arr) {',
      comment: {
        description: '\n\nDefine a named parser to be used against any given string.\n\n**Example**\n\nPass an object:\n\n```js\nstrings.parser(\'prop\', {\npattern: /:([\\\\w]+)/,\nreplacement: function(match) {\nreturn match.toUpperCase();\n}\n);\n```\n\nOr an array\n\n```js\nstrings.parser(\'prop\', [\n{\npattern: \'a\',\nreplacement: \'b\'\n},\n{\npattern: \'c\',\nreplacement: \'d\'\n}\n]);\n```',
        param: ['{String} `name` name of the parser.',
             '{Object|Array} `pairings` array of replacement patterns to store with the given name.',
             '{String|RegExp} `pattern`',
             '{String|Function} `replacement`'],
        return :'{Object} Instance of the current Strings object',
        api: 'public /',
        lead: '/** ## .parser ( name, replacement-patterns )',
        heading: '',
        params: [
          {
            type: 'String',
            name: 'name',
            description: 'name of the parser.'
          },
          {
            type: 'Object|Array',
            name: 'pairings',
            description: 'array of replacement patterns to store with the given name.'
          },
          {
            type: 'String|RegExp',
            name: 'pattern',
            description: ''
          },
          {
            type: 'String|Function',
            name: 'replacement',
            description: ''
          }],
        returns: 'Object'
      },
      end: 167,
      heading: {
        level: 1,
        text: 'parser'
      }
    },
    {
      begin: 178,
      type: 'method',
      constructor: 'Strings',
      name: 'extend',
      string: 'Strings.prototype.extend()',
      original: 'Strings.prototype.extend = function (name, arr) {',
      comment: {
        description: '\n\nExtend a parser.\n\n**Example**\n\n```js\nstrings.extend(\'prop\', {\npattern: /:([\\\\w]+)/,\nreplacement: function(match) {\nreturn match.toUpperCase();\n}\n);\n```',
        param: ['{String} `name` name of the parser to extend.',
             '{Object|Array} `arr` array of replacement patterns to store with the given name.',
             '{String|RegExp} `pattern`',
             '{String|Function} `replacement`'],
        return :'{Object} Instance of the current Strings object',
        api: 'public /',
        lead: '/** ## .extend ( parser, replacement-patterns )',
        heading: '',
        params: [
          {
            type: 'String',
            name: 'name',
            description: 'name of the parser to extend.'
          },
          {
            type: 'Object|Array',
            name: 'arr',
            description: 'array of replacement patterns to store with the given name.'
          },
          {
            type: 'String|RegExp',
            name: 'pattern',
            description: ''
          },
          {
            type: 'String|Function',
            name: 'replacement',
            description: ''
          }],
        returns: 'Object'
      },
      end: 200,
      heading: {
        level: 1,
        text: 'extend'
      }
    },
    {
      begin: 204,
      type: 'declaration',
      name: 'parser',
      value: '_.union(this._parsers[name], arr)',
      string: 'parser',
      original: 'var parser = _.union(this._parsers[name], arr);'
    },
    {
      begin: 210,
      type: 'method',
      constructor: 'Strings',
      name: 'parsers',
      string: 'Strings.prototype.parsers()',
      original: 'Strings.prototype.parsers = function (parsers) {',
      comment: {
        description: '\n\nReturn a list of parsers based on the given list of named\nparsers or parser objects.\n\n**Example**\n\n```js\n// pass an array of parser names\nstrings.parsers([\'a\', \'b\', \'c\']);\n\n// or a string\nstrings.parsers(\'a\');\n```',
        param: '{String|Array} `parsers` named parsers or parser objects to use.',
        return :'{Array}',
        api: 'public /',
        lead: '/** ## .parsers ( parsers )',
        heading: '',
        params: [
          {
          type: 'String|Array',
          name: 'parsers',
          description: 'named parsers or parser objects to use.'
        }],
        returns: 'Array'
      },
      end: 229,
      heading: {
        level: 1,
        text: 'parsers'
      }
    },
    {
      begin: 240,
      type: 'declaration',
      name: '_parsers',
      value: '_.map(parsers, function (parser) {',
      string: '_parsers',
      original: 'var _parsers = _.map(parsers, function (parser) {'
    },
    {
      begin: 257,
      type: 'method',
      constructor: 'Strings',
      name: 'template',
      string: 'Strings.prototype.template()',
      original: 'Strings.prototype.template = function (name, propstring, parsers) {',
      comment: {
        description: '\n\nStore, by name, a named propstring and an array of parsers.\n\n**Example**\n\n```js\n// strings.template(name string, array);\nstrings.template(\'prop\', [\'prop\'], {\nfoo: \'aaa\',\nbar: \'bbb\',\nbaz: \'ccc\'\n});\n```',
        param: ['{String} `name` The name of the template to store',
             '{String} `name` Name of replacement group to use for building the final string',
             '{Object} `context` Optional Object to bind to replacement function as `this`'],
        return :'{String}',
        api: 'public /',
        lead: '/** ## .template( name, propstring, parsers )',
        heading: '',
        params: [
          {
            type: 'String',
            name: 'name',
            description: 'The name of the template to store'
          },
          {
            type: 'String',
            name: 'name',
            description: 'Name of replacement group to use for building the final string'
          },
          {
            type: 'Object',
            name: 'context',
            description: 'Optional Object to bind to replacement function as `this`'
          }],
        returns: 'String'
      },
      end: 278,
      heading: {
        level: 1,
        text: 'template'
      }
    },
    {
      begin: 301,
      type: 'method',
      constructor: 'Strings',
      name: 'transform',
      string: 'Strings.prototype.transform()',
      original: 'Strings.prototype.transform = function (propstring, parsers, context) {',
      comment: {
        description: '\n\nSimilar to `.process`, except that the first parameter is the name\nof the stored `propstring` to use, rather than any given string.\n\n**Example**\n\n```js\nstrings.transform(\'propstring\', [\'parser\'], {\nfoo: \'aaa\',\nbar: \'bbb\',\nbaz: \'ccc\'\n});\n```\n\nOr pass an object, `strings.transform({})`:\n\n```js\nstrings.transform({\npropstring: \'prop\',\nparsers: [\'prop\'],\ncontext: {\nfoo: \'aaa\',\nbar: \'bbb\',\nbaz: \'ccc\'\n}\n});\n```',
        param: ['{String} `name` The name of the stored template to use',
             '{Object} `context` The optional context object to bind to replacement functions as `this`'],
        return :'{String}',
        api: 'public /',
        lead: '/** ## .transform( named-propstring, named-parsers, context)',
        heading: '',
        params: [
          {
            type: 'String',
            name: 'name',
            description: 'The name of the stored template to use'
          },
          {
            type: 'Object',
            name: 'context',
            description: 'The optional context object to bind to replacement functions as `this`'
          }],
        returns: 'String'
      },
      end: 335,
      heading: {
        level: 1,
        text: 'transform'
      }
    },
    {
      begin: 348,
      type: 'method',
      constructor: 'Strings',
      name: 'use',
      string: 'Strings.prototype.use()',
      original: 'Strings.prototype.use = function (template, context) {',
      comment: {
        description: '\n\nSimilar to `.process`, except that the first parameter is the name\nof the stored `propstring` to use, rather than any given string.\n\n**Example**\n\n```js\nstrings.use(\'propstring\', [\'parser\'], {\nfoo: \'aaa\',\nbar: \'bbb\',\nbaz: \'ccc\'\n});\n```\n\nOr pass an object, `strings.use({})`:\n\n```js\nstrings.use({\npropstring: \'prop\',\nparsers: [\'prop\'],\ncontext: {\nfoo: \'aaa\',\nbar: \'bbb\',\nbaz: \'ccc\'\n}\n});\n```',
        param: ['{String} `name` The name of the stored template to use',
             '{Object} `context` The optional context object to bind to replacement functions as `this`'],
        return :'{String}',
        api: 'public /',
        lead: '/** ## .use( named-propstring, named-parsers, context)',
        heading: '',
        params: [
          {
            type: 'String',
            name: 'name',
            description: 'The name of the stored template to use'
          },
          {
            type: 'Object',
            name: 'context',
            description: 'The optional context object to bind to replacement functions as `this`'
          }],
        returns: 'String'
      },
      end: 382,
      heading: {
        level: 1,
        text: 'use'
      }
    },
    {
      begin: 385,
      type: 'declaration',
      name: 'tmpl',
      value: 'this.template(template)',
      string: 'tmpl',
      original: 'var tmpl = this.template(template);'
    },
    {
      begin: 390,
      type: 'method',
      constructor: 'Strings',
      name: 'process',
      string: 'Strings.prototype.process()',
      original: 'Strings.prototype.process = function (str, arr, context) {',
      comment: {
        description: '\n\nDirectly process the given string, using a named replacement\npattern or array of named replacement patterns, with the given\ncontext.\n\n**Example**\n\n```js\nstrings.process(\':foo/:bar/:baz\', [\'a\', \'b\', \'c\'], {\nfoo: \'aaa\',\nbar: \'bbb\',\nbaz: \'ccc\'\n});\n```',
        param: ['{String} `str` the string to process',
             '{String|Object|Array} `parsers` named parsers or parser objects to use when processing.',
             '{Object} `context` context to use. optional if a global context is passed.'],
        return :'{String}',
        api: 'public /',
        lead: '/** ## .process (str, parsers, context)',
        heading: '',
        params: [
          {
            type: 'String',
            name: 'str',
            description: 'the string to process'
          },
          {
            type: 'String|Object|Array',
            name: 'parsers',
            description: 'named parsers or parser objects to use when processing.'
          },
          {
            type: 'Object',
            name: 'context',
            description: 'context to use. optional if a global context is passed.'
          }],
        returns: 'String'
      },
      end: 412,
      heading: {
        level: 1,
        text: 'process'
      }
    },
    {
      begin: 415,
      type: 'declaration',
      name: 'parsers',
      value: 'this.parsers(arr)',
      string: 'parsers',
      original: 'var parsers = this.parsers(arr);'
    },
    {
      begin: 416,
      type: 'declaration',
      name: 'ctx',
      value: '_.extend({}, this._context, context)',
      string: 'ctx',
      original: 'var ctx = _.extend({}, this._context, context);'
    },
    {
      begin: 421,
      type: 'method',
      constructor: 'Strings',
      name: 'group',
      string: 'Strings.prototype.group()',
      original: 'Strings.prototype.group = function (groupName, propstring, parsers) {',
      comment: {
        description: '\n\nDefine a named group of propstring/parser mappings, or get a\ngroup if only the name is passed.\n\n**Example**\n\n```js\nstrings.group(\'my-group-name\', \':foo/:bar/:baz\', [\'a\', \'b\', \'c\']);\n```\n\nTo get a group:\n\n```js\nstrings.group( name );\n```',
        param: ['{String} `name`',
             '{String} `propstring` the name of the propstring to use',
             '{String|Array} `parsers` name or array of names of parsers to use'],
        return :'{Object} Instance of the current Strings object',
        api: 'public /',
        lead: '/** ## .group ( name, propstring, parsers )',
        heading: '',
        params: [
          {
            type: 'String',
            name: 'name',
            description: ''
          },
          {
            type: 'String',
            name: 'propstring',
            description: 'the name of the propstring to use'
          },
          {
            type: 'String|Array',
            name: 'parsers',
            description: 'name or array of names of parsers to use'
          }],
        returns: 'Object'
      },
      end: 444,
      heading: {
        level: 1,
        text: 'group'
      }
    },
    {
      begin: 458,
      type: 'method',
      constructor: 'Strings',
      name: 'run',
      string: 'Strings.prototype.run()',
      original: 'Strings.prototype.run = function (group, context) {',
      comment: {
        description: '\n\nProcess the specified group using the given context.\n\n**Example**\n\nSet: (`strings.run( string, object )`)\n\n```js\nstrings.run(\'my-group-name\', {\nfoo: \'aaa\',\nbar: \'bbb\',\nbaz: \'ccc\'\n});\n```',
        param: ['{String} `group` The group to run.',
             '{Object} `context` Optional context object, to bind to replacement function as `this`'],
        return :'{String}',
        api: 'public /',
        lead: '/** ## .run ( groupname, context )',
        heading: '',
        params: [
          {
            type: 'String',
            name: 'group',
            description: 'The group to run.'
          },
          {
            type: 'Object',
            name: 'context',
            description: 'Optional context object, to bind to replacement function as `this`'
          }],
        returns: 'String'
      },
      end: 479,
      heading: {
        level: 1,
        text: 'run'
      }
    },
    {
      begin: 482,
      type: 'declaration',
      name: 'namedGroup',
      value: 'this.group(group)',
      string: 'namedGroup',
      original: 'var namedGroup = this.group(group);'
    },
    {
      begin: 487,
      type: 'property',
      receiver: 'module',
      name: 'exports',
      value: 'Strings',
      string: 'module.exports',
      original: 'module.exports = Strings;'
    }]
}