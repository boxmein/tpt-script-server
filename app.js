
var express = require('express')
  , routes = require('./routes/index.js')
  , manage = require('./routes/manage.js') 
  , tptapi = require('./routes/tptapi.js')
  , G = require('./routes/globals.js')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.favicon(__dirname + '/public/favicon.ico'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());

app.use(express.cookieParser());
app.use(express.session({secret: 'No flag? Goes in the bag! Red flag? RUN.'}));

app.use(app.router);


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);              // View the project index

app.get('/view/:scriptID', routes.view); // View a script with a cute page
app.get('/raw/:scriptID', routes.raw);   // Request the raw data
app.get('/meta/:scriptID', routes.meta); // Request metadata only

app.get('/list', routes.list);           // View a script list prettily
app.get('/list/raw', routes.rawlist);    // Raw format of the list

app.get('/manage', manage.manage);       // Manage script->save assocs
app.post('/manage/add/post', manage.post_addassoc); // Add a new assoc
app.post('/manage/rm/post', manage.post_rmassoc); // Remove assoc
app.get('/assocs/:id', manage.get_assocdata); // Get assoc element

app.get('/login', tptapi.login); // Manage tptapi login
app.get('/logout', tptapi.logout); // Manage logouts

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
