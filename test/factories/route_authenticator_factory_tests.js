var expect = require('expect.js');
var sinon = require('sinon');
var RouteAuthenticatorFactory = require('../../factories/route_authenticator_factory.js');
var HeaderKeyValueRouteAuthenticator = require('../../middleware/route_authenticators/header_key_value_route_authenticator.js');
var JWTRouteAuthenticator = require('../../middleware/route_authenticators/jwt_route_authenticator.js');
var NoAuthRouteAuthenticator = require('../../middleware/route_authenticators/no_auth_route_authenticator.js');

describe('RouteAuthenticatorFactory', function(){

  var mockRequest, routeAuthenticatorFactory;
  var mockLogger = {
    log: sinon.spy()
  };

  before(function(){
    process.env.JWT_PUBLIC_KEY = 'public';
    process.env.JWT_ISSUER = 'issuer';
    process.env.JWT_AUDIENCE = 'audience';
  });

  after(function(){
    process.env.JWT_PUBLIC_KEY = '';
    process.env.JWT_ISSUER = '';
    process.env.JWT_AUDIENCE = '';
  });

  beforeEach(function(){
    mockRequest = {};
    mockLogger.log.reset();
    routeAuthenticatorFactory = new RouteAuthenticatorFactory(mockLogger);
  });

  describe('#getRouteAuthenticator', function(){
    describe('AUTH not set to anything', function(){
      before(function(){
        process.env.AUTH = '';
      });

      it('throws an error', function(){
        var routeAuthenticator = expect(routeAuthenticatorFactory.getRouteAuthenticator).to.throwException(function (err){
          expect(err.message).to.be('AUTH ENV variable must be configured. Options: none, jwt, header_key_value');
        });
      });
    });

    describe('AUTH set to something other than an available option', function(){
      before(function(){
        process.env.AUTH = 'banana';
      });

      after(function(){
        process.env.AUTH = '';
      });

      it('throws an error', function(){
        var routeAuthenticator = expect(routeAuthenticatorFactory.getRouteAuthenticator).to.throwException(function (err){
          expect(err.message).to.be('AUTH ENV variable must be configured. Options: none, jwt, header_key_value');
        });
      });
    });

    describe('AUTH set to none option', function(){
      before(function(){
        process.env.AUTH = 'none';
      });

      after(function(){
        process.env.AUTH = '';
      });

      it('returns NoAuthRouteAuthenticator', function(){
        var routeAuthenticator = routeAuthenticatorFactory.getRouteAuthenticator();
        expect(routeAuthenticator).to.be.a(NoAuthRouteAuthenticator);
      });
    });

    describe('jwt', function(){
      before(function(){
        process.env.AUTH = 'jwt';
      });

      after(function(){
        process.env.AUTH = '';
      });

      it('returns JWTRouteAuthenticator', function(){
        var routeAuthenticator = routeAuthenticatorFactory.getRouteAuthenticator();
        expect(routeAuthenticator).to.be.a(JWTRouteAuthenticator);
      });
    });

    describe('AUTH configured to header_key_value', function(){
      before(function(){
        process.env.AUTH = 'header_key_value';
        process.env.AUTH_HEADER_KEY = 'test';
        process.env.AUTH_HEADER_VALUE = 'testme';
      });

      after(function(){
        process.env.AUTH = '';
        process.env.AUTH_HEADER_KEY = '';
        process.env.AUTH_HEADER_VALUE = '';
      });

      it('returns HeaderKeyValueRouteAuthenticator', function(){
        var routeAuthenticator = routeAuthenticatorFactory.getRouteAuthenticator();
        expect(routeAuthenticator).to.be.a(HeaderKeyValueRouteAuthenticator);
      });
    });

    describe('AUTH configured to HeAdeR_KeY_ValUe', function(){
      before(function(){
        process.env.AUTH = 'HeAdeR_KeY_ValUe';
        process.env.AUTH_HEADER_KEY = 'test';
        process.env.AUTH_HEADER_VALUE = 'testme';
      });

      after(function(){
        process.env.AUTH = '';
        process.env.AUTH_HEADER_KEY = '';
        process.env.AUTH_HEADER_VALUE = '';
      });

      it('returns HeaderKeyValueRouteAuthenticator', function(){
        var routeAuthenticator = routeAuthenticatorFactory.getRouteAuthenticator();
        expect(routeAuthenticator).to.be.a(HeaderKeyValueRouteAuthenticator);
      });
    });
  });
});
