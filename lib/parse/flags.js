function parsePrefix(node) {
  switch (node.val.charAt(0)) {
    case '*':
      node.all = true;
      return addPrefix(node);
    case '!':
      node.nullable = false;
      return addPrefix(node);
    case '?':
      node.nullable = true;
      return addPrefix(node);
    case '=':
      node.optional = true;
      return addPrefix(node);
    default: {
      return node;
    }
  }
}

function parseSuffix(node) {
  switch (node.val.slice(-1)) {
    case '*':
      node.all = true;
      return addSuffix(node);
    case '!':
      node.nullable = false;
      return addSuffix(node);
    case '?':
      node.nullable = true;
      return addSuffix(node);
    case '=':
      node.optional = true;
      return addSuffix(node);
    default: {
      return node;
    }
  }
}

function addPrefix(node) {
  node.prefix = true;
  node.val = node.val.slice(1);
  return parsePrefix(node);
}

function addSuffix(node) {
  node.val = node.val.slice(0, -1);
  return parseSuffix(node);
}
