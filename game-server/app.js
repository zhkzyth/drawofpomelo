var pomelo = require('pomelo');
var dispatcher = require('./app/util/dispatcher');

// route definition for chat server
var drawRoute= function(session, msg, app, cb) {

  console.log("before route");

  var drawServers = app.getServersByType('draw');

	if(!drawServers || drawServers.length === 0) {
		cb(new Error('can not find draw servers.'));
		return;
	}

	var res = dispatcher.dispatch(session.get('rid'), drawServers);

  console.log("get the res");

	cb(null, res.id);
};

/*
 * Init app for client.
 */
var app = pomelo.createApp();
app.set('name', 'drawdemo');

// app configuration
app.configure('production|development', 'connector', function(){
	app.set('connectorConfig',
		      {
			      connector : pomelo.connectors.hybridconnector,
			      heartbeat : 3
		      });
});

app.configure('production|development', 'gate', function(){
	app.set('connectorConfig',
		      {
			      connector : pomelo.connectors.hybridconnector,
			      // useProtobuf : true
		      });
});

// app configure
app.configure('production|development', function() {
	// route configures
	app.route('draw', drawRoute);
});

// start app
app.start();

process.on('uncaughtException', function(err) {
	console.error(' Caught exception: ' + err.stack);
});
