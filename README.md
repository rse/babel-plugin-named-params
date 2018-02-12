
babel-plugin-named-params
=========================

Babel Plugin for Named Function Parameters

<p/>
<img src="https://nodei.co/npm/babel-plugin-named-params.png?downloads=true&stars=true" alt=""/>

<p/>
<img src="https://david-dm.org/rse/babel-plugin-named-params.png" alt=""/>

About
-----

This is a [Babel](https://babeljs.io/) transpiler plugin for transforming non-standard
*named function parameters* in ECMAScript 2015 source code.
In particular, it transpiles the following input constructs...

```js
fn(a = "foo", 42, d = "bar", 7)
baz.quux.fn(a = "foo", 42, d = "bar", 7)
```

...to the output constructs...

```js
T(undefined, fn, [ 42, 7 ], { a: "foo", d: "bar" })
T(baz.quux, baz.quux.fn, [ 42, 7 ], { a "foo", d: "bar" })
```

...where `T` is the "trampoline" function
of the corresponding run-time module
[`babel-runtime-named-params`](http://github.com/rse/babel-runtime-named-params).
Assuming the function `fn` was declared as `function fn (a, b,
c, d) { ... }`, these output constructs under run-time finally translate into...

```js
fn.apply(undefined, [ "foo", 42, 7, "bar" ])
baz.quux.fn.apply(baz.quux, [ "foo", 42, 7, "bar" ])
```

...or the equivalent of the regular calls:

```js
fn("foo", 42, 7, "bar")
baz.quux.fn("foo", 42, 7, "bar")
```

Features
--------

The following particular features are provided:

- *Parameter Syntax*: Named parameters are syntax-wise just ECMAScript assignment expressions
  `<identifier> = <expression>` inside function argument lists.
  But instead of assigning to a variable in the lexical scope of the
  function call, this now assigns to a parameter of the function call.

- *Parameter Ordering*: Named and positional parameters can be provided in an arbitrary order.
  For a function declaration `function fn (a, b, c) { ... }` all of the
  following function calls result in a call `fn(x, y, z)`:

  ```js
  fn(a = x, b = y, c = z)  // named parameters only
  fn(x, b = y, z)          // mixed parameters only (in positional order)
  fn(b = y, x, z)          // mixed parameters only (in arbitrary order)
  fn(x, z, b = y)          // mixed parameters only (in arbitrary order)
  ```

  In other words, the algorithm for determining the function call
  parameters is: first, the parameters (names and positions) of
  the target function are determined via the function source code
  (`Function.prototype.toString()`). Second, all named parameters are
  translated to resulting positional parameters at their particular
  positions. Third, all original positional parameters are translated to
  resulting positional parameters at still unused positions (from left
  to right). All remaining unused positions are filled with the value `undefined`.

- *Options Parameter*: In the JavaScript world, there is the convention of
  having an `opt`, `opts`, `option`, `options`, `setting` or `settings`
  function parameter which receives an object of options. In case a
  named parameter in the function call is not found in the function
  declaration, but such an options parameter exists, the named parameter
  is passed as an option parameter field. For a function declaration
  `function fn (a, b, c, options) { ... }` all of the following function
  calls result in a call `fn(x, y, z, { foo: 42, bar: 7 })`:

  ```js
  fn(x, y, z, options = { foo: 42, bar: 7 })  // explicit options parameter (in positional order)
  fn(options = { foo: 42, bar: 7 }, x, y, z)  // explicit options parameter (in arbitrary order)
  fn(x, y, z, foo = 42, bar = 7)              // options as named parameters
  fn(foo = 42, bar = 7, x, y, z)              // options as named parameters
  fn(x, y, z, options = { foo: 42 }, baz = 7) // explicit and implicit options
  fn(x, y, z, baz = 7, options = { foo: 42 }) // explicit and implicit options
  fn(a = x, b = y, c = z, foo = 42, bar = 7)  // everything as named parameters
  ```

Caveat Emptor
-------------

- *Function Declaration and Transpilation*: Although the named parameters need
  a Babel-based transpilation theirself, the function declarations
  should not be transpiled to a target environment below ECMAScript
  2015, as Babel would remove parameters with defaults from the
  function declaration. To be able to use function declarations of the
  form `fn (a, b, c = def1, d = def2) { ... }` you have to at least
  target an ECMAScript 2015 environment like Node 6 with the help of
  `@babel/preset-env` or the underlying `func-params` utility function
  will to be able to determine the `c` and `d` parameters.

- *Increased Code Size*: As the determination of function parameters is
  done under run-time (to support arbitrary existing code which is not
  part of the transpilation process itself), the resulting code size
  of your application increased by about 40KB. This is harmless for
  applications and libraries in the Node environments or applications
  in Browser environments, but can hurt you for libraries in Browser
  environments. Hence, try to not use this feature for libraries
  intended to be used in Browser environments or accept that their size
  increases by about 40KB.

- *Decreased Run-Time Performance*: As the determination of function parameters is
  done under run-time (to support arbitrary existing code which is not
  part of the transpilation process itself), the run-time performance
  decreases somewhat. At least on the first function invocation.
  Internally, the source code of the target function is parsed and the
  result cached. So, on the first function call, the parsing causes the
  function call to be much slower than the regular call, while on the
  second and all subsequent function calls, the indirect function call
  is just slightly slower than the regular call.

Installation
------------

```shell
$ npm install @babel/core
$ npm install @babel/preset-env
$ npm install babel-plugin-named-params
$ npm install babel-runtime-named-params
```

Usage
-----

- `.babelrc`:

```json
{
    "presets": [
        [ "@babel/preset-env", {
            "targets": {
                "node": "8.0"
            }
        } ]
    ],
    "plugins": [ "named-params" ]
}
```

- `sample.js`:

```js
const f1 = (a, b, c = "foo", d = "bar") => {
    console.log(`a=<${a}> b=<${b}> c=<${c}> d=<${d}>`)
}
f1(1, 2, 3, 4)
f1(1, 2, d = "4", 3)
f1(1, 2, d = "4", c = "3")
f1(a = "1", 2, c = "3", d = "4")

const f2 = (a, b, options = {}) => {
    console.log(`a=<${a}> b=<${b}> options=<${JSON.stringify(options)}>`)
}
f2(1, 2)
f2(1, 2, { foo: "bar", baz: "quux" })
f2(1, 2, options = { foo: "bar", baz: "quux" })
f2(1, 2, foo = "bar", baz = "quux")
f2(1, 2, baz = "quux", options = { foo: "bar" })
```

- `$ babel-node sample.js`

```
a=<1> b=<2> c=<3> d=<4>
a=<1> b=<2> c=<3> d=<4>
a=<1> b=<2> c=<3> d=<4>
a=<1> b=<2> c=<3> d=<4>
a=<1> b=<2> options=<{}>
a=<1> b=<2> options=<{"foo":"bar","baz":"quux"}>
a=<1> b=<2> options=<{"foo":"bar","baz":"quux"}>
a=<1> b=<2> options=<{"foo":"bar","baz":"quux"}>
a=<1> b=<2> options=<{"foo":"bar","baz":"quux"}>
```

License
-------

Copyright (c) 2018 Ralf S. Engelschall (http://engelschall.com/)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

