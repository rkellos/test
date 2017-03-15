function forensics(req, res, next){
  if(req.query.forensics && req.query.forensics.toLowerCase() === 'on'){
    res.locals.forensicsEnabled = true;
    res.locals.forensics = [];
  }

  res.setForensics = function(key, value){
    if(!res.locals.forensicsEnabled){
      return;
    }

    var index = res.locals.forensics.findIndex(function(element){
      return element[key];
    });

    if(index == -1){
      var forensic = {};
      forensic[key] = value;
      res.locals.forensics.push(forensic);
    } else {
      res.locals.forensics[index][key] = value;
    }
  };

  next();
}
module.exports = forensics;
