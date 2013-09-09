
var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);              // View the project index

app.get('/view/:scriptID', routes.view); // View a script with a cute page
app.get('/raw/:scriptID', routes.raw);   // Request the raw data
app.get('/meta/:scriptID', routes.meta); // Request metadata only

app.get('/list/', routes.list);          // View a script list prettily
app.get('/list/raw', routes.rawlist);    // Raw format of the list


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
