var protobuffer = require('./proto3/albia_pb');
var DeviceRecord = require('./models/DeviceRecord');
var DeviceEvent = require('./models/DeviceEvent');
var rabbitMQ = require('rabbit.js');
var atob = require('atob');

module.exports = class WebSocketManager {

    constructor(){
        this._activeNamespaces = {};
        this._countConnections = 0;
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
      var MQContext = rabbitMQ.createContext();
      var namespaceDeviceSockets = {};
      var namespaceDeviceMQPublishersSubscribers = {};
      this._activeNamespaces[namespaceId] = {};
      this._activeNamespaces[namespaceId]['namespace'] = namespace;
      this._activeNamespaces[namespaceId]['sockets'] = namespaceDeviceSockets;
      this._activeNamespaces[namespaceId]['mqcontext'] = MQContext;
      this._activeNamespaces[namespaceId]['mqpubssubs'] = namespaceDeviceMQPublishersSubscribers;
      this.initializeNamespace(namespace, namespaceId, namespaceDeviceSockets, MQContext, namespaceDeviceMQPublishersSubscribers);
      console.log("namespace "+namespaceId+" loaded");
      return namespace;
    }

    initializeNamespace(namespace, namespaceId, namespaceDeviceSockets, MQContext, namespaceDeviceMQPubSub) {

      var self = this;

      namespace.on('connection', function(socket) {

        var deviceToken = socket.request.headers.authorization;

        console.log("Device connection attempt. Token: "+deviceToken+" Namespace: "+namespaceId);

        if(self.deviceTokenIsValid(deviceToken, namespaceId)) {

          self._countConnections++;

          var deviceId = self.getDeviceIdFromDeviceToken(deviceToken).toString();
          var deviceMQPublisher = MQContext.socket('PUB');
          var deviceMQSubscriber = MQContext.socket('SUB');
          var MQName = namespaceId+'-'+deviceId;

          deviceMQSubscriber.connect(MQName);

          namespaceDeviceSockets[deviceId] = socket;
          namespaceDeviceMQPubSub[deviceId] = {};
          namespaceDeviceMQPubSub[deviceId]['pub'] = deviceMQPublisher;
          namespaceDeviceMQPubSub[deviceId]['sub'] = deviceMQSubscriber;

          deviceMQSubscriber.on('data', function(msg, ack()) {
            let deviceEvent = new DeviceEvent(protobuffer.DeviceEventMsg.deserializeBinary(msg));
            let targetDeviceId = deviceEvent.getTargetDeviceId().toString();

            console.log("RECEIVED MSG FROM QUEUE VALUE: " + deviceEvent.getData());

            let targetDeviceSocket = namespaceDeviceSockets[targetDeviceId];
            targetDeviceSocket.emit('event', msg);
            console.log("EVENT EMITED");

            ack();
          });

          console.log("New device connected. ID: "+deviceId);
          console.log("Total connections: "+self._countConnections);

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
            console.log(' >> EVENT FROM CLIENT');
//            console.log(data);

            let deviceEvent = new DeviceEvent(protobuffer.DeviceEventMsg.deserializeBinary(data));
            let targetDeviceId = deviceEvent.getTargetDeviceId().toString();

//            console.log("TARGET DEVICE ID: "+targetDeviceId);
/*
            if(targetDeviceId in namespaceDeviceSockets) {
              console.log("TARGET SOCKET FOUND");
              let targetDeviceSocket = namespaceDeviceSockets[targetDeviceId];
              targetDeviceSocket.emit('event', data);
              console.log("EVENT EMITED");
            } else {*/
//              console.log("TARGET SOCKET NOT FOUND");
//              console.log("TARGET ADDRESS: "+namespaceId+'-'+targetDeviceId);
              namespaceDeviceMQPubSub[deviceId]['pub'].connect(namespaceId+'-'+targetDeviceId, function() {
                console.log("WRITE");
                namespaceDeviceMQPubSub[deviceId]['pub'].write(data);
              });
//              console.log("EVENT QUEUED");
/*            }*/
          });


          socket.on('disconnect', function () {

            self._countConnections--;
            let deviceToken = socket.request.headers.authorization;
            let deviceId = self.getDeviceIdFromDeviceToken(deviceToken).toString();
            if(deviceId in namespaceDeviceSockets) {
              delete namespaceDeviceSockets[deviceId];
            }

            console.log("Device disconnected.");
            console.log("Total connections: "+self._countConnections);
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
