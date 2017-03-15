var proxyquire = require('proxyquire').noPreserveCache();
var expect = require('expect.js');
var forensics = require('../../middleware/forensics.js');

describe('Forensics', function(){
  var mockRequest;
  var mockResponse;

  beforeEach(function(){
    mockRequest = {
      query: {}
    };

    mockResponse = {
      locals: {}
    };
  });

  describe('enabled', function(){
    beforeEach(function(){
      mockRequest.query.forensics = 'on';
    });

    it('calling setForensics sets foo', function(done){
      forensics(mockRequest, mockResponse, function(err){
        mockResponse.setForensics('foo', 'bar');
        expect(mockResponse.locals.forensics).to.be.a(Array);
        expect(mockResponse.locals.forensics.length).to.be(1);
        expect(mockResponse.locals.forensics[0].foo).to.be('bar');
        done();
      });
    });

    it('setForensics overrides existing key if called twice', function(done){
      forensics(mockRequest, mockResponse, function(err){
        mockResponse.setForensics('foo', 'bar');
        mockResponse.setForensics('foo', 'blah');
        expect(mockResponse.locals.forensics).to.be.a(Array);
        expect(mockResponse.locals.forensics.length).to.be(1);
        expect(mockResponse.locals.forensics[0].foo).to.be('blah');
        done();
      });
    });
  });

  describe('disabled', function(){
    it('calling setForensics does nothing', function(done){
      forensics(mockRequest, mockResponse, function(err){
        mockResponse.setForensics('foo', 'bar');
        expect(mockResponse.locals.forensics).to.be(undefined);
        done();
      });
    });
  })
});
