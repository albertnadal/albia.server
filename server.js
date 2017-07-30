var WebSocketNamespacesManager = require("./WebSocketNamespacesManager.js");
var webSocketManager = new WebSocketNamespacesManager("HOLA");

var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var apiserver = require('http').createServer(app);
var apiport = 3001;

apiserver.listen(apiport, function () {
  console.log('API Server listening at port %d', apiport);
});


var wsserver = require('http').createServer(app);
var io = require('socket.io')(wsserver, { path: '/' , serveClient: false, wsEngine: 'ws', transports: ['websocket'] });
var wsport = 3000;

wsserver.listen(wsport, function () {
  console.log('WebSocket Server listening at port %d', wsport);
});

app.post('/v1/request-device-token', function(req, res) {
  console.log(req.body);
/*
  var deviceKey = req.body.deviceKey,
  var APIKey = req.body.APIKey;
*/
  res.writeHead(200, {'Content-Type': 'application/json'});
  var json = JSON.stringify({ token: "ABCDEFGHIJKLMNOPQ" });
  res.end(json);
});


var numConnections = 0;
var namespaceV1 = io.of('/v1');

namespaceV1.on('connection', function (socket) {

  console.log("New socket connection.");

  socket.on('add', function (username) {
    ++numConnections;
  });

  socket.on('remove', function () {
      --numConnections;
  });

});
