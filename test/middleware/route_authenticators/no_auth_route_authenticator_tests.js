var proxyquire = require('proxyquire').noPreserveCache();
var expect = require('expect.js');
var sinon = require('sinon');
var NoAuthRouteAuthenticator = require('../../../middleware/route_authenticators/no_auth_route_authenticator.js');

describe('NoAuthRouteAuthenticator', function(){
  var mockRequest, mockResponse, routeAuthenticator;
  var mockLogger = {
    log: sinon.spy()
  };

  beforeEach(function(){
    mockRequest = {};
    mockResponse = {};
    mockLogger.log.reset();
  });

  function setupMocks(){
    routeAuthenticator = new NoAuthRouteAuthenticator(mockLogger);
  }

  describe('#CTOR', function(){
    describe('no logger provided', function(){
      it('expect error to be thrown', function(){
        expect(function(){ new NoAuthRouteAuthenticator(); }).
          to.throwException('Argument Null: logger');
      });
    });
  });

  describe('#authenticate', function(){
    it('logs properly', function(done){
      setupMocks();
      routeAuthenticator.authenticate(mockRequest, mockResponse, function(err){
        if(err){
          return done(err);
        }

        expect(mockLogger.log.getCall(0).args[0]).to.be('NoAuthRouteAuthenticator used.');
        done();
      });
    });
  });
});
