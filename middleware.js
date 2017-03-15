var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var BaseHttpError = require('./errors/base_http_error.js');
var forensics = require('./middleware/forensics.js');
var versionParser = require('./middleware/version_parser.js');
var callSourceLogger = require('./middleware/call_source_logger.js');
var errorHandler = require('./middleware/error_handler.js');
var requestTimer = require('./middleware/request_timer.js');
var responseBuilder = require('./middleware/response_builder.js');
var RouteAuthenticatorFactory = require('./factories/route_authenticator_factory.js');

function Middleware(){
  var _self = this;
  var routeDefinitionCallback;

  _self.defineRoutes = function(callback){
    if(callback){
      routeDefinitionCallback = callback;
    }
  };

  _self.getRouter = function(){
    var routeAuthenticatorFactory = new RouteAuthenticatorFactory(console);
    var router = express.Router();

    router.use(logger('dev'));
    setBodyParser(router);
    router.use(forensics);
    router.use(callSourceLogger);
    router.use(requestTimer);
    router.use(versionParser);


    if(routeDefinitionCallback){
      var routeAuthenticator = routeAuthenticatorFactory.getRouteAuthenticator();
      routeDefinitionCallback(router, routeAuthenticator.authenticate);
    }

    router.use(errorHandler);
    router.use(responseBuilder);

    return router;
  };

  function setBodyParser(router){
    if(process.env.REQUEST_SIZE_LIMIT){
      router.use(bodyParser.json({ limit : process.env.REQUEST_SIZE_LIMIT }));
      console.log('REQUEST_SIZE_LIMIT set to: %s', process.env.REQUEST_SIZE_LIMIT);
    } else {
      router.use(bodyParser.json());
    }
  }
}

var middleware = new Middleware();
middleware.BaseHttpError = BaseHttpError;

module.exports = middleware;
