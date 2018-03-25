/**
 * Set a parser that can later be used to parse any given string.
 *
 * ```js
 * // foo.parser(name, replacements)
 * foo.parser("foo", function(a, b, c) {
 *     // body...
 * })
 * ```
 *
 *   This is arbitrary text.
 *
 *   * This is arbitrary text.
 *   * This is arbitrary text.
 *   * This is arbitrary text.
 *
 * **Example**
 *
 * {%= docs("example-parser.md") %}
 *
 * This is a another description after the example.
 *
 * @param {String} `alpha`
 * @param {Object|Array} `arr` Object or array of replacement patterns to associate.
 *   @property {String|RegExp} [arr] `pattern`
 *   @property {String|Function} [arr] `replacement`
 * @param {String} `beta`
 *   @property {Array} [beta] `foo` This is foo option.
 *   @property {Array} [beta] `bar` This is bar option
 * @return {Strings} to allow chaining
 * @api public
 */
