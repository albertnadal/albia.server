module.exports = class WebSocketServer {

  constructor(port, socketIOManager) {
    var bodyParser = require('body-parser');
    this._express = require('express')().use(bodyParser.json()).use(bodyParser.urlencoded({
      extended: true
    }));
    this._port = port;
    this._socketIOManager = socketIOManager;
    this._server = require('http').createServer(this._express);
    this._io = require('socket.io')(this._server, { path: '/' , serveClient: false, wsEngine: 'ws', transports: ['websocket'] });
  }

  startServer() {
    this.stopServer();
    var self = this;

    this._server.listen(this._port, function () {
      console.log('WebSocket Server listening at port %d', self._port);
    });

    var numConnections = 0;
    var namespaceV1 = this._io.of('/v1');

    namespaceV1.on('connection', function (socket) {

      console.log("New socket connection.");

      socket.on('add', function (username) {
        ++numConnections;
      });

      socket.on('remove', function () {
          --numConnections;
      });

    });

  }

  stopServer() {
  }

};
