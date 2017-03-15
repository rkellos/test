function requestTimer(req, res, next){
  res.locals.timing = {};
  res.locals.timing.time_received = (new Date()).toISOString();

  res.getTimingInfo = function(){
    var elapsedMilliseconds = getElapsedTimeAsMilliseconds(res);

    return {
      timeReceived: res.locals.timing.time_received,
      elapsedMilliseconds: elapsedMilliseconds,
      elapsedSeconds: elapsedMilliseconds / 1000.0
    };
  };
  next();
}

function getElapsedTimeAsMilliseconds(res){
  return Date.now() - Date.parse(res.locals.timing.time_received);
}

module.exports = requestTimer;
