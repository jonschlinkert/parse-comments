'use strict';

module.exports = function(app, options) {
  return function(snapdragon) {
    var description = '';
    var example;

    var inside = {
      description: false,
      example: false
    };

    snapdragon.parser
      .set('newline', function() {
        var pos = this.position();
        var match = this.match(/^\n+/);

        if (match) {
          if (inside.example) {
            example.val += match[0];

          } else if (inside.description) {
            description.val += match[0];

          } else {

            return pos(this.node({
              type: 'newline',
              val: match[0]
            }));
          }
        }
      })

      .set('text', function() {
        if (this.nodes.length > 2) return;
        var pos = this.position();
        var match = this.match(/^\s*(?!@|```)[^\n]+/);
        if (!match) return;

        if (inside.example) {
          example.code += match[0];
          example.val += match[0];

        } else if (!description) {
          inside.description = true;

          var node = this.node({
            type: 'description',
            val: match[0].trim()
          });

          description = pos(node);
          return description;

        } else {
          description.val = match[0].trim();
        }
      })

      .set('tag', function() {
        var pos = this.position();
        var match = this.match(/^\s*@(\S+) *([^\n]*)/);
        if (match) {
          inside.description = false;
          return pos(this.node({
            type: 'tag',
            val: match[0],
            tag: {
              key: match[1],
              val: match[2]
            }
          }));
        }
      })

      .set('example', function() {
        var pos = this.position();
        var match = this.match(/^[ \t]*(```)(.*)/);
        if (match) {
          inside.description = false;
          if (!inside.example) {
            inside.example = true;
            example = pos(this.node({
              type: 'example',
              val: match[0] + '\n',
              lang: match[2],
              code: ''
            }));

            return example;
          } else {
            inside.example = false;
            example.val += match[0];
            example = undefined;
          }
        }
      })

  };
};
