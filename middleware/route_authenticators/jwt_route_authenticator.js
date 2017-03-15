var util = require('util');
var passport = require('passport');
var passportJWT = require('passport-jwt');
var JWTStrategy = passportJWT.Strategy;
var ExtractJwt = passportJWT.ExtractJwt;
var BaseHttpError = require('../../errors/base_http_error.js');

function JWTRouteAuthenticator(logger){
  var _self = this;

  if(!logger){
    throw new Error('Argument Null: logger');
  }
  var _logger = logger;

  checkJWTEnvironmentVariables();

  passport.use(new JWTStrategy(getJWTStrategyOptions(), function(payload, done){
    done(null, payload);
  }));

  _self.authenticate = function(req, res, next){
    passport.authenticate('jwt', function(err, user, info){
      if(err){
        _logger.log(util.format('Error: Passport authentication error: %j\n Info: %j', err, info));
        return next(new BaseHttpError('InternalServerError', 'InternalServerError', 500));
      }

      if(!user){
        _logger.log(util.format('Info: Passport authentication unauthorized. AuthInfo: %j', info));
        return next(new BaseHttpError('Unauthorized', 'Unauthorized', 401));
      } else {
        return next();
      }
    })(req, res, next);
  };

  function checkJWTEnvironmentVariables(){
    if(!process.env.JWT_PUBLIC_KEY){
      throw new Error('Error: ENV variable JWT_PUBLIC_KEY must be set');
    }

    if(!process.env.JWT_ISSUER){
      throw new Error('Error: ENV variable JWT_ISSUER must be set');
    }

    if(!process.env.JWT_AUDIENCE){
      throw new Error('Error: ENV variable JWT_AUDIENCE must be set');
    }
  }

  function getJWTStrategyOptions(){
     return {
      jwtFromRequest: ExtractJwt.fromHeader('x-proxy-secret-token'),
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
      algorithms: ['RS256'],
      secretOrKey: process.env.JWT_PUBLIC_KEY
    };
  }
}

module.exports = JWTRouteAuthenticator;
