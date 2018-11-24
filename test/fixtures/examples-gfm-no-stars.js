/**
 * @ngdoc function
 * @name angular.forEach
 * @module ng
 * @kind function
 *
 * @description
 * Invokes the `iterator` function once for each item in `obj` collection, which can be either an
 * object or an array. The `iterator` function is invoked with `iterator(value, key, obj)`, where `value`
 * is the value of an object property or an array element, `key` is the object property key or
 * array element index and obj is the `obj` itself. Specifying a `context` for the function is optional.
 *
 * It is worth noting that `.forEach` does not iterate over inherited properties because it filters
 * using the `hasOwnProperty` method.
 *
 * Unlike ES262's
 * [Array.prototype.forEach](http://www.ecma-international.org/ecma-262/5.1/#sec-15.4.4.18),
 * Providing 'undefined' or 'null' values for `obj` will not throw a TypeError, but rather just
 * return the value provided.
 *
   ```js
     var values = {name: 'misko', gender: 'male'};
     var log = [];
     angular.forEach(values, function(value, key) {
       this.push(key + ': ' + value);
     }, log);
     expect(log).toEqual(['name: misko', 'gender: male']);
   ```
 *
 * @param {Object|Array} obj Object to iterate over.
 * @param {Function} iterator Iterator function.
 * @param {Object=} context Object to become context (`this`) for the iterator function.
 * @returns {Object|Array} Reference to `obj`.
 */
