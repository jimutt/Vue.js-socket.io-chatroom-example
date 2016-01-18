var express = require('express');
var app = express();
var server = require('http').Server(app);
var ChatServer = require('./chatServer');
var io = require('socket.io')(server);

server.listen(1338);

var chat = new ChatServer(io, 100);
chat.start();

app.use(express.static('public'));
