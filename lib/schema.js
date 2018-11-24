
class Schema {
  constructor() {
    this.fields = {};
    this.errors = [];
  }

  field(name, type, config = {}) {
    const defaults = { type: '*', normalize: val => val, validate: val => val };

    if (type && typeof type === 'object') config = type;
    if (typeof type === 'function') config = { type: '*', normalize: type };
    if (typeof config === 'function') config = { type, normalize: config };

    config.type = config.type.toLowerCase();
    this.fields[name] = { ...defaults, ...config };
    return this;
  }

  error(message, field, comment) {
    let { name } = field;
    let err = new Error(`Invalid ${name} type: "${comment[name]}"`);
    err.comment = comment;
    err.field = field;

    if (this.options.strict) {
      throw err;
    }

    this.emit('error', err);
    this.errors.push(err);
  }

  validate(field, value, comment) {
    if (field.type !== '*' && typeof value !== field.type) {
      this.error(field, comment);
    }
    return field.validate(value, comment);
  }

  normalize(comment) {
    for (const key of Object.keys(comment)) {
      let field = this.fields[key];
      let value = comment[key];

      if (field && field.validate(value, comment)) {
        comment[key] = field.normalize(value, comment);
      }
    }
    return comment;
  }
}

module.exports = Schema;
