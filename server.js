var WebSocketManager = require("./src/WebSocketManager.js");
var APIServer = require("./src/APIServer.js");
var WebSocketServer = require("./src/WebSocketServer.js");

var socketIOManager = new WebSocketManager();
var webSocketServer = new WebSocketServer(3000, socketIOManager);
webSocketServer.startServer();
var apiServer = new APIServer(3001, socketIOManager);
apiServer.startServer();

/*
var rabbitMQ = require('rabbit.js');
var context = rabbitMQ.createContext();
var pub = context.socket('PUB');
var sub = context.socket('SUB');

sub.on('data', function(note) {
  console.log("MSG: %s", note);
});

sub.connect('events');
pub.connect('events');
*/

/*context.on('ready', function() {



});*/

/*
console.log("A");
setTimeout(function() {
  pub.write('HELLO!');
}, 1000);
*/
