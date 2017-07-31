module.exports = class WebSocketServer {

  constructor(port, socketIOManager) {
    var bodyParser = require('body-parser');
    this._express = require('express')().use(bodyParser.json()).use(bodyParser.urlencoded({
      extended: true
    }));
    this._port = port;
    this._socketIOManager = socketIOManager;
    this._server = require('http').createServer(this._express);
    this._socketIOManager.initializeWithServer(this._server);
  }

  startServer() {
    this.stopServer();
    var self = this;

    this._server.listen(this._port, function () {
      console.log('WebSocket server listening at port %d', self._port);
    });

  }

  stopServer() {

    this._server.close( function () {
      console.log('WebSocket server stoped');
    });

  }

};
