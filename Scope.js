

var Scope = function() {
  this.assigned = {}
}

Scope.GLOBAL = (function() { return this })()

Scope.isGLOBAL = function( name ) {
  return ( name in Scope.GLOBAL ) 
}



Scope.parseGlobals = function( source ) {
  var sourceBody, globalDefinitions
  sourceBody = source.replace(/function.*?\{/, '')
  sourceBody = sourceBody.slice( 0, sourceBody.lastIndexOf("}")-1 )
  globalDefinitions = Scope.retrieveGlobalsInSource( sourceBody )
  return globalDefinitions
}

Scope.retrieveGlobalsInSource = function( source ) {
  var globalDefinitions, data, i, globalName
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
        globalDefinitions.push( globalName )
    }
  }
  if( data.undefined ) {
    for( i = 0; i < data.undefined.length; i++ ) {
      globalName = data.undefined[ i ] && data.undefined[ i ].name ? data.undefined[ i ].name : null
      if( globalName ) {
        if( !Scope.isGLOBAL(globalName) )
          globalDefinitions.push( globalName )
      }
    }
  }
  return globalDefinitions
}

function isEdgeAssignment( token ) {
  if( token.edge === "edge"  && token.string === "var" ) {
    return true
  }
}

Scope.filterEdgeDefinitions = function( source ) {
  var names, tree, i, token
  names = []
  JSLINT(source, {
    passfail: false,
    maxerr: 99999
  })
  tree = JSLINT.tree
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

Scope.stringifyVariableList = function( vars ) {
  var names, i, name, value
  names = []
  if( vars.length ) {
    for( i = 0; i < vars.length; i++ ) {
      name = vars[ i ]
      names.push( name )
    }
    return 'var ' +  names.join(', ') + ';'
  }
  return ''
}

Scope.convertPrivateVarsToGlobals = function( source, varNames ) {
  var i, name
  for ( i = varNames.length - 1; i >= 0; i-- ) {
    name = varNames[ i ]
    source = source.replace( 
      new RegExp( 'var(?=\\s*' + name + ')'),
      ''
    )
  }
  return source
}

Scope.extractFunctionBody = function( fn ) {
  var body
  body = fn.toString()
  body = body.replace(/function.*?\{/, '')
  body = body.slice( 0, body.lastIndexOf("}") - 1 )
  return body
}

Scope.prototype.filterAssignedGlobals = function( globals ) {
  var out, i, name
  out = []
  for ( i = globals.length - 1; i >= 0; i-- ) {
    name = globals[i]
    if( !(name in this.assigned) ) {
      this.assigned[ name ] = true
      out.push( name )
    } 
  }
  return out
}

Scope.prototype.eval = function( fn ) {
  var source, globals, vars
  source = Scope.extractFunctionBody( fn )
  globals = Scope.retrieveGlobalsInSource( source )
  vars = this.filterAssignedGlobals( globals )
  source = Scope.convertPrivateVarsToGlobals( 
             source,
             Scope.filterEdgeDefinitions( source )
           )
  return eval(
    "(function(){" +
      Scope.stringifyVariableList( vars ) +
      source + ";" +
      "Scope.prototype.eval = " + Scope.prototype.eval.toString() + ";" +
    "})()"
  )
}