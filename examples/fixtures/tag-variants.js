/**
 * Create a new `Cache`. Internally the `Cache` constructor is created using
 * the `namespace` function, with `cache` defined as the storage object.
 *
 * ```js
 * var app = new Cache();
 * ```
 * @param {String} str
 * @param {Object} `cache` Optionally pass an object to initialize with.
 * @param {Array.<string>} Array of strings
 * @param {String} Foo bar
 * @param {String} `foo` bar baz
 * @param {String?} foo whatever
 * @param {String=} `foo=bar` whatever
 * @param {String=} [foo=bar] whatever
 * @param {{stream: Writable}} options
 * @param {Object|String} foo Bar baz
 * @param {(Object|String|Array)} [foo] bar baz
 * @return {Object} exports for chaining
 * @constructor
 * @api public
 */

function Cache(cache) {
  if (prop) {
    this[prop] = {};
  }
  if (cache) {
    this.set(cache);
  }
}