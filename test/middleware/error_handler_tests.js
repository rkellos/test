var proxyquire = require('proxyquire').noPreserveCache();
var expect = require('expect.js');
var errorHandler = require('../../middleware/error_handler.js');
var BaseHttpError = require('../../errors/base_http_error.js');

describe('ErrorHandler', function(){
  var mockRequest;
  var mockResponse;

  beforeEach(function(){
    mockRequest = {};
    mockResponse = {
      locals: {}
    };
  });

  it('unhandled exception without status code is set as an internal server error', function(done){
    errorHandler(new Error('FooBar'), mockRequest, mockResponse, function(err){
      if(err) return done(err);
      expect(mockResponse.locals.errors).to.be.an(Array);
      expect(mockResponse.locals.errors.length).to.be(1);
      expect(mockResponse.locals.errors[0].reasonPhrase).to.be('InternalServerError');
      expect(mockResponse.locals.errors[0].message).to.be('InternalServerError');
      expect(mockResponse.locals.errors[0].statusCode).to.be(500);
      done();
    });
  });

  it('unhandled exception with statusCode', function(done){
    errorHandler({ statusCode: 413 }, mockRequest, mockResponse, function(err){
      if(err) return done(err);
      expect(mockResponse.locals.errors).to.be.an(Array);
      expect(mockResponse.locals.errors.length).to.be(1);
      expect(mockResponse.locals.errors[0].reasonPhrase).to.be('Unknown');
      expect(mockResponse.locals.errors[0].message).to.be('Message unavailable');
      expect(mockResponse.locals.errors[0].statusCode).to.be(413);
      done();
    });
  });

  it('unhandled exception with statusCode, message, reasonPhrase', function(done){
    errorHandler({ statusCode: 413, message: 'test', reasonPhrase: 'testReason' }, mockRequest, mockResponse, function(err){
      if(err) return done(err);
      expect(mockResponse.locals.errors).to.be.an(Array);
      expect(mockResponse.locals.errors.length).to.be(1);
      expect(mockResponse.locals.errors[0].reasonPhrase).to.be('testReason');
      expect(mockResponse.locals.errors[0].message).to.be('test');
      expect(mockResponse.locals.errors[0].statusCode).to.be(413);
      done();
    });
  });

  it('BaseHttpError with specific status and message is propogated to the response', function(done){
    errorHandler(new BaseHttpError('BadRequest', 'BadRequest', 400), mockRequest, mockResponse, function(err){
      if(err) return done(err);
      expect(mockResponse.locals.errors).to.be.an(Array);
      expect(mockResponse.locals.errors.length).to.be(1);
      expect(mockResponse.locals.errors[0].reasonPhrase).to.be('BadRequest');
      expect(mockResponse.locals.errors[0].message).to.be('BadRequest');
      expect(mockResponse.locals.errors[0].statusCode).to.be(400);
      done();
    });
  });

  it('BaseHttpError with no message and status code defaults to an empty 500', function(done){
    errorHandler(new BaseHttpError(), mockRequest, mockResponse, function(err){
      if(err) return done(err);
      expect(mockResponse.locals.errors).to.be.an(Array);
      expect(mockResponse.locals.errors.length).to.be(1);
      expect(mockResponse.locals.errors[0].reasonPhrase).to.be('');
      expect(mockResponse.locals.errors[0].message).to.be('');
      expect(mockResponse.locals.errors[0].statusCode).to.be(500);
      done();
    });
  });
});
