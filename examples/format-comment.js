const comments = require('..');

const fixture = `
  /**
   * This is a description.
   *
   * **Example 1**
   * This is an example
   *
   * \`\`\`js
   * const foo = "bar";
   * \`\`\`
   *
   * @param {boolean} a
   * @param {String} b
   * @param {String} \`c\`
   * @param {String} [d]
   * @param userInfo Information about the user.
   * @param userInfo.name The name of the user.
   * @param userInfo.email The email of the user.
   * @param {{a: number, b: string, c}} myObj description
   * @return {Object.<number, string>}
   */

  function foo(a, b, c) {}
`;

const res = comments.parse(fixture, { format: true });
console.log(res);
