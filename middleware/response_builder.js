var Datadog = require('@careerbuilder/consumer-datadog');
var util = require('util');
var BaseHttpError = require('../errors/base_http_error.js');

function responseBuilder(req, res, next){
  var requestTimingInfo = res.getTimingInfo ? res.getTimingInfo() : null;
  var datadog = new Datadog(process.env, req);

  if(requestTimingInfo){
    datadog.reportTimingMetric('request_total', requestTimingInfo.elapsedMilliseconds);
  }

  var response = getBasicResponse(requestTimingInfo);

  if(res.locals.forensics){
    response.forensics = res.locals.forensics;
  }

  var responseStatusCode = 200;

  if(res.locals.errors && res.locals.errors.length > 0){
    var firstError = res.locals.errors[0];
    responseStatusCode = firstError.statusCode;

    response.errors = res.locals.errors.map(function(error){
      return getErrorModel(error);
    });
  } else if(res.data){
    response.data = res.data;
  } else {
    response.errors.push(getErrorModel(new BaseHttpError('NotFound', 'NotFound', 404)));
    responseStatusCode = 404;
  }

  res.status(responseStatusCode);
  datadog.reportInfoMetric(util.format('status_code.%s', responseStatusCode), 1);

  console.log('Response: %j', response);
  res.json(response);
}

function getBasicResponse(timingInfo){
  return {
    errors: [],
    forensics: [],
    timing: {
      time_received: timingInfo ? timingInfo.timeReceived : 'unknown',
      time_elapsed_milliseconds: timingInfo ? timingInfo.elapsedMilliseconds : 'unknown'
    },
    data: null
  };
}

function getErrorModel(err){
  return {
    type: err.reasonPhrase,
    message: err.message,
    code: err.statusCode
  };
}

module.exports = responseBuilder;
