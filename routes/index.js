var db = require('nedb'), 
    fs = require('fs'),
    scripts = new db({filename: 'databases/scripts.nedb', autoload: true}),
    links = [
  {'href': '/', 'title': 'Home'},
  {'href': '#about', 'title': 'About'},
  {'href': '#usage', 'title': 'Usage'},
  {'href': '#tutorial', 'title': 'Tutorial'},
  {'href': '#scripts', 'title': 'Scripts'},
  {'href': 'https://github.com/boxmein/tpt-script-server', 'title': 'On GitHub'}
];

function sanitizeID(scriptID) {
  return String(Number(scriptID)); 
}

exports.index = function(req, res){
  links.active = '/';
  res.render('index', { title: 'TPT Script Server', links: links});
};

exports.view = function (req, res) {
  var scriptID = req.params.scriptID; 
  scriptID = sanitizeID(scriptID);
  scripts.find({scriptID: scriptID}, function (err, docs) {
    console.log(err, docs); 
    if (err) 
      return res.send('ERR:Error finding script ('+scriptID+'): '+err);
    else if (!docs || docs.length == 0)
      return res.send('ERR:No scripts found: ' + docs.toString());
    res.render('view-script', {
      links: links, 
      title: 'TPT Script Server', 
      code: fs.readFileSync(docs[0].filename),
      meta: docs[0].meta,
      id: scriptID
    });
  });
};

exports.raw = function (req, res) {
  var scriptID = req.params.scriptID; 
  scriptID = sanitizeID(scriptID);
  scripts.find({scriptID: scriptID}, function (err, docs) {
    res.set('Content-Type', 'text/plain');
    if (err) 
      return res.send('ERR:Database error');
    else if (!docs || docs.length == 0)
      return res.send('ERR:No script was found with such ID.');
    res.sendfile(docs[0].filename);
  });
};

exports.meta = function (req, res) {
  var scriptID = req.params.scriptID; 
  scriptID = sanitizeID(scriptID);
  scripts.find({scriptID: scriptID}, function(err, docs) {
    res.set('Content-Type', 'text/plain');
    if (err)
      return res.send('ERR: Error finding script ('+scriptID+'): '+err);
    else if (!docs || docs.length == 0) 
      return res.send('ERR:No scripts found: ' + docs.toString());
    res.set('Content-Type', 'application/json');
    res.send(JSON.stringify(docs[0].meta));
  });
};

exports.rawlist = function (req, res) {
  scripts.find({}, function(err, docs) {
    res.set('Content-Type', 'text/plain');
    if (err) return res.send("ERR:" + err); 
    if (!docs || docs.length == 0) 
      return res.send("ERR:None found"); 
    for (var i=0;i<docs.length;i++) {
      res.send(docs[i].scriptID+';'+JSON.stringify(docs[i].meta));
    }
  });
};

exports.list = function (req, res) {
  scripts.find({}, function (err, docs) {
    if (err) return res.send('ERR: ' + err); 
    res.render('list', {scripts: docs, links: links, title: "TPT Script Server"});
  });
};