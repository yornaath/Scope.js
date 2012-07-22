
var JSLINT = require('./jslint.js') || JSLINT

function Scope( declarations ) {

  this.declared = {}

  if( typeof declarations === 'object' ) {
    this.declare( declarations )
  }

}

Scope.isGLOBAL = function( name ) {
  return ( name in (function() { return this })() ) 
}

Scope.parseGlobals = function( source ) {
  var sourceBody, globalDefinitions
  sourceBody = source.replace(/function.*?\{/, '')
  sourceBody = sourceBody.slice( 0, sourceBody.lastIndexOf("}")-1 )
  globalDefinitions = Scope.retrieveGlobalsInSource( sourceBody )
  return globalDefinitions
}

Scope.prototype.retrieveGlobalsInSource = function( source ) {
  var globalDefinitions, data, i, globalName
  globalDefinitions = []
  JSLINT(source, {
    passfail: false,
    maxerr: 99999,
    node: true,
    properties: false
  })
  data = JSLINT.data()
  if( data.globals ) {
    for( i = 0; i < data.globals.length; i++ ) {
      globalName = data.globals[ i ]
      if( !Scope.isGLOBAL(globalName) ) {
        globalDefinitions.push( globalName )
      }
    }
  }
  if( data.undefined ) {
    for( i = 0; i < data.undefined.length; i++ ) {
      globalName = data.undefined[ i ] && data.undefined[ i ].name ? data.undefined[ i ].name : null
      if( globalName ) {
        if( !Scope.isGLOBAL(globalName) ) {
          globalDefinitions.push( globalName )
        }
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
    maxerr: 99999,
    node: true
  })
  tree = JSLINT.tree
  for (i = tree.first.length - 1; i >= 0; i--) {
    token = tree.first[ i ]
    if( isEdgeAssignment(token) ) {
      var j, variableName
      for (var j = token.first.length - 1; j >= 0; j--) {
        variableName =  token.first[ j ].string || token.first[ j ].second.string
        names.push( variableName )
      }
    }
  }
  return names
}

Scope.stringifyVariableList = function( globals, edgeVars ) {
  var declarations, i, name, declaration
  declarations = []
  if( globals.length ) {
    for( i = 0; i < globals.length; i++ ) {
      name = globals[ i ]
      if( edgeVars.indexOf(name) !== -1 ) {
        declaration = "var " + name + " = undefined; \n"
      } else {
        declaration = "var " + name + " = typeof " + name + " !== 'undefined' ? " + name + " : undefined; \n"
      }
      declarations.push( declaration )
    }
    return declarations.join("")
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

Scope.extractFunctionBody = function( source ) {
  var body
  body = source.replace(/function.*?\{/, '')
  body = body.slice( 0, body.lastIndexOf("}") - 1 )
  return body
}

Scope.prototype.removeDeclaredGlobals = function( globals ) {
  var filtered, i, name
  filtered = []
  for ( i = globals.length - 1; i >= 0; i-- ) {
    name = globals[i]
    if( !(name in this.declared) ) {
      this.declared[ name ] = true
      filtered.push( name )
    } 
  }
  return filtered
}

function bind( fn, context ) {
  return function() {
    return fn.apply( context, arguments )
  }
}

Scope.prototype.bind = function( fn ) {
  return bind(function() {
    return this.eval( fn )
  }, this)
}

Scope.prototype.declare = function( name, value ) {
  var code, declarations
  code = ""

  function add( string, name, value ) {
    string += "\n var " + name + " = "
    if( typeof value === 'undefined' ) {
      string += 'undefined'
    } else if( typeof value === 'string' ) {
      string += "'" + value + "'"
    } else if( typeof value === 'function' ) {
      var fn = value
      string += " fn "
    } else {
      string += value
    }
    string += "; \n"
    return string
  }

  if( typeof name === 'object' ) {
    declarations = name
    for( var name in declarations ) {
      code = add( code, name, declarations[name] )
    }
  } else {
    code = add( code, name, value )
  }
  return this.eval( code )
}

Scope.prototype.eval = function( fn ) {
  var source, globals, vars, edgeVars, varDeclaration
  if( typeof fn === 'function' )
    source = fn.toString()
  else if( typeof fn === 'string' )
    source = fn
  else
    throw new TypeError( 'Parameter fn must be typeof function or string' )
  source = Scope.extractFunctionBody( source )
  globals = this.retrieveGlobalsInSource( source )
  globals = this.removeDeclaredGlobals( globals )
  edgeVars = Scope.filterEdgeDefinitions( source )
  varDeclaration = Scope.stringifyVariableList( globals, edgeVars )
  source = Scope.convertPrivateVarsToGlobals( 
             source,
             edgeVars
           )
  var self = this
  return eval(
    "(function(){ \n" +
      varDeclaration +
      source + ";\n" +
      "self.eval = " + Scope.prototype.eval.toString() + ";\n" +
    "})(); \n"
  )
}



module.exports = Scope