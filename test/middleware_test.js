var proxyquire = require('proxyquire').noPreserveCache();
var expect = require('expect.js');
var sinon = require('sinon');
var request = require('supertest');
var fs = require('fs');
var path = require('path');
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
var MiddlewareModule = '../middleware.js';

describe('Middleware Tests', function(){
  var express = require('express');
  var mocks = {};
  var mockApplicationRoutes = {};

  var originalBodyParserJson = bodyParser.json;
  var bodyParserJsonSpy = sinon.spy(originalBodyParserJson);
  var mockBodyParser = {
    json: bodyParserJsonSpy
  };

  function setupMocks(){
    bodyParserJsonSpy.reset();
    mocks['body-parser'] = mockBodyParser;
    var middleware = proxyquire(MiddlewareModule, mocks);

    middleware.defineRoutes(function(router, routeAuthenticator){
      router.get('/status', function(req, res, next){
        if(req.apiVersion === '1.0'){
          res.data = "OK";
        } else if(req.apiVersion === '2.0'){
          res.data = "OKV2";
        }
        next();
      });

      router.get('/unhandled_exception', function(req, res, next){
        throw new Error('UnhandledException');
        next();
      });

      router.get('/handled_exception', function(req, res, next){
        next(new middleware.BaseHttpError('BadRequest', 'BadRequest', 400));
      });

      router.post('/auth/bounce', routeAuthenticator, function(req, res, next){
        res.data = { foo: 'bar' };
        next();
      });

      router.post('/auth/unhandled_exception', routeAuthenticator, function(req, res, next){
        throw new Error('UnhandledException');
        next();
      });

      router.post('/auth/handled_exception', routeAuthenticator, function(req, res, next){
        next(new middleware.BaseHttpError('PaymentRequired', 'PaymentRequired', 402));
      });
    });

    var app = express();
    app.use(middleware.getRouter());
    return app;
  }

  describe('REQUEST_SIZE_LIMIT set', function(){
    before(function(){
      process.env.AUTH = 'none';
      process.env.REQUEST_SIZE_LIMIT = '1000kb';
    });

    after(function(){
      process.env.AUTH = '';
      process.env.REQUEST_SIZE_LIMIT = '';
    });

    it('should set body parser', function(){
      var app = setupMocks();
      expect(bodyParserJsonSpy.getCall(0).args[0].limit).to.be('1000kb');
    });
  });

  describe('REQUEST_SIZE_LIMIT is not set', function(){
    before(function(){
      process.env.AUTH = 'none';
      process.env.REQUEST_SIZE_LIMIT = '';
    });

    after(function(){
      process.env.AUTH = '';
    });

    it('should set body parser', function(){
      var app = setupMocks();
      expect(bodyParserJsonSpy.getCall(0).args.length).to.be(0);
    });
  });

  describe('Undefined routes', function(){
    before(function(){
      process.env.AUTH = 'none';
    });

    after(function(){
      process.env.AUTH = '';
    });

    it('Should respond with 404 for /banana', function(done){
      var app = setupMocks();
      request(app)
      .get('/banana')
      .end(function(err, res){
        if(err) return done(err);
        expect(res.status).to.be(404);
        expect(res.body.data).to.be(null);
        expect(res.body.errors.length).to.be(1);
        expect(res.body.errors[0].type).to.be('NotFound');
        expect(res.body.errors[0].message).to.be('NotFound');
        expect(res.body.errors[0].code).to.be(404);
        done();
      });
    });
  });

  describe('Unauthenticated routes', function(){
    before(function(){
      process.env.AUTH = 'none';
    });

    after(function(){
      process.env.AUTH = '';
    });

    it('Should respond with 200 OK for /status', function(done){
      var app = setupMocks();
      request(app)
      .get('/status')
      .end(function(err, res){
        if(err) return done(err);
        expect(res.status).to.be(200);
        expect(res.body.data).to.be('OK');
        expect(res.body.errors.length).to.be(0);
        done();
      });
    });

    describe('Error Handling', function(){
      it('Unhandled Exceptions should be a 500 internal server error', function(done){
        var app = setupMocks();
        request(app)
        .get('/unhandled_exception')
        .end(function(err, res){
          if(err) return done(err);
          expect(res.status).to.be(500);
          expect(res.body.data).to.be(null);
          expect(res.body.errors.length).to.be(1);
          expect(res.body.errors[0].type).to.be('InternalServerError');
          expect(res.body.errors[0].message).to.be('InternalServerError');
          expect(res.body.errors[0].code).to.be(500);
          done();
        });
      });

      it('Handled Exceptions should return designated http status code and information', function(done){
        var app = setupMocks();
        request(app)
        .get('/handled_exception')
        .end(function(err, res){
          if(err) return done(err);
          expect(res.status).to.be(400);
          expect(res.body.data).to.be(null);
          expect(res.body.errors.length).to.be(1);
          expect(res.body.errors[0].type).to.be('BadRequest');
          expect(res.body.errors[0].message).to.be('BadRequest');
          expect(res.body.errors[0].code).to.be(400);
          done();
        });
      });
    });
  });

  describe('Authenticated routes', function(){
    describe('Asymmetric JWT auth', function(){
      var validToken;
      before(function(){
        process.env.AUTH = 'jwt';
        process.env.JWT_PUBLIC_KEY = fs.readFileSync(path.join(__dirname, '../testing_rsa.pem'),  'utf8');
        process.env.JWT_ISSUER = 'test_issuer';
        process.env.JWT_AUDIENCE = 'test.com';

        var privateKey = fs.readFileSync(path.join(__dirname, '../testing_rsa'), 'utf8');
        validToken = jwt.sign({}, privateKey, {
          algorithm: 'RS256',
          issuer: 'test_issuer',
          expiresIn: 60 * 10,
          audience: 'test.com'
        });
      });

      after(function(){
        process.env.AUTH = '';
        process.env.JWT_PUBLIC_KEY = '';
        process.env.JWT_ISSUER = '';
        process.env.JWT_AUDIENCE = '';
      });

      it('Should return Unauthorized without proper headers', function(done){
        var app = setupMocks();
        request(app)
        .post('/auth/bounce')
        .end(function(err, res){
          if(err) return done(err);
          expect(res.status).to.be(401);
          expect(res.body.errors.length).to.be(1);
          expect(res.body.errors[0].type).to.be('Unauthorized');
          expect(res.body.errors[0].message).to.be('Unauthorized');
          expect(res.body.errors[0].code).to.be(401);
          expect(res.body.data).to.be(null);
          done();
        });
      });

      it('Should return Unauthorized with a bad token value', function(done){
        var app = setupMocks();
        request(app)
        .post('/auth/bounce')
        .set('X-Proxy-Secret-Token', 'banana')
        .end(function(err, res){
          if(err) return done(err);
          expect(res.status).to.be(401);
          expect(res.body.errors.length).to.be(1);
          expect(res.body.errors[0].type).to.be('Unauthorized');
          expect(res.body.errors[0].message).to.be('Unauthorized');
          expect(res.body.errors[0].code).to.be(401);
          expect(res.body.data).to.be(null);
          done();
        });
      });

      it('Should return with success with proper headers', function(done){
        var app = setupMocks();
        request(app)
        .post('/auth/bounce')
        .set('X-Proxy-Secret-Token', validToken)
        .end(function(err, res){
          if(err) return done(err);
          expect(res.status).to.be(200);
          expect(res.body.data.foo).to.be('bar');
          expect(res.body.errors.length).to.be(0);
          done();
        });
      });

      describe('Error Handling', function(){
        it('Unhandled Exceptions should be a 500 internal server error', function(done){
          var app = setupMocks();
          request(app)
          .post('/auth/unhandled_exception')
          .set('X-Proxy-Secret-Token', validToken)
          .end(function(err, res){
            if(err) return done(err);
            expect(res.status).to.be(500);
            expect(res.body.data).to.be(null);
            expect(res.body.errors.length).to.be(1);
            expect(res.body.errors[0].type).to.be('InternalServerError');
            expect(res.body.errors[0].message).to.be('InternalServerError');
            expect(res.body.errors[0].code).to.be(500);
            done();
          });
        });

        it('Handled Exceptions should return designated http status code and information', function(done){
          var app = setupMocks();
          request(app)
          .post('/auth/handled_exception')
          .set('X-Proxy-Secret-Token', validToken)
          .end(function(err, res){
            if(err) return done(err);
            expect(res.status).to.be(402);
            expect(res.body.data).to.be(null);
            expect(res.body.errors.length).to.be(1);
            expect(res.body.errors[0].type).to.be('PaymentRequired');
            expect(res.body.errors[0].message).to.be('PaymentRequired');
            expect(res.body.errors[0].code).to.be(402);
            done();
          });
        });
      });
    });

    describe('legacy header_key_value auth', function(){
      before(function(){
        process.env.AUTH = 'header_key_value';
        process.env.AUTH_HEADER_KEY = 'secret';
        process.env.AUTH_HEADER_VALUE = 'tacocat';
      });

      after(function(){
        process.env.AUTH = '';
        process.env.AUTH_HEADER_KEY = '';
        process.env.AUTH_HEADER_VALUE = '';
      });

      it('Should return Unauthorized without proper headers', function(done){
        var app = setupMocks();
        request(app)
        .post('/auth/bounce')
        .end(function(err, res){
          if(err) return done(err);
          expect(res.status).to.be(401);
          expect(res.body.errors.length).to.be(1);
          expect(res.body.errors[0].type).to.be('Unauthorized');
          expect(res.body.errors[0].message).to.be('Unauthorized');
          expect(res.body.errors[0].code).to.be(401);
          expect(res.body.data).to.be(null);
          done();
        });
      });

      it('Should return with success with proper headers', function(done){
        var app = setupMocks();
        request(app)
        .post('/auth/bounce')
        .set('secret', 'tacocat')
        .end(function(err, res){
          if(err) return done(err);
          expect(res.status).to.be(200);
          expect(res.body.data.foo).to.be('bar');
          expect(res.body.errors.length).to.be(0);
          done();
        });
      });

      describe('Error Handling', function(){
        it('Unhandled Exceptions should be a 500 internal server error', function(done){
          var app = setupMocks();
          request(app)
          .post('/auth/unhandled_exception')
          .set('secret', 'tacocat')
          .end(function(err, res){
            if(err) return done(err);
            expect(res.status).to.be(500);
            expect(res.body.data).to.be(null);
            expect(res.body.errors.length).to.be(1);
            expect(res.body.errors[0].type).to.be('InternalServerError');
            expect(res.body.errors[0].message).to.be('InternalServerError');
            expect(res.body.errors[0].code).to.be(500);
            done();
          });
        });

        it('Handled Exceptions should return designated http status code and information', function(done){
          var app = setupMocks();
          request(app)
          .post('/auth/handled_exception')
          .set('secret', 'tacocat')
          .end(function(err, res){
            if(err) return done(err);
            expect(res.status).to.be(402);
            expect(res.body.data).to.be(null);
            expect(res.body.errors.length).to.be(1);
            expect(res.body.errors[0].type).to.be('PaymentRequired');
            expect(res.body.errors[0].message).to.be('PaymentRequired');
            expect(res.body.errors[0].code).to.be(402);
            done();
          });
        });
      });
    });
  });

  describe('Versioning', function(){
    before(function(){
      process.env.AUTH = 'none';
    });

    after(function(){
      process.env.AUTH = '';
    });

    it('Should have version 2.0 set on request', function(done){
      var app = setupMocks();
      request(app)
      .get('/status')
      .set('Accept', 'version=2.0')
      .end(function(err, res){
        if(err) return done(err);
        expect(res.status).to.be(200);
        expect(res.body.errors.length).to.be(0);
        expect(res.body.data).to.be('OKV2');
        done();
      });
    });

    it('Should default to 1.0 set on request', function(done){
      var app = setupMocks();
      request(app)
      .get('/status')
      .end(function(err, res){
        if(err) return done(err);
        expect(res.status).to.be(200);
        expect(res.body.errors.length).to.be(0);
        expect(res.body.data).to.be('OK');
        done();
      });
    });
  });

  describe('Forensics', function(){
    before(function(){
      process.env.AUTH = 'none';
    });

    after(function(){
      process.env.AUTH = '';
    });

    describe('Versioning', function(){
      it('Should be none when not in query string', function(done){
        var app = setupMocks();
        request(app)
        .get('/status')
        .set('Accept', 'version=2.0')
        .end(function(err, res){
          if(err) return done(err);
          expect(res.status).to.be(200);
          expect(res.body.errors.length).to.be(0);
          expect(res.body.data).to.be('OKV2');
          expect(res.body.forensics.length).to.be(0);
          done();
        });
      });

      it('Should have version', function(done){
        var app = setupMocks();
        request(app)
        .get('/status?forensics=on')
        .set('Accept', 'version=2.0')
        .end(function(err, res){
          if(err) return done(err);
          expect(res.status).to.be(200);
          expect(res.body.errors.length).to.be(0);
          expect(res.body.data).to.be('OKV2');
          expect(res.body.forensics.length).to.be(1);
          expect(res.body.forensics[0].version).to.be('2.0');
          done();
        });
      });
    });
  });
});
