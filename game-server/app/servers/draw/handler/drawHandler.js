var drawRemote = require('../remote/drawRemote');

module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
	this.app = app;
};

var handler = Handler.prototype;

/**
 * Send messages to users
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param  {Function} next next stemp callback
 *
 */
handler.draw = function(msg, session, next) {
	var rid = session.get('rid');
	var username = session.uid.split('*')[0];
	var channelService = this.app.get('channelService');
	var param = {
    route: 'onDraw',
    x: msg.x,
    y: msg.y,
		id: username,
    drawing: msg.drawing
	};

	channel = channelService.getChannel(rid, false);

  channel.pushMessage(param);

	next(null, {
		route: msg.route
	});
};
