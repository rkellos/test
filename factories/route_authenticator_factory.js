var HeaderKeyValueRouteAuthenticator = require('../middleware/route_authenticators/header_key_value_route_authenticator.js');
var JWTRouteAuthenticator = require('../middleware/route_authenticators/jwt_route_authenticator.js');
var NoAuthRouteAuthenticator = require('../middleware/route_authenticators/no_auth_route_authenticator.js');

function RouteAuthenticatorFactory(logger){
  var _self = this;
  var _logger = logger;

  _self.getRouteAuthenticator = function(){
    if(process.env.AUTH && process.env.AUTH.toLowerCase() === 'header_key_value'){
      return new HeaderKeyValueRouteAuthenticator(_logger);
    } else if(process.env.AUTH && process.env.AUTH.toLowerCase() == 'jwt'){
      return new JWTRouteAuthenticator(_logger);
    } else if(process.env.AUTH && process.env.AUTH.toLowerCase() == 'none'){
      return new NoAuthRouteAuthenticator(_logger);
    } else {
      throw new Error('AUTH ENV variable must be configured. Options: none, jwt, header_key_value');
    }
  };
}

module.exports = RouteAuthenticatorFactory;
