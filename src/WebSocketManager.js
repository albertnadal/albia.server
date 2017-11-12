var protobuffer = require('./proto3/albia_pb');
var DeviceRecord = require('./models/DeviceRecord');
var DeviceEvent = require('./models/DeviceEvent');
var amqp = require('amqplib/callback_api');
var atob = require('atob');

module.exports = class WebSocketManager {

    constructor(){
        this._activeNamespaces = {};
        this._countConnections = 0;
        this._amqpConnection = null;

        amqp.connect('amqp://localhost', (function(err, amqpConnection) {
          if (err != null) return;
          this._amqpConnection = amqpConnection;
        }).bind(this));
    }

    initializeWithServer(server) {
      this._server = server;
      this._io = require('socket.io')(this._server, { path: '/' , serveClient: false, wsEngine: 'ws', transports: ['websocket'] });
    }

    namespaceIsValid(namespaceId) {
      // SEARCH FOR VALID namespaceId IN DATABASE
      return true;
    }

    namespaceIsLoaded(namespaceId) {
      return namespaceId in this._activeNamespaces;
    }

    loadNamespace(namespaceId) {

      if(!this.namespaceIsValid(namespaceId)) {
        // Invalid namespace
        return null;
      }

      if(this.namespaceIsLoaded(namespaceId)) {
        console.log("namespace "+namespaceId+" already loaded");
        return this._activeNamespaces[namespaceId]['namespace'];
      }

      var namespace = this._io.of('/v1/'+namespaceId);
      var namespaceDeviceSockets = {};

      this._activeNamespaces[namespaceId] = {};
      this._activeNamespaces[namespaceId]['namespace'] = namespace;
      this._activeNamespaces[namespaceId]['sockets'] = namespaceDeviceSockets;

      this.initializeNamespace(namespace, namespaceId, namespaceDeviceSockets, this._amqpConnection);

      return namespace;
    }

    initializeNamespace(namespace, namespaceId, namespaceDeviceSockets, amqpConnection) {

      var self = this;

      namespace.on('connection', function(socket) {

        var deviceToken = socket.request.headers.authorization;

        console.log("Device connection attempt. Token: "+deviceToken+" Namespace: "+namespaceId);

        if(self.deviceTokenIsValid(deviceToken, namespaceId)) {

          self._countConnections++;

          var deviceId = self.getDeviceIdFromDeviceToken(deviceToken).toString();
          var deviceQueueName = namespaceId+'-'+deviceId;

          namespaceDeviceSockets[deviceId] = socket;

          // Create channel to listen for next message queued in the device queue
          amqpConnection.createChannel(function(err, channel) {
            if(err == null) {
              channel.assertQueue(deviceQueueName);
              channel.consume(deviceQueueName, function(msg) {
                if (msg !== null) {
                  socket.emit('event', msg.content);
                  channel.ack(msg);
                }
              });
            }
          });
/*
          deviceMQSubscriber.on('data', function(msg, ack()) {
            let deviceEvent = new DeviceEvent(protobuffer.DeviceEventMsg.deserializeBinary(msg));
            let targetDeviceId = deviceEvent.getTargetDeviceId().toString();

            console.log("RECEIVED MSG FROM QUEUE VALUE: " + deviceEvent.getData());

            let targetDeviceSocket = namespaceDeviceSockets[targetDeviceId];
            targetDeviceSocket.emit('event', msg);
            console.log("EVENT EMITED");

            ack();
          });
*/
          console.log("Device "+deviceId+" connected.");
          console.log("Active connections: "+self._countConnections);

          socket.on('read', function () {
          });

          socket.on('write', function (data) {
            console.log('WRITE: ');
            console.log(data);

            var deviceRecord = new DeviceRecord(protobuffer.DeviceRecordMsg.deserializeBinary(data));
            deviceRecord.save(function(success) {
              console.log("Record saved: "+success);
            });

          });

          socket.on('event', function (data) {
            let deviceEvent = new DeviceEvent(protobuffer.DeviceEventMsg.deserializeBinary(data));
            let targetDeviceId = deviceEvent.getTargetDeviceId().toString();

            // Send the event to the queue of the target device
            amqpConnection.createChannel(function(err, channel) {
              if (err == null) {
                channel.assertQueue(namespaceId+'-'+targetDeviceId);
                channel.sendToQueue(namespaceId+'-'+targetDeviceId, data);
              }
            });

          });


          socket.on('disconnect', function () {

            self._countConnections--;
            let deviceToken = socket.request.headers.authorization;
            let deviceId = self.getDeviceIdFromDeviceToken(deviceToken).toString();
            if(deviceId in namespaceDeviceSockets) {
              delete namespaceDeviceSockets[deviceId];
            }

            console.log("Device "+deviceId+" disconnected.");
            console.log("Active connections: "+self._countConnections);
          });

        } else {

          console.log("Invalid device connection attempt.");
          console.log("Closing connection.");
          socket.disconnect(true);
        }


      });

    }

    deviceTokenIsValid(deviceToken, namespaceId) {

      if((deviceToken == undefined) || (deviceToken == null)) {
        return false;
      }

      // SEARCH FOR VALID token IN namespace SCOPE IN DATABASE
      return true;
    }

    getDeviceIdFromDeviceToken(deviceToken) {
      let tokenArray = atob(deviceToken).split(";");
      return tokenArray[0];
    }
};
