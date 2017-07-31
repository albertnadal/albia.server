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
      this.initializeNamespace(namespace);
      console.log("namespace "+namespaceId+" loaded");
      return namespace;
    }

    initializeNamespace(namespace) {

      var self = this;

      namespace.on('connection', function(socket) {

        self._countConnections++;

        console.log("New websocket connection.");
        console.log("Total connections: "+self._countConnections);

        socket.on('read', function () {
        });

        socket.on('write', function () {
        });

      });

    }

};
