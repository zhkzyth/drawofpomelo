(function(){

//locaol area vars
var pomelo = window.pomelo;
var username;
var rid;

var doc = $(document),
		win = $(window),
		canvas = $('#paper'),
		ctx = canvas[0].getContext('2d'),
		instructions = $('#instructions');

// A flag for drawing activity
var drawing = false;

var clients = {};
var cursors = {};

var lastEmit = $.now();

// draw logic part
var prev = {};


//-------helper funcs
// show login panel
function showLogin() {
	$("#loginView").show();
	$("#drawPanel").hide();
};

// show draw panel
function showDrawBoard() {
	$("#loginView").hide();
  $("#drawPanel").show();
};

// query connector
function queryEntry(uid, callback) {
	var route = 'gate.gateHandler.queryEntry';
	pomelo.init({
		host: window.location.hostname,
		port: 3014,
		log: true
	}, function() {
		pomelo.request(route, {
			uid: uid
		}, function(data) {
			pomelo.disconnect();
			if(data.code === 500) {
        console.error("500 error");
				// showError(LOGIN_ERROR);
				return;
			}
			callback(data.host, data.port);
		});
	});
};
//---------end of helper funcs


$(document).ready(function() {

  //deal with login button click.
	$("#login").click(function() {
		username = $("#loginUser").attr("value");
		rid = $('#channelList').attr("value");

	  //query entry of connection
		queryEntry(username, function(host, port) {
			pomelo.init({
				host: host,
				port: port,
				log: true
			}, function() {
        console.log("try to connect");
				var route = "connector.entryHandler.enter";
				pomelo.request(route, {
					username: username,
					rid: rid
				}, function(data) {
					if(data.error) {
            console.log("login error.");
						// showError(DUPLICATE_ERROR);
						return;
					}
          //TODO
          console.log("login success");
					showDrawBoard();
				});
			});
		});
	});

  //wait moving msg from server.
	pomelo.on('onDraw', function(data) {


    if(data.id == username){
      console.log("opps.no need to broadcast myself....");
      return;
		}



		if(!(data.id in clients)){
      console.log("uid not on add before.Simply ingore it.");
      return;
		}

		// Move the mouse pointer
		cursors[data.id].css({
			left : data.x,
			top : data.y
		});

		// Is the user drawing?
		if(data.drawing && clients[data.id]){
			// Draw a line on the canvas. clients[data.id] holds
			// the previous position of this user's mouse pointer
			drawLine(clients[data.id].x, clients[data.id].y, data.x, data.y);
		}

    clients[data.id] = data;
		clients[data.id].updated = $.now();

	});

	//update user list
	pomelo.on('onAdd', function(data) {

    console.log("we get a new user:"+data.id);

    // a new user has come online.simply ingore it.
		cursors[data.id] = $('<div class="cursor">').appendTo('#cursors');

    // Saving the current client state
		clients[data.id] = data;
		clients[data.id].updated = $.now();

	});

	//update user list
	pomelo.on('onLeave', function(data) {
		var id = data.user;

    if(!(id in clients)){
      console.log("uid not in.no need to delete");
      return;
    }

    cursors[id].remove();
    delete clients[id];
		delete cursors[id];

    console.log("bye~we just lost a friend...=(");
  });


	//handle disconect message, occours when the client is disconnect with servers
	pomelo.on('disconnect', function(reason) {
    //TODO
		showLogin();
	});

	canvas.on('mousedown',function(e){
		e.preventDefault();
		drawing = true;
		prev.x = e.pageX;
		prev.y = e.pageY;

		// Hide the instructions
		instructions.fadeOut();
	});

	canvas.bind('mouseup mouseleave',function(){
		drawing = false;
	});

	canvas.on('mousemove',function(e){
		if($.now() - lastEmit > 30){

      //deal with chat mode.
		  var route = "draw.drawHandler.draw";
			pomelo.request(route, {
        x: e.pageX,
        y: e.pageY,
        drawing: drawing,
        id: username
			}, function(data) {
        //TODO move out ??
		    // Draw a line for the current user's movement
		    if(drawing){

			    drawLine(prev.x, prev.y, e.pageX, e.pageY);

			    prev.x = e.pageX;
			    prev.y = e.pageY;
		    }
			});

      lastemit = $.now();
		}
  });

	// Remove inactive clients after 10 seconds of inactivity
	setInterval(function(){

		for(ident in clients){
			if($.now() - clients[ident].updated > 10000){

				// Last update was more than 10 seconds ago.
				// This user has probably closed the page

				cursors[ident].remove();
				delete clients[ident];
				delete cursors[ident];
			}
		}

	},10000);

	function drawLine(fromx, fromy, tox, toy){
		ctx.moveTo(fromx, fromy);
		ctx.lineTo(tox, toy);
		ctx.stroke();
	}

});

})();
