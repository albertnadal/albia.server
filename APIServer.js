module.exports = class APIServer {

  constructor(port, socketIOManager) {
    var bodyParser = require('body-parser');
    this._express = require('express')().use(bodyParser.json()).use(bodyParser.urlencoded({
      extended: true
    }));
    this._port = port;
    this._socketIOManager = socketIOManager;
    this._server = require('http').createServer(this._express);
  }

  startServer() {
    this.stopServer();
    var self = this;

    this._server.listen(this._port, function () {
      console.log('API Server listening at port %d', self._port);
    });

    this._express.post('/v1/request-device-token', function(req, res) {
      console.log(req.body);
    /*
      var deviceKey = req.body.deviceKey,
      var APIKey = req.body.APIKey;
    */
      res.writeHead(200, {'Content-Type': 'application/json'});
      var json = JSON.stringify({ token: "ABCDEFGHIJKLMNOPQ" });
      res.end(json);
    });

  }

  stopServer() {
  }

};
