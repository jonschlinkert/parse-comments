module.exports = {
  // @kind
  kind: {
    allows: function(val) {

    },

    expects: function(val) {

    },

    normalize: function(val) {

    },

    isValid: function(name) {
      switch (name) {
        case 'class':
        case 'constant':
        case 'event':
        case 'external':
        case 'file':
        case 'function':
        case 'member':
        case 'mixin':
        case 'module':
        case 'namespace':
        case 'typedef':
          break;
        default: {
          throw new Error('invalid @kind: ' + name);
        }
        return true;
      }
    }
  }
};
