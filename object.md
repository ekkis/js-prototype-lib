# Object Extensions

Object prototypes are typically problematic for packages that are badly written (packages that do 
`for (var i in o)` without calling `.hasOwnProperty()`), and there are many of those, therefore 
this module creates the methods as non-enumerable, which will be perfectly safe

<hr>

#### `.isEmpty()`

Returns a boolean value indicating whether the object contains any visible members (this excludes
functions and other attributes created with `enumerable: false`)

<hr>

#### `.keys()`

Equivalent to `Object.keys()`

<hr>

#### `.vals()` / `.vals(fn)`

This function has two modes, the first returns an array of the values within the object,
whilst the second executes a function on each of the values.  The function receives
a sole argument consisting of the value e.g.
```js
{a:1, b:2}.vals()                     // returns [1,2]
{a:1}.vals(v => { console.log(v) })   // prints 1
```

<hr>

#### `.slice(keys)` / `.slice([keys])`

Returns a new object containing only the properties specified in the base object.  The key list may
be provided as an array or a string-array
```js
{a:1, b:1, c:1}.slice(['a', 'c'])     // returns {a:1, c:1}
{a:1, b:1, c:1}.slice('a/c')          // returns {a:1, c:1}
```

<hr>

#### `.uc/lc/tc(keys | [keys])`

Uppercases, lowercases or titlecases the values in an object.  If no arguments are passed, all keys in the
object are operated upon.  Alternatively the caller may pass an array of keys or a string to be
converted into an array using the `String.arr()` method

<hr>

#### `.map(fn)`

Returns an object transformed according to the function passed

<hr>

#### `.each(fn)`

Iterates through the properties of an object, performing a caller-defined function

<hr>

#### `.concat(o...)` / `.assign(o...)` / `.def(o...)`

These functions behave similarly.  They merge the elements in the parameter list with
those of the referenced object.  They differ in that `assign` modifies the reference
object whereas `concat` does not.  `def` is used to supply defaults and does not modify
the underlying object.  These functions all return the result.  Use like this:
```js
var o = {a:1}

// concat is non destructive
console.log(o.concat({b:1}, {c:1}))   // {a:1, b:1, c:1}
console.log(o)                        // {a:1}

// whereas assign modifies the reference object
console.log(o.assign({d:1}))          // {a:1, d:1}
console.log(o)                        // {a:1, d:1}

// so these two calls are equivalent
console.log(o.concat({e:1}))
console.log({}.assign(o, {e:1}))

// supply defaults
console.log(o.def({a:2}))             // {a:1}
console.log(o.def({b:1}))             // {a:1, b:1}
```

<hr>

#### `.mv(descriptor)` / `.mvp(descriptor)`

These methods move (rename) keys in the object by providing a descriptor map.  The keys
in the map indicate which keys in the object will be affected, and the values of the map,
the new key names in the object e.g. to rename 'a' to 'b': `{a:1}.mv({a: 'b'})` (yields
`{b:1}`).  Key collisions produce no error but overwrite the original value

The methods also delete keys in the given object when the value provided in the map is
falsy e.g. `{a:1,b:2}.mv(a: undefined)`, `{a:1,b:2}.mv(a: null)` and `{a:1,b:2}.mv(a: '')`
all produce `{b:2}`

Finally, there are two versions of the function: 1) `mv` and 2) `mvp` where the latter
preserves the underlying object.  They can be used like this:
```js
var o = {a:1, b:2}
var p = o.mvp({a: 'c'})
console.log(p)  // produces {c:1, b:2}
console.log(o)  // but leaves orginal alone: {a:1, b:2}

// but mv is destructive
o.mv({a: 'c'})
console.log(o)  // produces {c:1, b:2}
```

<hr>

#### `.rm(list)` / `.rmp(list)`

Like mv/p, this method comes in destructive and non-destructive modes.  The method
accepts a list or array of keys to remove from the object e.g. `{a:1, b:2, c:3}.rm('a', 'b')`
and `var ls = ['a','b']; {a:1, b:2, c:3}.rm(...ls)` both produce `{c:3}`.  I also
accepts a string-array: `{a:1, b:2, c:3}.rm('a/b')`

Please note that to pass an array, spread notation is needed

<hr>

#### `.keyval(names = ['k', 'v'])` / `.keyval(ks = '=', rs = '\n')`

Converts an object into key/value pairs returned as either a string or an array,
depending on the type of the argument passed

When supplying an array the first element should contain the key names used in the
objects returned (defaults to 'k') and the second, the value names (defaults to 'v') such
that `{a:1,b:1}.keyval(['key', 'val'])` returns `[{key: 'a', val: '1'}, {key: 'b', val: '1'}]`

In the second form a string is generated separating attributes by the given key and record
separator strings such that `{a:1,b:1}.keyval('=', ';')` returns `'a=1;b=1'`

Cf. `[].keyval()`

<hr>

#### `.notIn(o)`

Returns the set of keys in the object that are not found in `o`.  Use it like this:
`{a:1, b:1, c:1}.notIn({a:2,b:2}) // returns ['c']`

<hr>

#### `.getpath(path)` / `.setpath(path, value, noclobber = false)`

This function pair gets and sets deeply embedded values in an object.  Paths can be 
specified in dots or slashes, or as arrays.  *getpath* returns *undefined* when a path does not exist.
*setpath* will create the path when it doesn't exist, unless the *noclobber* parameter is set
to true and returns the object created
```js
var o = {}
o.setpath('a/b/c', 1)
console.log(o.a.b.c)            // outputs 1
// or
var o = {a: {b: {c: 2}}}
console.log(o.getpath('a/b/c')) // outputs 2

// paths can also be expressed using dot notation
var o = {}
o.setpath('a.b.c', 1)
console.log(o.getpath('a.b.c')) // outputs 1

// one-time initialisation (noclobber)
var o = {}
o.setpath('a', 2, true)  // sets o.a to 2
o.setpath('a', 3, true)  // respects the value already there

// using the return value
var o = {}
var r = o.setpath('a/b', [])
r.push(0)
console.log(o) // shows {a: {b: [0]}}
```

<hr>

#### `.json()` / `.json(safe)`

Converts the object to a Json string.  If the `safe` switch is used, the method will
safely handle objects with circular references that normally cannot be serialised and
issue an exception.  Circularity is managed by removing the offending keys.  Unsafe calls
are made by default to avoid the burden of additional processing

<hr>

#### `.tee(path)`

Save an object to a file as Json e.g.
```js
var o = {a:1, b:2}
o.tee('/tmp/o.json')
```
though please note that object literals cannot invoke the method:
```js
{a:1, b:2}.tee('/tmp/o.json') // won't compile
```
