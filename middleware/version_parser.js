function VersionParser(req, res, next){
  var version = getVersion(req);
  res.setForensics('version', version);
  req.apiVersion = version;
  next();
}

function getVersion(req){
  var defaultVersion = "1.0";
  var acceptHeaderPieces = req.headers.accept ? req.headers.accept.split(';') : [];
  for(index in acceptHeaderPieces){
    var headerPiece = acceptHeaderPieces[index];
    if(headerPiece.indexOf('version') != -1){
      var variablePieces = headerPiece.split('=');
      if(variablePieces.length == 2){
        return variablePieces[1];
      }
    }
  }
  return defaultVersion;
}

module.exports = VersionParser;
