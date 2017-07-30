module.exports = class APIServer {

  constructor(port, socketIOManager) {
    var bodyParser = require('body-parser');
    this._express = require('express')().use(bodyParser.json()).use(bodyParser.urlencoded({
      extended: true
    }));
    this._port = port;
    this._socketIOManager = socketIOManager;
    this._server = require('http').createServer(this._express);
    this.initializeEndpoints();
  }

  startServer() {
    this.stopServer();
    var self = this;

    this._server.listen(this._port, function () {
      console.log('API Server listening at port %d', self._port);
    });

  }

  stopServer() {

    this._server.close( function () {
      console.log('API Server stoped');
    });

  }

  initializeEndpoints() {

    // GET /v1/request-device-token
    this._express.get('/v1/request-device-token', function(req, res) {
      var deviceKey = req.header('X-albia-device-key');
      var APIKey = req.header('X-albia-api-key');
      console.log("GET /v1/request-device-token deviceKey: "+deviceKey+" APIKey: "+APIKey);

      res.writeHead(200, {'Content-Type': 'application/json'});
      var json = JSON.stringify({ token: "ABCDEFGHIJKLMNOPQ" });
      res.end(json);
    });

    // GET /v1/request-namespace
    this._express.get('/v1/request-namespace', function(req, res) {
      var deviceToken = req.header('X-albia-device-token');
      console.log("GET /v1/request-namespace deviceToken: "+deviceToken);

      res.writeHead(200, {'Content-Type': 'application/json'});
      var json = JSON.stringify({ namespace: "the-requested-namespace" });
      res.end(json);
    });

  }

};
