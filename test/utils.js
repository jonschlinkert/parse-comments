'use strict';

require('mocha');
var assert = require('assert');
var extract = require('extract-comments');
var utils = require('../lib/utils');

describe('utils', function() {
  describe('isValidBlockComment', function() {
    it('should be true when comment has double stars', function() {
      assert(utils.isValidBlockComment('/** foo */'));
      assert(utils.isValidBlockComment(extract('/** foo */')[0]));
    });

    it('should be false when comment has single star', function() {
      assert(!utils.isValidBlockComment('/* foo */'));
      assert(!utils.isValidBlockComment(extract('/* foo */')[0]));
    });

    it('should be true when single star and allowSingleStar is true', function() {
      assert(utils.isValidBlockComment('/* foo */', {allowSingleStar: true}));
      assert(utils.isValidBlockComment(extract('/* foo */')[0], {allowSingleStar: true}));
    });
  });

  describe('isProtectedComment', function() {
    it('should be true when double-star comment is protected', function() {
      assert(utils.isProtectedComment('/**! foo */'));
    });

    it('should be true when single-star comment is protected', function() {
      assert(utils.isProtectedComment('/*! foo */'));
    });

    it('should be false when comment is not protected', function() {
      assert(!utils.isProtectedComment('/** foo */'));
    });
  });

  describe('isConfigComment', function() {
    it('should be true a comment has eslint config', function() {
      assert(utils.isConfigComment('/* eslint-env node, mocha */'));
      assert(utils.isConfigComment('/* eslint eqeqeq: 0, curly: 2 */'));
      assert(utils.isConfigComment('/* eslint quotes: ["error"], curly: 2 */'));
      assert(utils.isConfigComment('/* eslint "plugin1/rule1": "error" */'));
      assert(utils.isConfigComment('/* eslint-disable */'));
      assert(utils.isConfigComment('/* eslint-enable */'));
    });

    it('should be true a comment has global eslint config', function() {
      assert(utils.isConfigComment('/* global var1, var2 */'));
      assert(utils.isConfigComment('/* global var1:false, var2:false */'));
    });

    it('should be true a comment is not a config comment', function() {
      assert(!utils.isConfigComment('/* eslint */'));
      assert(!utils.isConfigComment('/* global */'));
    });
  });

  describe('stripStars', function() {
    it('should strip stars from a comment with double stars', function() {
      var comment = '/**\n * Foo bar baz\n *   this\n *   is\n *   a\n *    comment\n */';
      var expected = '*\nFoo bar baz\n  this\n  is\n  a\n   comment';
      assert.equal(utils.stripStars(comment), expected);

      comment = '/**\n * Foo bar baz\n   this\n   is\n   a\n *    comment\n */';
      expected = '*\nFoo bar baz\n  this\n  is\n  a\n   comment';
      assert.equal(utils.stripStars(comment), expected);
    });

    it('should strip stars from a comment with a single star', function() {
      var comment = '/*\n * Foo bar baz\n   this\n   is\n   a\n *    comment\n */';
      var expected = '\nFoo bar baz\n  this\n  is\n  a\n   comment';
      assert.equal(utils.stripStars(comment), expected);

      comment = '/*\n * Foo bar baz\n *   this\n *   is\n *   a\n *    comment\n */';
      expected = '\nFoo bar baz\n  this\n  is\n  a\n   comment';
      assert.equal(utils.stripStars(comment), expected);
    });

    it('should strip stars from a protected comment', function() {
      var comment = '/**!\n * Foo bar baz\n *   this\n *   is\n *   a\n *    comment\n */';
      var expected = '*!\nFoo bar baz\n  this\n  is\n  a\n   comment';
      assert.equal(utils.stripStars(comment), expected);

      comment = '/**!\n * Foo bar baz\n   this\n   is\n   a\n *    comment\n */';
      expected = '*!\nFoo bar baz\n  this\n  is\n  a\n   comment';
      assert.equal(utils.stripStars(comment), expected);
    });
  });
});
