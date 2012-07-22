
## Scope

A useless library for creating water proof function calls with no global leakage and its own scope. Totaly useless for production and just an experiment.

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