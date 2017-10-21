var WebSocketManager = require("./src/WebSocketManager.js");
var APIServer = require("./src/APIServer.js");
var WebSocketServer = require("./src/WebSocketServer.js");

var socketIOManager = new WebSocketManager();
var webSocketServer = new WebSocketServer(3000, socketIOManager);
webSocketServer.startServer();
var apiServer = new APIServer(3001, socketIOManager);
apiServer.startServer();
