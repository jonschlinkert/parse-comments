# Comments

## Overview

**Steps**

1. Lexer 
  - token stream
2. Parser 
  - AST
  - Context object

**Emit**

- `token`
- `node`



- normalizers
- actions

## File based

- context transformers

## App level

- namespaces/nested events
- app "middleware" (stages)

## Parsers

- name
- block tags
- inline tags


## Tags

Supported `@tags`:

- `author`
- `ctor`/`constructor`
- `class`
- `default`
- `emits`
- `example`
- `extends`
- `line`
- `meta` A comment that begin with `@meta` must be the first comment in a file. Comments marked with `@meta` will extend all other comments in a file until the file ends or the `@endmeta` tag is reached.
- `name`
- `namespace`
- `param`/`parameter`
- `prop`/`property`
- `return`/`returns`
- `since`
- `throws`
- `type`
- `version`


Name and membership:

| **Tag** | **Description** |
| --- | --- |
| `@name` _name_ | override the parsed name and use the given name instead |
| `@memberOf` _parent name_ | the documented variable is a member of the specified object. |
| `@parent` _parent name_ | the documented variable is a member of the specified object. |


### Manual categorization

These tags are useful in cases where it's ambiguous how a variable should be interpreted:

| **Tag** | **Marks a variable as** |
| --- | --- |
| `@function` | a function |
| `@field`    | a non-function value |
| `@public`   | public (especially inner variables) |
| `@private`  | private |
| `@inner`    | inner and thus also private |
| `@static`   | accessible without instantiation |


## JSDoc tags

### Block Tags

- `@api` (aliases: `@access`) - Specify the access level of the member: `private`, `public`, or `protected`.
- `@alias` - Indicates that the given member is an alias to another (referenced) member.
- `@author` - Identify the author of an item.
- `@borrows` - This object uses something from another object.
- `@class` - This function is intended to be called with the "new" keyword.
- `@classdesc` - Use the following text to describe the entire class.
- `@constant` - Document an object as a constant. (aliases: `@const`))
- `@const` - alias for `@constant`
- `@constructs` - This function member will be the constructor for the previous class.
- `@constructor` - alias for `@class`
- `@copyright` - Document some copyright information.
- `@default` - (aliases: `@defaultvalue`) Document the default value.
- `@deprecated` - Document that this is no longer the preferred way.
- `@description` - (aliases: `@desc`) Describe a member.
- `@emits` - (aliases: `@fires`) Describe the events this method may emit.
- `@enum` - Document a collection of related properties.
- `@event` - Document an event.
- `@example` - Provide an example of how to use a documented item.
- `@exports` - Identify the member that is exported by a JavaScript module.
- `@extends` - (aliases: `@augments`) Indicates that a member inherits from, ands adds to, a parent member.
- `@external` - (aliases: `@host`) Identifies an external class, namespace, or module.
- `@file` - (aliases: `@fileoverview`, `@overview`) Describe a file.
- `@function` - (aliases: `@func`, `@method`) Describe a function or method.
- `@frozen` 
- `@global` - Document a global object.
- `@ignore` - Omit a member from the documentation.
- `@implements` - This member implements an interface.
- `@inheritdoc` - Indicate that a member should inherit its parent's documentation.
- `@inner` - Document an inner object.
- `@instance` - Document an instance member.
- `@interface` - This member is an interface that others can implement.
- `@kind` - What kind of member is this?
- `@lends` - Document properties on an object literal as if they belonged to a member with a given name.
- `@license` - Identify the license that applies to this code.
- `@listens` - List the events that a member listens for.
- `@member` - (aliases: `@var`) Document a member.
- `@memberOf` - This member belongs to a parent member.
- `@mixes` - This object mixes in all the members from another object.
- `@mixin` - Document a mixin object.
- `@module` - Document a JavaScript module.
- `@name` - Override the parsed name of the member.
- `@namespace` - Document a namespaces object.
- `@overrides` - (aliases: `@override`) Indicate that a member overrides its parent.
- `@param` - (aliases: `@arg`, `@argument`) Document the parameter to a function.
- `@placeholder` - (aliases: `@abstract`, `@virtual`) Indicates the the member is only a placeholder and must be implemented or overridden by the implementor. 
- `@private` - Indicates that a member is private and is not intended to be exposed for public use.
- `@prop` - (aliases: `@property`) Document a property of an object.
- `@protected` - Indicates that a member is protected.
- `@public` - Indicates that a member is exposed on the public API.
- `@readOnly` - This member is meant to be read-only.
- `@requires` - This file requires a JavaScript module.
- `@return` - (aliases: `@returns`) Document the return value of a function.
- `@see` - Refer to some other documentation for more information.
- `@since` - When was this feature added?
- `@static` - Document a static member.
- `@summary` - A shorter version of the full description.
- `@this` - Describes what the `this` keyword refers to in a specified scope.
- `@throws` - (aliases: `@exception`) Describe what errors could be thrown.
- `@todo` - Document tasks to be completed.
- `@type` - Document the type of an object.
- `@typedef` - Document a custom type.
- `@version` - Documents the version number of an item.

### Inline Tags

- `{@link}` - Link to another item in the documentation.
- `{@tutorial}` - Link to a tutorial.

### Not supported

The following JSDoc tags are not supported. Reasoning is described next to some of the tags, but please feel comfortable opening an issue to discuss if you think we've missed a valid use case. 

_(Note that any of these tags may also be implemented using plugins)_

- `@variation` - This tag is intended to allow the developer to disambiguate between two members with the same exact name. We believe a better way to disambiguate is to rename one of the members. 
- `@tutorial` 


## javadoc Tags

Javadoc recognizes the following tags.

| **Tag** | **Description** | **Syntax** |
| --- | --- | --- |
| `@author` | Adds the author of a class. | `@author name-text` |
| `{@code}` | Displays text in code font without interpreting the text as HTML markup or nested javadoc tags. | `{@code text}` |
| `{@docRoot}` | Represents the relative path to the generated document's root directory from any generated page. | `{@docRoot}` |
| `@deprecated` | Adds a comment indicating that this API should no longer be used. | `@deprecated deprecatedtext` |
| `@exception` | Adds a <b>Throws</b> subheading to the generated documentation, with the classname and description text. | `@exception class-name description` |
| `{@inheritDoc}` | Inherits a comment from the <b>nearest</b> inheritable class or implementable interface. | Inherits a comment from the immediate surperclass. |
| `{@link}` | Inserts an in-line link with the visible text label that points to the documentation for the specified package, class, or member name of a referenced class. | `{@link package.class#member label}` |
| `{@linkplain}` | Identical to `{@link}`, except the link's label is displayed in plain text than code font. | `{@linkplain package.class#member label}` |
| `@param` | Adds a parameter with the specified parameter-name followed by the specified description to the "Parameters" section. | `@param parameter-name description` |
| `@return` | Adds a "Returns" section with the description text. | `@return description` |
| `@see` | Adds a "See Also" heading with a link or text entry that points to reference. | `@see reference` |
| `@since` | Adds a "Since" heading with the specified since-text to the generated documentation. | `@since release` |
| `@throws` | The `@throws` and `@exception` tags are synonyms. | `@throws class-name description` |
| `{@value}` | When `{@value}` is used in the doc comment of a static field, it displays the value of that constant. | `{@value package.class#field}` |
| `@version` | Adds a "Version" subheading with the specified version-text to the generated docs when the -version option is used. | `@version version-text` |
