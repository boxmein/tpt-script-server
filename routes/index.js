var db = require('nedb'); 
var fs = require('fs');
var scripts = new db({filename: "databases/scripts.nedb", autoload: true});

var links = [
  {'href': '/', 'title': 'Home'},
  {'href': '#about', 'title': 'About'},
  {'href': '#usage', 'title': 'Usage'},
  {'href': 'https://github.com/boxmein/tpt-script-server', 'title': 'On GitHub'}
];
links.active = '/';

exports.index = function(req, res){
  res.render('index', { title: 'TPT Script Server', links: links});
};

exports.view = function (req, res) {
  var saveID = req.params.saveID; 
  scripts.find({id: saveID}, function (err, docs) {
    if (err) 
      return res.send("ERR:Error finding script ("+saveID+"): "+err);
    else if (docs.length == 0)
      return res.send("ERR:No scripts found");
  });
};

exports.raw = function (req, res) {
  var saveID = req.params.saveID; 
  scripts.find({id: saveID}, function (err, docs) {
    if (err) 
      return res.send("ERR:Error finding script ("+saveID+"): "+err);
    else if (docs.length == 0)
      return res.send("ERR:No scripts found");
  });
};