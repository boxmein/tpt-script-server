var db = require('nedb'), 
    fs = require('fs'),
    G = require('./globals.js'),
    assocs = new db({filename: 'databases/assocs.nedb', autoload: true}),
    links = G.links;

exports.manage = function(req, res) {
  if (!req.session.logged_in)
    return res.redirect('/login');
  console.log('Managing associations for ' + req.session.user);

  assocs.find({username: req.session.user}, function(err, docs) {

    if (err) {
      return res.status(500).send('nedb internal error');
    }
    console.log('Found assocs: ' + docs);
    res.render('manage_render', {title: 'Association Manager | TPT Script Server', links: links, assocs: docs});
  });
};



/* 
  Adds an association between save and scripts. 
  This needs being logged in. 
  Error responses: 
    * Database error: ....
    * Not enough arguments provided: assoc= and saveid= are mandatory!
    * HTTP/1.1 401 Unauthorized \n\n User is not logged in to manage associations!
  Success responses:
    * Added successfully: <document json>
  
  The database entry should look something like this: 
  {
    username: 'boxmein', 

    // Save ID
    saveid: 111111,

    // Needs scripts with ID: 
    scripts: [0, 1, 2, 3]
  }
*/
exports.post_addassoc = function (req, res) {
  
  if (!req.session.logged_in)
    return res.status(401).send('User is not logged in!');

  if (!req.body.assoc || (req.body.assoc.length && req.body.assoc.length == 0) 
    ||!req.body.saveid || (req.body.saveid.length && req.body.saveid.length == 0)) 
    return res.status(400).send('Not enough arguments provided: assoc= and saveid= are mandatory!');

  // assocs is a list of integers for script IDs, so convert them 
  var assocses = req.body.assoc.split(','); 
  for (var i=0;i<assocses.length;i++) {
    assocses[i] = Number(assocses[i]);
  }
  
  // saveid is obviously an integer
  var saveid = Number(req.body.saveid); 
  if (isNaN(saveid))
    return res.status(400).send('Save ID was non-integer: ' + req.body.saveid);

  // TODO check if user's own save

  // Check for duplicates
  assocs.find({saveid: req.body.saveid}, function (err, docs) {
    if (err)
      return res.status(500).send('Error checking for duplicates');

    if (docs.length && docs.length > 0) 
      return res.status(400).send('Is a duplicate! Not adding.');
  })

  // Add an entry
  assocs.insert({
    username: req.session.user, 
    saveid: req.body.saveid, 
    scripts: assocses
  }, function(err, docs) {
    if (err) 
      return res.status(500).send('Database error: ' + err);
    console.log('Successfully added ' + JSON.stringify(docs));
    res.set('Content-Type', 'application/json');
    res.send(JSON.stringify(docs));
  });

};

exports.post_rmassoc = function (req, res) {
  if (!req.session.logged_in) 
    return res.status(401).send('User is not logged in to manage associations!');

  if (!req.body.saveid)
    return res.status(400).send('No SaveID sent!');

  // Must be added by the user managing.
  assocs.find({saveid: req.body.saveid, username: req.session.user}, function(err, docs) {
    if (err) 
      res.status(500).send('nedb internal error');

    if (!docs.length || docs.length == 0) 
      res.status(500).send('No assoc on user with such saveid');

    console.log('Removing ' + docs[0]._id + ' from ' + req.session.user + '\'s assocs');
    assocs.remove({_id: docs[0]._id}, function(err, count) {
      res.send('Removed ' + count + ' assoc');
    });
  });
};

exports.get_assocdata = function (req, res) {
  if (!req.params.id) 
    return res.status(400).send('No SaveID sent!');

  assocs.find({saveid: req.params.id}, function (err, docs) {
    if (err)
      res.status(500).send('nedb internal error');

    if (!docs.length || docs.length == 0) 
      res.status(500).send('Didn\'t find a darn thing.');

    console.log('Sending assoc data: ' + JSON.stringify(docs[0]));
    res.set('Content-Type', 'application/json');
    res.send(JSON.stringify(docs[0]));
  });
};