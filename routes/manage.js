var db = require('nedb'), 
    fs = require('fs'),
    assocs = new db({filename: 'databases/assocs.nedb', autoload: true}),

/* 
  Adds an association between save and scripts. 
  This needs being logged in. 
  Error responses: 
    * Database error: ....
    * Not enough arguments provided: assoc= and saveid= are mandatory!
    * HTTP/1.1 401 Unauthorized \n\n User is not logged in to manage associations!
  Success responses:
    * Added successfully: <document json>
  
  The database should look something like this: 
  {
    username: 'boxmein', 
    assocs: [
    {
      // Save ID
      saveid: 111111,
      // Needs scripts with ID: 
      assocs: [0, 1, 2, 3]
    }
    ]
  }
*/
exports.post_addassoc = function (req, res) {
  
  if (req.session.logged_in) {

    // Basically just check if an entry for a given username exists
    assocs.find({username: req.session.username}, function (err, docs) {
      if (err) 
        return res.send('Database error: ' + err);

      // If not then create it, else update the assocs list
      if (docs.length && docs.length == 0) {

        // If the post body was invalid
        if (!req.body.assoc || (req.body.assoc.length && req.body.assoc.length == 0) 
          ||!req.body.saveid || (req.body.saveid.length && req.body.saveid.length == 0)) 
          return res.send('Not enough arguments provided: assoc= and saveid= are mandatory!');

        // assocs is a list of integers for script IDs, so convert them 
        var assocs = req.body.assoc.split(','); 
        assocs.map(function(each) { 
          var i=Number(each); 
          if(isNaN(i)) 
            return undefined; 
          else return i;
        });
        
        // saveid is obviously an integer
        var saveid = Number(req.body.saveid); 
        if (isNaN(saveID))
          return res.send('Save ID was non-integer: ' + req.body.saveid);

        assocs.insert({
          username: req.session.username, 
          assocs: [{saveid: req.body.saveid, assocs: req.body.assocs}]
        }, function(err, docs) {
          if (err) 
            return res.send('Database error: ' + err);

          res.send('Added successfully: ' + JSON.stringify(docs));
        });
      }
      // Else just add to the list
      else {
        assocs.update({username: req.session.username}, 
          {
            $push: {
              assocs: {
                saveid: req.body.saveid, 
                assocs: req.body.assocs
              }
            }
          }, {}, function() {});
      }

    });
  }
  else {
    res.status(401).send('User is not logged in to manage associations!');
  }
};