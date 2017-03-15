var BaseHttpError = require('../../errors/base_http_error.js');
var util = require('util');

function HeaderKeyValueRouteAuthenticator(logger){
  var _self = this;

  if(!logger){
    throw new Error('Argument Null: logger');
  }
  var _logger = logger;

  checkConfiguration();

  _self.authenticate = function(req, res, next){
    if(req.headers[process.env.AUTH_HEADER_KEY] == process.env.AUTH_HEADER_VALUE) {
      _logger.log(util.format('%s Route authenticated', req.path));
      return next();
    } else {
      return next(new BaseHttpError('Unauthorized','Unauthorized', 401));
    }
  };

  function checkConfiguration(){
    if(!process.env.AUTH_HEADER_KEY){
      throw new Error('Error: ENV variable AUTH_HEADER_KEY must be set');
    }

    if(!process.env.AUTH_HEADER_VALUE){
      throw new Error('Error: ENV variable AUTH_HEADER_VALUE must be set');
    }
  }
}

module.exports = HeaderKeyValueRouteAuthenticator;
