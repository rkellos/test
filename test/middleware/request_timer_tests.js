var proxyquire = require('proxyquire').noPreserveCache();
var expect = require('expect.js');
var sinon = require('sinon');
var requestTimer = require('../../middleware/request_timer.js');

describe('RequestTimer', function(){
  var mockRequest;
  var mockResponse;

  beforeEach(function(){
    mockRequest = {};
    mockResponse = {
      locals: {}
    };
  });

  describe('getTimingInfo', function(){
    it('function is added to response object', function(done){
      requestTimer(mockRequest, mockResponse, function(err){
        expect(mockResponse).to.have.property('getTimingInfo');
        done();
      });
    });

    describe('in a time bubble', function(){
      var clock;
      beforeEach(function(){
        clock = sinon.useFakeTimers();
      });
      
      afterEach(function(){
        clock.restore();
      });

      it('calculates timing info properly', function(done){
        requestTimer(mockRequest, mockResponse, function(err){
          var beforeTimingInfo = mockResponse.getTimingInfo();
          expect(beforeTimingInfo.timeReceived).to.be('1970-01-01T00:00:00.000Z');
          expect(beforeTimingInfo.elapsedMilliseconds).to.be(0);
          expect(beforeTimingInfo.elapsedSeconds).to.be(0);

          clock.tick(130);

          var afterTimingInfo = mockResponse.getTimingInfo();
          expect(afterTimingInfo.timeReceived).to.be('1970-01-01T00:00:00.000Z');
          expect(afterTimingInfo.elapsedMilliseconds).to.be(130);
          expect(afterTimingInfo.elapsedSeconds).to.be(0.13);
          done();
        });
      });
    });
  });
});
