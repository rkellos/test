var proxyquire = require('proxyquire').noPreserveCache();
var sinon = require('sinon');
var expect = require('expect.js');
var util = require('util');
var ResponseBuilderModule = '../../middleware/response_builder.js';
var BaseHttpError = require('../../errors/base_http_error.js');

describe('ResponseBuilder', function(){
  var mockRequest;
  var mockResponse;
  var mockConsumerDatadogInstance;
  var mockConsumerDatadog;
  var responseBuilder;
  var timingSpy;
  var infoSpy;
  var mockTimingInfo = {
    timeReceived: new Date(0).toISOString(),
    elapsedMilliseconds: 100
  };
  var expectedTimingResponse = {
    time_received: '1970-01-01T00:00:00.000Z',
    time_elapsed_milliseconds: 100
  };

  before(function(){
    mockConsumerDatadogInstance = {
      reportTimingMetric: function(){},
      reportInfoMetric: function(){}
    };

    timingSpy = sinon.spy(mockConsumerDatadogInstance, 'reportTimingMetric');
    infoSpy = sinon.spy(mockConsumerDatadogInstance, 'reportInfoMetric');
  });

  beforeEach(function(){
    mockRequest = {};
    mockResponse = {
      locals: {},
      statusCode: 200,
      jsonResponse: null,
      getTimingInfo: function(){
        return mockTimingInfo;
      },
      status: function(code){
        this.statusCode = code;
      },
      json: function(jsonResponse){
        this.jsonResponse = jsonResponse;
      }
    };
    mockConsumerDatadog = function(){
      return mockConsumerDatadogInstance;
    };

    timingSpy.reset();
    infoSpy.reset();
  });

  function setupMocks(){
    mocks = {};
    mocks['@careerbuilder/consumer-datadog'] = mockConsumerDatadog;
    responseBuilder = proxyquire(ResponseBuilderModule, mocks);
  }

  function shouldReportToDatadog(statusCode){
    expect(timingSpy.called).to.be(true);
    expect(timingSpy.getCall(0).args[0]).to.be('request_total');
    expect(timingSpy.getCall(0).args[1]).to.be(100);

    expect(infoSpy.called).to.be(true);
    expect(infoSpy.getCall(0).args[0]).to.be(util.format('status_code.%s', statusCode));
    expect(infoSpy.getCall(0).args[1]).to.be(1);
  }

  describe('errors', function(){
    beforeEach(function(){
      setupMocks();
    });

    it('response is a properly formed BadRequest-400', function(){
      mockResponse.locals.errors = [ new BaseHttpError('BadRequest', 'BadRequest', 400) ]; 

      responseBuilder(mockRequest, mockResponse);

      var expectedError = { reason: 'BadRequest', message: 'BadRequest', code: 400 };
      expectProperlyFormedErrorResponse(mockResponse, expectedError, expectedTimingResponse);
      shouldReportToDatadog(400);
    });

    describe('with forensics', function(){
      it('response is a properly formed BadRequest-400', function(){
        mockResponse.locals.errors = [ new BaseHttpError('BadRequest', 'BadRequest', 400) ]; 
        mockResponse.locals.forensics = [ { foo: 'bar' }, { bam: 'boom' } ];

        responseBuilder(mockRequest, mockResponse);

        var expectedError = { reason: 'BadRequest', message: 'BadRequest', code: 400 };
        expectProperlyFormedErrorResponse(mockResponse, expectedError, expectedTimingResponse);
        shouldReportToDatadog(400);
      });
    });

    describe('no timing info', function(){
      beforeEach(function(){
        mockResponse.getTimingInfo = undefined;
        setupMocks();
      });

      it('response has timing info as unknown', function(){
        mockResponse.locals.errors = [ new BaseHttpError('BadRequest', 'BadRequest', 400) ]; 
        responseBuilder(mockRequest, mockResponse);

        var expectedError = { reason: 'BadRequest', message: 'BadRequest', code: 400 };
        expectProperlyFormedErrorResponse(mockResponse, expectedError, { time_received: 'unknown', time_elapsed_milliseconds: 'unknown' });
      });
    });
  });

  describe('no errors', function(){
    describe('data present', function(){
      beforeEach(function(){
        mockResponse.data = { foo: 'bar' };
      });

      it('response is properly formed Success-200', function(){
        responseBuilder(mockRequest, mockResponse);

        expect(mockResponse.statusCode).to.be(200);
        expect(mockResponse.jsonResponse).to.not.be(null);
        var jsonResponse = mockResponse.jsonResponse;
        expect(jsonResponse.errors).to.be.a(Array);
        expect(jsonResponse.errors.length).to.be(0);
        expect(jsonResponse.forensics).to.be.a(Array);
        expect(jsonResponse.forensics.length).to.be(0);
        expect(jsonResponse.timing).to.not.be(undefined);
        expect(jsonResponse.timing.time_received).to.be('1970-01-01T00:00:00.000Z');
        expect(jsonResponse.timing.time_elapsed_milliseconds).to.be(100);
        expect(jsonResponse.data).to.not.be(null);
        expect(jsonResponse.data.foo).to.be('bar');

        shouldReportToDatadog(200);
      });

      describe('with forensics', function(){
        it('response is properly formed Success-200', function(){
          mockResponse.locals.forensics = [ { foo: 'bar' }, { bam: 'boom' } ];

          responseBuilder(mockRequest, mockResponse);

          expect(mockResponse.statusCode).to.be(200);
          expect(mockResponse.jsonResponse).to.not.be(null);
          var jsonResponse = mockResponse.jsonResponse;
          expect(jsonResponse.errors).to.be.a(Array);
          expect(jsonResponse.errors.length).to.be(0);
          expect(jsonResponse.forensics).to.be(mockResponse.locals.forensics);
          expect(jsonResponse.forensics.length).to.be(mockResponse.locals.forensics.length);
          expect(jsonResponse.timing).to.not.be(undefined);
          expect(jsonResponse.timing.time_received).to.be('1970-01-01T00:00:00.000Z');
          expect(jsonResponse.timing.time_elapsed_milliseconds).to.be(100);
          expect(jsonResponse.data).to.not.be(null);
          expect(jsonResponse.data.foo).to.be('bar');
          shouldReportToDatadog(200);
        });
      });
    });

    describe('data not present', function(){
      it('response is a properly formed Not Found-404', function(){
        responseBuilder(mockRequest, mockResponse);
        var expectedError = { reason: 'NotFound', message: 'NotFound', code: 404 };
        expectProperlyFormedErrorResponse(mockResponse, expectedError, expectedTimingResponse);
        shouldReportToDatadog(404);
      });
    });

    describe('with no timing info', function(){
      beforeEach(function(){
        mockResponse.getTimingInfo = undefined;
      });

      describe('data present', function(){
        beforeEach(function(){
          mockResponse.data = { foo: 'bar' };
          setupMocks();
        });

        it('response is properly formed Success-200', function(){
          responseBuilder(mockRequest, mockResponse);

          expect(mockResponse.statusCode).to.be(200);
          expect(mockResponse.jsonResponse).to.not.be(null);
          var jsonResponse = mockResponse.jsonResponse;
          expect(jsonResponse.errors).to.be.a(Array);
          expect(jsonResponse.errors.length).to.be(0);
          expect(jsonResponse.forensics).to.be.a(Array);
          expect(jsonResponse.forensics.length).to.be(0);
          expect(jsonResponse.timing).to.not.be(undefined);
          expect(jsonResponse.timing.time_received).to.be('unknown');
          expect(jsonResponse.timing.time_elapsed_milliseconds).to.be('unknown');
          expect(jsonResponse.data).to.not.be(null);
          expect(jsonResponse.data.foo).to.be('bar');

          expect(timingSpy.called).to.not.be.ok();
        });
      });

      describe('data not present', function(){
        it('response is a properly formed Not Found-404', function(){
          responseBuilder(mockRequest, mockResponse);
          var expectedError = { reason: 'NotFound', message: 'NotFound', code: 404 };
          expectProperlyFormedErrorResponse(mockResponse, expectedError, { time_received: 'unknown', time_elapsed_milliseconds: 'unknown' });
          expect(timingSpy.called).to.not.be.ok();
        });
      });
    });
  });

  function expectProperlyFormedErrorResponse(mockResponse, expectedError, expectedTimingInfo){
    expect(mockResponse.statusCode).to.be(expectedError.code);
    expect(mockResponse.jsonResponse).to.not.be(null);

    var jsonResponse = mockResponse.jsonResponse;
    expect(jsonResponse.errors).to.be.a(Array);
    expect(jsonResponse.errors.length).to.be(1);
    expect(jsonResponse.errors[0].type).to.be(expectedError.reason);
    expect(jsonResponse.errors[0].message).to.be(expectedError.message);
    expect(jsonResponse.errors[0].code).to.be(expectedError.code);
    expect(jsonResponse.forensics).to.be.a(Array);

    if(mockResponse.locals.forensics){
      expect(jsonResponse.forensics.length).to.be(mockResponse.locals.forensics.length);
      expect(jsonResponse.forensics).to.be(mockResponse.locals.forensics);
    } else {
      expect(jsonResponse.forensics.length).to.be(0);
    }

    expect(jsonResponse.timing).to.not.be(undefined);
    expect(jsonResponse.timing.time_received).to.be(expectedTimingInfo.time_received);
    expect(jsonResponse.timing.time_elapsed_milliseconds).to.be(expectedTimingInfo.time_elapsed_milliseconds);
    expect(jsonResponse.data).to.be(null);
  }
});
