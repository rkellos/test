## Information about this Repository
Express middleware which handles a lot of the app boilerplate. This includes things like request parsing, authentication, error handling, metrics, and response building.

## Middleware Documentation
The package for installation lives at @careerbuilder/consumer-services-middleware

#### Basic Installation

@Example app.js
```javascript
var middleware = require('@careerbuilder/consumer-services-middleware');
middleware.defineRoutes(function(router, routeAuthenticator){
  router.get('/status', function(req, res, next){
    res.data = 'OK';
    next();
  });
});

var app = express();
app.use(middleware.getRouter());

module.exports = app;
```

I would advise passing the routing callback from another file you require in to keep routing clean and separated.

#### Response Builder

To return a successful response with data:
```javascript
res.data = { foo: 'bar' };
```

Return an error(also look at Error handling documentation):
```javascript
next(new middleware.BaseHttpError('BadRequest', 400));
```

Basic response structure:
```javascript
{
  errors: [],
  forensics: [],
  timing: {
    time_received: req.timing.time_received,
    time_elapsed_seconds: elapsedMilliseconds / 1000.0
  },
  data: null
}
```

#### Error handling
If an unhandled error is thrown, it is logged and the response is set to 500 with an error of 'InternalServerError'.

If BaseHttpError is returned to the next callback, it is logged and the response is set to the status code and message set in the error object.

@Example Controller
```javascript
var middleware = require('@careerbuilder/consumer-services-middleware');

function HomeController(){
  this.get = function(req, res, next){
    next(new middleware.BaseHttpError('BadRequest', 400));
  });
}
module.exports = HomeController;

```

#### Routing
If you are using the chassis init method, this will be setup for you. You will just need to set new routes in 'routes/application\_routes.js'.

Routing is set by calling 'defineRoutes' and passing it a callback. This method will provide two arguments to the callback, 'router', and 'routeAuthenticator'.
'router' is the express router for the app. 'routeAuthenticator' is a middleware function you can leverage if you want a route to have authentication.

@Example
```javascript
var middleware = require('@careerbuilder/consumer-services-middleware');
middleware.defineRoutes(function(router, routeAuthenticator){
  router.get('/status', function(req, res, next){
    res.data = 'OK';
    next();
  });

  router.get('/protected', routeAuthenticator, function(req, res, next){
    res.data = 'OK';
    next();
  });
});
```

Any request attempt against a route that does not exist will return a response of 404 'NotFound'.

#### authentication
The app must be configured using the AUTH environment variable. There are 3 options: none, jwt, header\_key\_value.

None should only be used if you are doing local development or an edge case situation.


**New JWT AUTH**
This scheme is here to support Platform Services auth routing layer.

Default behavior uses the new cb routing layer auth mechanism(asymmetric JWT).
To use this you will need to set 3 environment variables up.

`process.env.JWT_PUBLIC_KEY`

Public pem string provided by the AUTH Routing layer team. This will change based on whether you are in staging or production.

`process.env.JWT_ISSUER`

Issuer ID

`process.env.JWT_AUDIENCE`

The main route for your app that the routing layer exposes.
E.G., if your microservice is /consumer/resume 


*To test this manually you will need to generate a proper JWT token.*

Creating a test RSA public/private key:
Make sure to not use the default file when asked. Dump it somewhere else.
```
ssh-keygen
```

Convert the public key to a pem file(the output of this is used to set your app's JWT\_PUBLIC\_KEY variable:
```
ssh-keygen -f mykey.pub -e -m pem
```
I had to run the pem key generate command on an ubuntu box because my ssh-keygen was not the right version and I couldn't figure out how to update it with brew.

Generating a test JWT token using your private key(mykey\_rsa):
```javascript
var jwt = require('jsonwebtoken');
var fs = require('fs');
var path = require('path');
var privateKeyFile = path.join(__dirname, process.argv[2]);

var privateKey= fs.readFileSync(privateKeyFile);
var jwtToken = jwt.sign({}, privateKey, {
  algorithm: 'RS256',
  issuer: 'JWT_ISSUER',
  expiresIn: 60 * 10,
  audience: 'JWT_AUDIENCE'
});

console.log('JWT: %s', jwtToken);
```

**Old Header Key/Value Auth**

For backwards compatibility as well as for potentially other use cases the original functionality of header key/value is still available. In order to use that functionality please set
process.env.AUTH to 'header\_key\_value'

process.env.AUTH\_HEADER\_KEY is used for setting the header key.

process.env.AUTH\_HEADER\_VALUE is used for setting the header value.

If these values are not set, routes protected by the authentication handler will be open.

To make a route authenticated please see the routing documentation above.

If authentication fails for a route, a 401 'Unauthorized' error will be returned.

#### Versioning
There is a built in handler for version parsing.

It parses the Accept header and looks for 'version=x.x'.

This version number is then available on the request object `req.apiVersion`

If a version is not supplied in the header the version will default to '1.0'.

#### Metrics
If process.env.STACK\_NAME and process.env.NODE\_ENV is available, metrics will be sent.  If they are not present, metrics will not be sent.

Metrics structure appears as `stackName.nodeEnv.requestPath.version.prefix.metric`.

Example: my\_stack.production.user.v1.info.status\_code.200

#### Request Size limit
By default the limit is set to 100kb from the body-parser middleware we use: https://github.com/expressjs/body-parser

If your use case required you to need more than this default size you can change it through the ENV variable REQUEST\_SIZE\_LIMIT.

Example: REQUEST\_SIZE\_LIMIT=1000kb, REQUEST\_SIZE\_LIMIT=1mb


