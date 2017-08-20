var WebSocketManager = require("./WebSocketManager.js");
var APIServer = require("./APIServer.js");
var WebSocketServer = require("./WebSocketServer.js");

var socketIOManager = new WebSocketManager();
var webSocketServer = new WebSocketServer(3000, socketIOManager);
webSocketServer.startServer();
var apiServer = new APIServer(3001, socketIOManager);
apiServer.startServer();
