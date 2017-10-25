var Device = require("./models/Device.js");
var Account = require("./models/Account.js");

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

    this._server.listen(this._port, function() {
      console.log('API Server listening at port %d', self._port);
    });

  }

  stopServer() {

    this._server.close(function() {
      console.log('API Server stoped');
    });

  }

  initializeEndpoints() {

    var self = this;

    // GET /v1/request-device-token
    this._express.get('/v1/request-device-token', function(req, res) {

      var deviceKey = req.header('X-albia-device-key');
      var APIKey = req.header('X-albia-api-key');
      console.log("GET /v1/request-device-token deviceKey: " + deviceKey + " APIKey: " + APIKey);

      var device = new Device();
      device.initWithDeviceKey(deviceKey, function(keyIsValid) {

        if (keyIsValid) {

          res.writeHead(200, {
            'Content-Type': 'application/json'
          });
          var json = JSON.stringify({
            token: device.token
          });
          res.end(json);

        } else {

          // 401 Unauthorized response
          res.writeHead(401);
          res.end();

        }

      });



    });

    // GET /v1/request-namespace
    this._express.get('/v1/request-namespace', function(req, res) {

      var deviceToken = req.header('Authorization');
      console.log("GET /v1/request-namespace deviceToken: " + deviceToken);


      self.getNamespaceIdForDeviceWithToken(deviceToken, function(deviceTokenIsValid, namespace) {

        if (deviceTokenIsValid) {

          var socketIOnamespace = self._socketIOManager.loadNamespace(namespace);

          if ((socketIOnamespace == null) || (socketIOnamespace == undefined)) {

            // 500 Server error
            res.writeHead(500);
            res.end();

          } else {

            // 200 Success
            res.writeHead(200, {
              'Content-Type': 'application/json'
            });
            var json = JSON.stringify({
              namespace: namespace
            });
            res.end(json);

          }

        } else {

          // 401 Unauthorized response
          res.writeHead(401);
          res.end();
        }

      });


    });

    // GET /v1/request-device-id
    this._express.get('/v1/request-device-id', function(req, res) {

      var deviceKey = req.query.deviceKey;
      var deviceToken = req.header('Authorization');
      console.log("GET /v1/request-device-id deviceToken: " + deviceToken);

      self.getNamespaceIdForDeviceWithToken(deviceToken, function(deviceTokenIsValid, namespace) {

        if (deviceTokenIsValid) {
          Device.getDeviceIdWithDeviceKeyAndNamespace(deviceKey, namespace, function(deviceId) {
              // 200 Success
              res.writeHead(200, {
                'Content-Type': 'application/json'
              });
              var json = JSON.stringify({
                id: deviceId
              });
              res.end(json);
          });

        } else {

          // 401 Unauthorized response
          res.writeHead(401);
          res.end();
        }

      });


    });

  }

  getNamespaceIdForDeviceWithToken(deviceToken, callback) {
    var account = new Account();
    account.initWithDeviceToken(deviceToken, function(tokenIsValid) {
      callback(tokenIsValid, account.namespace);
    });
  }

};
