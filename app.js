var express = require('express'),
	
	app  = new express(),
	
	server  = require('http').createServer(app).listen(8080),
	
	io = require('socket.io').listen(server),
	game  = require('./game_data.js'),
	ejs = require('ejs'),
	path = require('path');


	app.set('view engine', 'ejs');
	app.use(express.static(path.join(__dirname,'public')));
	io.set('log level',2);
	app.get('/' , function(req,res){
		res.render(__dirname + '/public/index.ejs');

	});

	io.sockets.on('connection',function(socket){

		console.log('client Connected ...');
		


		game.init(io,socket);

		

	});



