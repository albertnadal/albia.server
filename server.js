var SocketIONamespacesManager = require("./SocketIONamespacesManager.js");
var APIServer = require("./APIServer.js");
var WebSocketServer = require("./WebSocketServer.js");

var socketIOManager = new SocketIONamespacesManager();
var webSocketServer = new WebSocketServer(3000, socketIOManager).startServer();
var apiServer = new APIServer(3001, socketIOManager).startServer();
