
var gAsRex = /[^var.*](.*)\=/g

parser = {

  parse: function( source ) {
    return source.match( gAsRex )
  }

}