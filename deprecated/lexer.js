
function Lexer() {}

Lexer.operators = [ "+", "++", "-", "--", 
                    "||", "&&", "=", "==",
                    "===", "!=", "!==", "+=", 
                    "-=", "*=", "%=", ">>=", 
                    ">>>=", "&=", "^=", "|=",
                    "(", ")"
                  ]


function isOperator( value ) {
  return (Lexer.operators.indexOf( ""+value ) !== -1)
}

function isWhitespace( value ) {
  return /\s/.test( value );
}

function isDigit( value ) {
  return typeof value === "string" &&
         !isOperator( value ) &&
         !isDigit( value ) &&
         !isWhitespace( value )
}

function isIdentifier( value ) {}

function addToken( tokenlist, type, value ) {
  tokenlist.push({
    type: type,
    value: value
  })
}

Lexer.prototype.lex = function( input ) {
  var tokens
  tokens = []

  return tokens
}