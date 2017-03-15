var proxyquire = require('proxyquire').noPreserveCache();
var expect = require('expect.js');
var BaseHttpError = require('../../../errors/base_http_error.js');
var JWTRouteAuthenticatorModule = '../../../middleware/route_authenticators/jwt_route_authenticator.js';
var sinon = require('sinon');

describe('JWTRouteAuthenticator', function(){
  var mockRequest, mockResponse;
  var mockLogger = {
    log: sinon.spy()
  };

  beforeEach(function(){
    mockRequest = {};
    mockResponse = {};
    mockLogger.log.reset();
  });

  describe('#CTOR', function(){
    var JWTAuthenticator = require(JWTRouteAuthenticatorModule);

    describe('No logger provided', function(){
      it('expect error to be thrown', function(){
        expect(function(){ new JWTRouteAuthenticator(); }).
          to.throwException('Argument Null: logger');
      });
    });

    describe('Required environment variables are checked', function(){
      describe('JWT_PUBLIC_KEY not set', function(){
        before(function(){
          process.env.JWT_PUBLIC_KEY = ''
          process.env.JWT_ISSUER = '123';
          process.env.JWT_AUDIENCE = '456';
        });

        after(function(){
          process.env.JWT_ISSUER = '';
          process.env.JWT_AUDIENCE = '';
        });

        it('Logged and an InternalServerError is thrown', function(){
          expect(function(){ new JWTAuthenticator(mockLogger)}).
                 to.throwException('Error: ENV variable JWT_PUBLIC_KEY must be set');
        });
      });

      describe('JWT_ISSUER not set', function(){
        before(function(){
          process.env.JWT_PUBLIC_KEY = '123';
          process.env.JWT_ISSUER = '';
          process.env.JWT_AUDIENCE = '123';
        });

        after(function(){
          process.env.JWT_PUBLIC_KEY = '';
          process.env.JWT_AUDIENCE = '';
        });

        it('Logged and an InternalServerError is thrown', function(){
          expect(function(){ new JWTAuthenticator(mockLogger)}).
                 to.throwException('Error: ENV variable JWT_ISSUER must be set');
        });
      });

      describe('JWT_AUDIENCE not set', function(){
        before(function(){
          process.env.JWT_PUBLIC_KEY = '123';
          process.env.JWT_ISSUER = '123';
          process.env.JWT_AUDIENCE = '';
        });

        after(function(){
          process.env.JWT_PUBLIC_KEY = '';
          process.env.JWT_ISSUER = '';
        });

        it('Logged and an InternalServerError is thrown', function(){
          expect(function(){ new JWTAuthenticator(mockLogger) }).
                 to.throwException('Error: ENV variable JWT_AUDIENCE must be set');
        });
      });
    });
  });

  describe('method calls', function(){
    var mocks, routeAuthenticator;
    var mockPassport = {
      use: function(){
      },
      authenticate: function(){
      }
    };

    before(function(){
      process.env.JWT_PUBLIC_KEY = 'public_key';
      process.env.JWT_ISSUER = 'issuer';
      process.env.JWT_AUDIENCE = 'audience';
    });

    after(function(){
      process.env.JWT_PUBLIC_KEY = '';
      process.env.JWT_ISSUER = '';
      process.env.JWT_AUDIENCE = '';
    });

    function setupMocks(){
      mocks = {};
      mocks['passport'] = mockPassport;

      var JWTRouteAuthenticator = proxyquire(JWTRouteAuthenticatorModule, mocks);
      routeAuthenticator = new JWTRouteAuthenticator(mockLogger);
    };

    describe('#authenticate', function(){
      describe('Passport Authentication', function(){
        var passportAuthenticateStub;

        before(function(){
          passportAuthenticateStub = sinon.stub(mockPassport, 'authenticate');
          var returnedRouteHandler = function(req, res, next){
            passportAuthenticateStub.getCall(0).args[2](null, {}, null);
          };
        });

        beforeEach(function(){
          passportAuthenticateStub.reset();
        });

        describe('authorized', function(){
          var expectedReq, expectedRes, expectedNext;

          beforeEach(function(){
            var returnedRouteHandler = function(req, res, next){
              expectedReq = req;
              expectedRes = res;
              expectedNext = next;
              passportAuthenticateStub.getCall(0).args[1](null, {}, null);
            };

            passportAuthenticateStub.returns(returnedRouteHandler);
            setupMocks();
          });

          it('calls return handler with req, res, next args', function(done){
            routeAuthenticator.authenticate(mockRequest, mockResponse, function(err){
              expect(expectedReq).to.be(mockRequest);
              expect(expectedRes).to.be(mockResponse);
              done();
            });

            it('returns no error', function(done){
              routeAuthenticator.authenticate(mockRequest, mockResponse, function(err){
                expect(err).to.not.be.ok();
                done();
              });
            });

            it('expect passport authenticate to be called with the jwt strategy', function(){
              routeAuthenticator.authenticate(mockRequest, mockResponse, function(err){
                expect(passportAuthenticateStub.getCall(0).args[0]).to.be('jwt');
                done();
              });
            });
          });
        });

        describe('legitimate unauthorized', function(done){
          var expectedReq, expectedRes, expectedNext;

          beforeEach(function(){
            var returnedRouteHandler = function(req, res, next){
              expectedReq = req;
              expectedRes = res;
              expectedNext = next;
              passportAuthenticateStub.getCall(0).args[1](null, false, { error: 'info' });
            };

            passportAuthenticateStub.returns(returnedRouteHandler);
            setupMocks();
          });

          it('logs passport info', function(done){
            routeAuthenticator.authenticate(mockRequest, mockResponse, function(err){
              expect(mockLogger.log.getCall(0).args[0]).to.be('Info: Passport authentication unauthorized. AuthInfo: {"error":"info"}');
              done();
            });
          });

          it('expect passport authenticate to be called with the jwt strategy', function(done){
            routeAuthenticator.authenticate(mockRequest, mockResponse, function(err){
              expect(passportAuthenticateStub.getCall(0).args[0]).to.be('jwt');
              done();
            });
          });

          it('returns an Unauthorized BaseHttpError', function(done){
            routeAuthenticator.authenticate(mockRequest, mockResponse, function(err){
              expect(err).to.be.a(BaseHttpError);
              expect(err.reasonPhrase).to.be('Unauthorized');
              expect(err.message).to.be('Unauthorized')
              expect(err.statusCode).to.be(401);
              done();
            });
          });
        });

        describe('unexpected error', function(){
          var expectedReq, expectedRes, expectedNext;

          beforeEach(function(){
            var returnedRouteHandler = function(req, res, next){
              expectedReq = req;
              expectedRes = res;
              expectedNext = next;
              passportAuthenticateStub.getCall(0).args[1]({ error: 'my_error'} , false, { error: 'info' });
            };

            passportAuthenticateStub.returns(returnedRouteHandler);
            setupMocks();
          });

          it('expect passport authenticate to be called with the jwt strategy', function(done){
            routeAuthenticator.authenticate(mockRequest, mockResponse, function(err){
              expect(passportAuthenticateStub.getCall(0).args[0]).to.be('jwt');
              done();
            });
          });

          it('logs passport error', function(done){
            routeAuthenticator.authenticate(mockRequest, mockResponse, function(err){
              expect(mockLogger.log.getCall(0).args[0]).to.be('Error: Passport authentication error: {"error":"my_error"}\n Info: {"error":"info"}');
              done();
            });
          });

          it('returns an InternalServerError BaseHttpError', function(done){
            routeAuthenticator.authenticate(mockRequest, mockResponse, function(err){
              expect(err).to.be.a(BaseHttpError);
              expect(err.reasonPhrase).to.be('InternalServerError');
              expect(err.message).to.be('InternalServerError');
              expect(err.statusCode).to.be(500);
              done();
            });
          });
        });
      });
    });
  });
});
