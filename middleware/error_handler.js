var BaseHttpError = require('../errors/base_http_error.js');

function errorHandler(err, req, res, next){
  console.log('Error: %j', err);
  if(err.stack){
    console.log('Error Stack: %s', err.stack);
  } else {
    console.log('Error Stack: Unavailable');
  }

  res.locals.errors = [];
  if(err instanceof BaseHttpError){
    res.locals.errors.push(err);
  } else if(err.statusCode){
    var message = err.message ? err.message : 'Message unavailable';
    var reasonPhrase = err.reasonPhrase ? err.reasonPhrase : 'Unknown';
    var httpError = new BaseHttpError(reasonPhrase, message, err.statusCode);
    res.locals.errors.push(httpError);
  } else{
    res.locals.errors.push(new BaseHttpError('InternalServerError', 'InternalServerError', 500));
  }

  next();
}

module.exports = errorHandler;
