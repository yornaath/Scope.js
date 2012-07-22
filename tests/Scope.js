
var expect = require('expect.js'),
    Scope = require(__dirname + '/../' + 'Scope.js')



describe("Scope.js", function() {

  (function() { return this })().Scope = Scope

  describe("Scope.prototype.constructor", function() {

    it("should take an object as its first parameter and declare the key value pairs inside its scope", function() {

      var scope = new Scope({
        'foo' : 'bar',
        'pumpernikkel' : 'pie?', 
        'falsy' : false,
        'num' : 64
      })

      var ret = scope.eval(function() {
        return {
          foo: foo,
          pumpernikkel: pumpernikkel,
          falsy: falsy,
          num: num
        }
      })

      expect( ret.foo ).to.equal( 'bar' )
      expect( ret.pumpernikkel ).to.equal( 'pie?' )
      expect( ret.falsy ).to.equal( false )
      expect( ret.num ).to.equal( 64 )

    })

  })

  describe("Scope.prototype.declare", function() {

    it("should take a name and a value and deaclare a variable within the scope with the value or undefined as its value", function() {

      var scope = new Scope()

      scope.declare( 'foo', 'bar' )
      scope.declare( 'pumpernikkel', 'pie?' )
      scope.declare( 'falsy', false )
      scope.declare( 'num', 64 )

      var ret = scope.eval(function() {
        return {
          foo: foo,
          pumpernikkel: pumpernikkel,
          falsy: falsy,
          num: num
        }
      })

      expect( ret.foo ).to.equal( 'bar' )
      expect( ret.pumpernikkel ).to.equal( 'pie?' )
      expect( ret.falsy ).to.equal( false )
      expect( ret.num ).to.equal( 64 )

    })

    it("should allso take an object of name, value declarations", function() {

      var scope = new Scope()

      scope.declare({
        'foo' : 'bar',
        'pumpernikkel' : 'pie?', 
        'falsy' : false,
        'num' : 64
      })

      var ret = scope.eval(function() {
        return {
          foo: foo,
          pumpernikkel: pumpernikkel,
          falsy: falsy,
          num: num
        }
      })

      expect( ret.foo ).to.equal( 'bar' )
      expect( ret.pumpernikkel ).to.equal( 'pie?' )
      expect( ret.falsy ).to.equal( false )
      expect( ret.num ).to.equal( 64 )

    })

  })

  describe("Scope.prototype.eval", function() {

    it("Should return the value returned from the evaluated function", function() {

      var scope = new Scope()

      var returned

      returned = scope.eval(function() {
        return 'returned value'
      })

      expect( returned ).to.equal( 'returned value' )

    })

    it("Should declare all variables within the evaluated function that would be declared globaly localy to the scope", function() {

      var scope = new Scope()

      var a, b, c, d, e, f, g, h

      scope.eval(function() {
        var a, b, c
        a = 'a'
        b = 'b'
        c = 'c'
        var d = 'd',
            e = 'e'
        function inner() {
          f = 'f', g = 'g'
          h = 'h'
        }
        inner()
      })

      
      expect( typeof a ).to.equal( 'undefined' )
      expect( typeof b ).to.equal( 'undefined' )
      expect( typeof c ).to.equal( 'undefined' )
      expect( typeof d ).to.equal( 'undefined' )
      expect( typeof e ).to.equal( 'undefined' )
      expect( typeof f ).to.equal( 'undefined' )
      expect( typeof g ).to.equal( 'undefined' )
      expect( typeof h ).to.equal( 'undefined' )

      var obj = scope.eval(function() {
        var obj = {}
        obj.a = a
        obj.b = b
        obj.c = c
        obj.d = d
        obj.e = e
        obj.f = f
        obj.g = g
        obj.h = h
        return obj
      })

      expect( obj.a ).to.equal( 'a' )
      expect( obj.b ).to.equal( 'b' )
      expect( obj.c ).to.equal( 'c' )
      expect( obj.d ).to.equal( 'd' )
      expect( obj.e ).to.equal( 'e' )
      expect( obj.f ).to.equal( 'f' )
      expect( obj.g ).to.equal( 'g' )
      expect( obj.h ).to.equal( 'h' )

    })

    it("Should not leak variables to global namespace even if declared or assigned whithout var statement", function() {

      var scope = new Scope()

      scope.eval(function() {
        a = true
        b = true
        c = true, d = true
      })

      expect( typeof a ).to.equal( 'undefined' )
      expect( typeof b ).to.equal( 'undefined' )
      expect( typeof c ).to.equal( 'undefined' )
      expect( typeof d ).to.equal( 'undefined' )

    })

    it("should be possible to chain scopes without leaking variables", function() {

      var outer = new Scope()

      var ov, iv

      outer.eval(function() {
        outerVar = 'outerVar'
        inner = new Scope()
        inner.eval(function() {
          innerVar = 'innerVar'
        })
      })

      expect( typeof outerVar ).to.equal( 'undefined' )
      expect( typeof innerVar ).to.equal( 'undefined' )

      ov = outer.eval(function() { 
        return outerVar 
      })
      expect( ov ).to.equal( 'outerVar' )

      iv = outer.eval(function() { 
        return inner.eval(function() { 
          return innerVar 
        }) 
      })
      expect( iv ).to.equal( 'innerVar' )

    })

  })

  describe("Scope.prototype.bind", function() {

    it("should bind a function the the scope, returning a function that when executed will have all scoped variables declared and or assigned", function() {

      var scope = new Scope()

      var bound = function() {
        return {
          foo: foo,
          lorem: lorem
        }
      }

      bound = scope.bind( bound )

      scope.eval(function() {
        var foo = "foo",
            lorem = "lipsum"
      })

      var returned = bound()

      expect( typeof foo ).to.equal( 'undefined' )
      expect( typeof lorem ).to.equal( 'undefined' )

      expect( returned.foo ).to.equal( 'foo' )  
      expect( returned.lorem ).to.equal( 'lipsum' )  

    })

  })

})