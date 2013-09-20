var db = require('nedb'), 
    fs = require('fs'),
    scripts = new db({filename: 'databases/scripts.nedb', autoload: true}),
    links = [
  {'href': '/', 'title': 'Home'},
  {'href': '#about', 'title': 'About'},
  {'href': '#usage', 'title': 'Usage'},
  {'href': '#scripts', 'title': 'Scripts'},
  {'href': 'https://github.com/boxmein/tpt-script-server', 'title': 'On GitHub'}
];


/*
  Dummy function that cleans up a script ID
*/
function sanitizeID(scriptID) {
  return String(Number(scriptID)); 
}


/*
  Renders the index page with text in it
  GET /
  Content-Type: text/html
*/
exports.index = function(req, res){
  links.active = '/';
  res.render('index', { title: 'TPT Script Server', links: links});
};


/*
  Renders a script view page. 
  GET /view/<id>
  Content-Type: text/html

  Sends errors: 
  1. ERR:Error finding script (<id>): <error>
     - nedb had an internal error while finding. 
  2. ERR:No scripts found: 
     - query resulted in empty array
*/
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


/*
  raw script data fetching page
  GET /raw/<id>
  Content-Type: text/plain

  Errors: 
    1. ERR:Database error
       - nedb had an internal error while finding.
    2. ERR:No script was found with such ID.
       - query resulted in empty array
*/
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


/*
  Metadata JSON fetching page
  GET /meta/<id>
  Content-Type: text/plain if error, application/json if successful
  
  Errors:
    1. ERR:Error finding script (<id>): <error>
       - nedb had an internal error while finding.
    2. ERR:No scripts found:
       - query resulted in empty array
*/
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


/*
  Raw script listing page. Responds with ID and metadata for each script. 
  GET /rawlist/ 
  Content-Type: text/plain

  Errors: 
    1. ERR:<error>
       - nedb had an internal error while finding.
    2. ERR:None found
       - query resulted in empty array
  
  Entry format: 

         <entry-line> ::= <script-id> ";" <script-metadata> "\r\n"
          <script-id> ::= <number> 
    <script-metadata> ::= <json>
*/
exports.rawlist = function (req, res) {
  scripts.find({}, function(err, docs) {
    res.set('Content-Type', 'text/plain');
    if (err) return res.send("ERR:" + err); 
    if (!docs || docs.length == 0) 
      return res.send("ERR:None found"); 
    var response = ""; 
    for (var i=0;i<docs.length;i++) {
      response += docs[i].scriptID+';'+JSON.stringify(docs[i].meta) + "\r\n";
    }
    res.send(response);
  });
};

/*
  Pretty script listing page. 
  GET /list/ 
  Content-Type: text/html

  Errors: 
    1. ERR: <error>
       - nedb had an internal error while finding.

*/
exports.list = function (req, res) {
  scripts.find({}, function (err, docs) {
    if (err) return res.send('ERR: ' + err); 
    res.render('list', {scripts: docs, links: links, title: "TPT Script Server"});
  });
};