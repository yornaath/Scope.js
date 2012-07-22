## Scope.js

A useless library for creating water proof function calls with no global leakage and its own scope. Totaly useless for production and just an experiment.

### Class: Scope

Constructs a new scope. It does not have access to the local scope but all globals.

#### Scope.eval( functionOrSourceString )

Evaluates the function or source string within the scope instances scope.

#### Scope.bind( functionOrSourceString )

Binds and returns a function that when executed will be called within the scope of the instance scope.

### Examples

```javascript

var scope = new Scope({
  foo: 'bar',
  num: 1
})


scope.eval(function(){
  return foo
})
// -> 'bar'

scope.eval(function(){
  var consideredGlobal = 'lol'
  anotherGlobal = true
})

typeof anotherGlobal === 'undefined' 
// -> true

scope.eval(function(){ return consideredGlobal })
// -> 'lol'

scope.eval(function(){ return anotherGlobal })
// -> true

```