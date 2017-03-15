function NoAuthRouteAuthenticator(logger){
  var _self = this;

  if(!logger){
    throw new Error('Argument Null: logger');
  }
  var _logger = logger;

  _self.authenticate = function(req, res, next){
    _logger.log('NoAuthRouteAuthenticator used.');
    return next();
  };
}

module.exports = NoAuthRouteAuthenticator;
