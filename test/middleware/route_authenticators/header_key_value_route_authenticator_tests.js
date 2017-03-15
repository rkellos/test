var proxyquire = require('proxyquire').noPreserveCache();
var expect = require('expect.js');
var sinon = require('sinon');
var BaseHttpError = require('../../../errors/base_http_error.js');
var HeaderKeyValueRouteAuthenticator = require('../../../middleware/route_authenticators/header_key_value_route_authenticator.js');

describe('HeaderKeyValueRouteAuthenticator', function(){
  var mockRequest;
  var mockLogger = {
    log: sinon.spy()
  };

  beforeEach(function(){
    mockLogger.log.reset();
    mockRequest = {};
  });

  describe('#CTOR', function(){
    describe('No logger provided', function(){
      it('expect error to be thrown', function(){
        expect(function(){ new HeaderKeyValueRouteAuthenticator(); }).
          to.throwException('Argument Null: logger');
      });
    });

    describe('logger provided', function(){
      describe('AUTH_HEADER_KEY not provided', function(){
        before(function(){
          process.env.AUTH_HEADER_KEY = '';
          process.env.AUTH_HEADER_VALUE = 'blah';
        });

        after(function(){
          process.env.AUTH_HEADER_VALUE = '';
        });

        it('expect error to be thrown', function(){
          expect(function(){ new HeaderKeyValueRouteAuthenticator(mockLogger); }).
            to.throwException('Error: ENV variable AUTH_HEADER_KEY must be set');
        });
      });

      describe('AUTH_HEADER_VALUE not provided', function(){
        before(function(){
          process.env.AUTH_HEADER_KEY = 'blah';
          process.env.AUTH_HEADER_VALUE = '';
        });

        after(function(){
          process.env.AUTH_HEADER_KEY = '';
        });

        it('expect error to be thrown', function(){
          expect(function(){ new HeaderKeyValueRouteAuthenticator(mockLogger); }).
            to.throwException('Error: ENV variable AUTH_HEADER_VALUE must be set');
        });
      });
    });
  });

  describe('#authenticate', function(){
    before(function(){
      process.env.AUTH_HEADER_KEY = 'secret';
      process.env.AUTH_HEADER_VALUE = 'tacocat';
    });

    after(function(){
      process.env.AUTH_HEADER_KEY = '';
      process.env.AUTH_HEADER_VALUE = '';
    });

    var routeAuthenticator;
    beforeEach(function(){
      routeAuthenticator = new HeaderKeyValueRouteAuthenticator(mockLogger);
    });

    it('Request has valid auth headers', function(done){
      mockRequest.path = '/blah';
      mockRequest.headers = {};
      mockRequest.headers['secret'] = 'tacocat';
      routeAuthenticator.authenticate(mockRequest, {}, function(err){
        expect(err).to.be(undefined);
        expect(mockLogger.log.getCall(0).args[0]).to.be('/blah Route authenticated');
        done();
      });
    });

    it('Request has invalid auth headers', function(done){
      mockRequest.headers = {};
      routeAuthenticator.authenticate(mockRequest, {}, function(err){
        expect(err).to.not.be(undefined);
        expect(err).to.be.a(BaseHttpError);
        expect(err.statusCode).to.be(401);
        expect(err.reasonPhrase).to.be('Unauthorized');
        expect(err.message).to.be('Unauthorized');
        done();
      });
    });
  });
});
