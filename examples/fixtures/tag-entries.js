/**
 * Create a new `Cache`. Internally the `Cache` constructor is created using
 * the `namespace` function, with `cache` defined as the storage object.
 *
 * ```js
 * var app = new Cache();
 * ```
 * @param {({stream: Writable}|String|Array)} options
 * @param {({stream: Writable})|String|Array} options
 * @param {{stream: Writable}|(String|Array)} options
 * @param {{stream: Writable|Foo}|String|Array} options
 */

function Cache(cache) {
  if (prop) {
    this[prop] = {};
  }
  if (cache) {
    this.set(cache);
  }
}