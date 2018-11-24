/**
 * Create a new `Cache`. Internally the `Cache` constructor is created using
 * the `namespace` function, with `cache` defined as the storage object.
 *
 * ```js
 * var app = new Cache();
 * ```
 * @param {Object} `cache` Optionally pass an object to initialize with.
 * @foo {Object} `cache` Optionally pass an object to initialize with.
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