'use strict';

require('mocha');
var assert = require('assert');
var Comments = require('..');
var comments;

describe('tokenize-comment', function() {
  describe('sound check', function() {
    it('should export a function', function() {
      assert.equal(typeof Comments, 'function');
    });
  });
});
