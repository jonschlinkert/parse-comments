# Comparison

Comparison of the results from [catharsis][], [doctrine][] and [parse-comments][].

## Rest Arguments

**Fixture**: 

```
...string
```

**Result**

```js
// doctrine
// N/A (throws parse error)

// catharsis
{ type: 'NameExpression', name: 'string', repeatable: true };

// parse-comments
{
  type: 'RestType',
  expression: { 
    type: 'NameExpression', 
    name: 'string' 
  }
}
```

**Fixture**: 

```
[...string]
```

**Result**

```js
// doctrine
{
  type: 'ArrayType',
  elements: [{ type: 'RestType', expression: { type: 'NameExpression', name: 'string' } }]
}

// catharsis
// N/A (throws parse error)

// parse-comments
{
  type: 'ArrayType',
  elements: [{ type: 'RestType', expression: { type: 'NameExpression', name: 'string' } }]
}
```