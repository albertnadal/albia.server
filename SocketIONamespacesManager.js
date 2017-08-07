module.exports = class SocketIONamespacesManager {

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
        return this._activeNamespaces[namespaceId];
      }

      var namespace = this._io.of('/v1/'+namespaceId);
      this._activeNamespaces[namespaceId] = namespace;
      this.initializeNamespace(namespace, namespaceId);
      console.log("namespace "+namespaceId+" loaded");
      return namespace;
    }

    initializeNamespace(namespace, namespaceId) {

      var self = this;

      namespace.on('connection', function(socket) {

        var deviceToken = socket.request.headers.authorization;

        console.log("Web socket connection attempt. Token: "+deviceToken+" Namespace: "+namespaceId);

        if(self.deviceTokenIsValid(deviceToken, namespaceId)) {

          self._countConnections++;

          console.log("New websocket connection.");
          console.log("Total connections: "+self._countConnections);

          socket.on('read', function () {
          });

          socket.on('write', function (data) {
            var obj = JSON.parse(data);
            console.log("OBJECT:");
            console.log(obj);
          });

          socket.on('disconnect', function () {

            self._countConnections--;
            console.log("Websocket disconnected.");
            console.log("Total connections: "+self._countConnections);

          });

        } else {

          console.log("Invalid websocket connection attempt.");
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

};
