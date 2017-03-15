var proxyquire = require('proxyquire').noPreserveCache();
var expect = require('expect.js');
var versionParser = require('../../middleware/version_parser.js');

describe('VersionParser', function(){
  var mockRequest;
  var mockResponse;

  beforeEach(function(){
    mockRequest = {
      headers: {}
    };

    mockResponse = {
      mockForensics: [],
      setForensics: function(key, value){
        var forensic = {};
        forensic[key] = value;
        this.mockForensics.push(forensic);
      }
    };
  });

  describe('accept header is empty', function(){
    it('should default to 1.0', function(done){
      versionParser(mockRequest, mockResponse, function(err){
        expect(mockRequest.apiVersion).to.be('1.0');
        done();
      });
    });
  });

  describe('with version specified in accept header', function(){
    beforeEach(function(){
      mockRequest.headers.accept = 'version=2.0';
    });

    it('it should return version specified', function(done){
      versionParser(mockRequest, mockResponse, function(err){
        expect(mockRequest.apiVersion).to.be('2.0');
        done();
      });
    });
  });

  describe('with content type and version specified in accept header', function(){
    beforeEach(function(){
      mockRequest.headers.accept = 'application/json;version=2.0';
    });

    it('returns version specified properly', function(done){
      versionParser(mockRequest, mockResponse, function(err){
        expect(mockRequest.apiVersion).to.be('2.0');
        done();
      });
    });
  });
});
