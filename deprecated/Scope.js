

function Scope() {
  this.assignments = {}
}

Scope.GLOBAL = (function() { return this })()

Scope.isGLOBAL = function( name ) {
  return ( name in Scope.GLOBAL ) 
}

Scope.parseAssignments = function( source ) {
  var sourceBody, globalDefinitions
  sourceBody = source.replace(/function.*?\{/, '')
  sourceBody = sourceBody.slice( 0, sourceBody.lastIndexOf("}")-1 )
  globalDefinitions = Scope.retrieveGlobalsInSource( sourceBody )
  return globalDefinitions
}

function isEdgeAssignment( token ) {
  if( token.edge === "edge"  && token.string === "var" ) {
    return true
  }
}

Scope.filterEdgeDefinitions = function( tree ) {
  var names, i, token
  names = []
  for (i = tree.first.length - 1; i >= 0; i--) {
    token = tree.first[ i ]
    if( isEdgeAssignment(token) ) {
      var j, variableName
      for (var j = token.first.length - 1; j >= 0; j--) {
        variableName = token.first[ j ].second.string
        names.push( variableName )
      }
    }
  }
  return names
}

Scope.retrieveGlobalsInSource = function( source ) {
  var globalDefinitions, data, i, globalName, edgeVars
  globalDefinitions = []
  JSLINT(source, {
    passfail: false,
    maxerr: 99999
  })
  data = JSLINT.data()

  if( data.globals ) {
    for( i = 0; i < data.globals.length; i++ ) {
      globalName = data.globals[ i ]
      if( !Scope.isGLOBAL(globalName) )
        globalDefinitions.push({ name: globalName })
    }
  }
  if( data.undefined ) {
    for( i = 0; i < data.undefined.length; i++ ) {
      globalName = data.undefined[ i ] && data.undefined[ i ].name ? data.undefined[ i ].name : null
      if( globalName ) {
        if( !Scope.isGLOBAL(globalName) )
          globalDefinitions.push({ name: globalName })
      }
    }
  }
  edgeVars = Scope.filterEdgeDefinitions( JSLINT.tree )
  return globalDefinitions
}

Scope.prototype.assignVar = function( name, value ) {
  this.assignments[ name ] = value
}

Scope.prototype.assign = function( vars ) {
  var i, name, value
  this.assignments = {}
  for ( i = vars.length - 1; i >= 0; i-- ) {
    name = vars[ i ].name
    value = vars[ i ].value
    if( !(name in this.assignments) ) {
      this.assignVar( name, value )
    }
  }
}

Scope.prototype.stringifyAssignments = function() {
  var string, i, length, name, value
  string = "var "
  i = 0
  length = Object.keys( this.assignments ).length
  for( name in this.assignments ) {
    value = this.assignments[ name ]
    string += name + " = " + value
    if( i !== length - 1 ) {
      string += ", "
    } else {
      string += ";\n"
    }
    i++
  }
  return string
}

Scope.convertPrivateVarsToGlobals = function( source, edgeVars ) {
  var i, name
  for ( i = edgeVars.length - 1; i >= 0; i-- ) {
    name = edgeVars[i]
    source = source.replace( 
      new RegExp( 'var(?=\\s*' + name + ')'),
      ''
    )
  }
  return source
}

Scope.prototype.parse = function( source ) {
  var assignments, edgeVars
  assignments = Scope.parseAssignments( source )
  this.assign( assignments )
  edgeVars = Scope.filterEdgeDefinitions( JSLINT.tree )
  source = Scope.convertPrivateVarsToGlobals( source, edgeVars )
  return source
}

function createEval( fn ) {
  var self, source, cleanedSource
  self = this
  source = fn.toString()
  cleanedSource = this.parse( source )
  return (
    "(function(){ " +
      this.stringifyAssignments() + 
      "(" + cleanedSource + ")();" +
      "self.eval = function(fn) { eval("+ createEval() + ") }" +
    "})()"
  )
}

Scope.prototyp.getEvaluator = function() {
  var self
  if( this.evaluator ) {
    return this.evaluator
  }
  self = this
  this.evaluator = function( fn ) {
    return eval(
      "(function(){ " +
        "(" + fn.toString() + ")();" +
        "self.evaluator = " + self.evaluator.toString() +
      "})()"
    )
  }
  return this.evaluator
}

Scope.prototype.eval = function( fn ) {
  var evaluator
  evaluator = this.getEvaluator()
}