var G = require('./globals.js'), 
 http = require('http');


/*
  Log out 
  GET /logout
*/
exports.logout = function (req, res) {
  req.session.key = req.session.user = req.session.logged_in = null;
  res.redirect('/');
}

/*
  Basically does the same thing as TPTAPI's client_login.php
  GET /login
  ==> /manage if logged in
  ==> http://tptapi.com/server_login.php if not logged in and not a tptapi response
  ==> errors if errors
*/
exports.login = function (req, res) {
  console.log(req.query);
  // if we already have a session key
  if (req.session.key) 
    return console.log('Redirecting to /manage', res.redirect('/manage')); 

  // if we don't have a ?success that's sent from tptapi
  if (!('success' in req.query))
    return console.log('Redirecting to TPTAPI login, no ?success', res.redirect('http://tptapi.com/server_login.php?off_key='+G.TPTAPI_PUBLIC_KEY));

  // and if someone does have success but no token id
  else if (!req.query.token_id) 
    return console.log('?success but no &token_id', res.send('Malformed response'));

  // if we do then start cutting up the request
  // req.connection.remoteAddress is the IP address.
  // req.query.token_id is some token id passed by tptapi
  var magicpath = '/API_main.php?session_create&private_key=' + G.TPTAPI_PRIVATE_KEY + 
                                      '&session_id=' + req.query.token_id + 
                                      '&ip=' + req.connection.remoteAddress;
                                      //'&ip=176.46.16.185'
  console.log(magicpath);
  var shakeit = http.request({
    host: 'tptapi.com',
    port: 80,
    path: magicpath,
    method: 'GET'
    }, function(resp) {
        if (resp.statusCode != 200) {
          return console.log('Non-200 response from tptapi');
        }

        var data = ''; // ex. 200,4h2j1bqk5i6dxcy,
        resp.on('data', function(chunk) { data += chunk; });

        resp.on('end', function() {
          console.log(data);
          var responses = data.split(',');
          
          console.log(responses);
          if (responses[0] != 200) {
            console.log('TPTAPI didn\'t respond 200 as its response code');
            return res.send('TPTAPI response wasn\'t 200: ' + data);
          }

          req.session.key = responses[1]; 
          req.session.user = responses[2];
          req.session.logged_in = true;
          res.redirect('/manage');
        });

    });
  shakeit.on('error', function(err) {
    console.log(err.stack);
    return res.send('Error requesting TPTAPI');
  });
  shakeit.end();
};