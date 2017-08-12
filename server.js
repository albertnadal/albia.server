var messages = require('./albia_pb');
var message = new messages.DeviceRecord();

var currentTimestampUTC = new messages.google.protobuf.Timestamp();
currentTimestampUTC.setSeconds(Math.floor((new Date()).getTime() / 1000)); // UNIX Timestamp in UTC

message.setKey('year');
message.setDate(currentTimestampUTC);
message.setType(messages.DeviceRecord.RecordType.INT32);
message.setInt32value(1981);

var serializedMessage = message.serializeBinary();
var messageReceived = messages.DeviceRecord.deserializeBinary(serializedMessage);
console.log("KEY: "+messageReceived.getKey()+" VALUE: "+messageReceived.getInt32value());

var SocketIONamespacesManager = require("./SocketIONamespacesManager.js");
var APIServer = require("./APIServer.js");
var WebSocketServer = require("./WebSocketServer.js");

var socketIOManager = new SocketIONamespacesManager();
var webSocketServer = new WebSocketServer(3000, socketIOManager);
webSocketServer.startServer();
var apiServer = new APIServer(3001, socketIOManager);
apiServer.startServer();
