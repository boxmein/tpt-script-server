var G = require('./globals.js'), 
 http = require('http');

/*
  Basically does the same thing as TPTAPI's client_login.php
  GET /login

*/
exports.login = function (req, res) {

  // if we already have a session key
  if (req.session.key) 
    return res.redirect('/manage'); 

  // if we don't have a ?success that's sent from tptapi
  if (!req.query.success)
    return res.redirect('http://tptapi.com/server_login.php?off_key='+G.TPTAPI_PUBLIC_KEY);

  // and if someone does have success but no token id
  else if (!req.query.token_id) 
    return res.send('Malformed response');

  // if we do then start cutting up the request
  // req.connection.remoteAddress is the IP address.
  // req.query.token_id is some token id passed by tptapi
  var shakeit = http.request({
    host: 'tptapi.com',
    port: 80,
    path: '/API_main.php?session_create&private_key=' + G.TPTAPI_PRIVATE_KEY + 
                                      '&session_id=' + req.query.token_id + 
                                      '&ip=' + req.connection.remoteAddress,
    method: 'GET'
    }, function(resp) {
        if (resp.statusCode != 200)
          return "Non-200 response";

        var data = ''; // ex. 200,4h2j1bqk5i6dxcy,
        resp.on('data', function(chunk) { data += chunk; });

        resp.on('end', function() {
          var responses = data.split(',');
          if (responses[0] != 200) 
            return res.send('TPTAPI response wasn\'t 200');

          req.session.key = responses[1]; 
          req.session.user = responses[2];
          console.log(responses);
        });

    });
  shakeit.on('error', function(err) {
    console.log(err.stack);
    return res.send('Error requesting TPTAPI');
  });
  shakeit.end();
};