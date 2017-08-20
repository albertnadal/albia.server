const io = require('socket.io-client');
var http = require("http");
var protobuffer = require('./albia_pb');

connectWithCretendials('localhost', 3001, 3000, 'key1234', 'app1234', function(invalidResponseCode) {
    console.log("HTTP GET Error code: "+invalidResponseCode);
});

function connectWithCretendials(host, port, wsport, deviceKey, apiKey, onError) {

  var options = {
      host: host,
      port: port,
      path: '/v1/request-device-token',
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
          'X-albia-device-key': deviceKey,
          'X-albia-api-key': apiKey
      }
  };

  var req = http.request(options, function(res) {

      var output = '';
      res.setEncoding('utf8');

      res.on('data', function (chunk) {
          output += chunk;
      });

      res.on('end', function() {
          var httpResponseCode = res.statusCode;
          if(httpResponseCode == 200) {

            var obj = JSON.parse(output);
            var token = obj.token;
            console.log("TOKEN: "+token);
            connectWithToken(host, port, wsport, token, onError);

          } else {
            onError(httpResponseCode);
          }

      });
  });

  req.on('error', function(err) {
      console.log("HTTP GET Error");
  });

  req.end();

}

function connectWithToken(host, port, wsport, token, onError) {

  var options = {
      host: host,
      port: port,
      path: '/v1/request-namespace',
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': token
      }
  };

  var req = http.request(options, function(res)
  {
      var output = '';
      res.setEncoding('utf8');

      res.on('data', function (chunk) {
          output += chunk;
      });

      res.on('end', function() {

          var httpResponseCode = res.statusCode;
          if(httpResponseCode == 200) {

            var obj = JSON.parse(output);
            var namespace = obj.namespace;
            console.log("NAMESPACE: "+namespace);
            openWebSocketWithTokenAndNamespace(host, wsport, token, namespace)

          } else {
            onError(httpResponseCode);
          }

      });
  });

  req.on('error', function(err) {
      console.log("HTTP GET Error");
  });

  req.end();

}

function openWebSocketWithTokenAndNamespace(host, wsport, token, namespace) {

  var socket = io('ws://'+host+':'+wsport+'/v1/'+namespace, {
    extraHeaders: {
      Authorization: token
    },
    transports: ['websocket'],
    forceNew: true
  });
  socket.compress(true);

  var currentTimestampUTC = new protobuffer.google.protobuf.Timestamp();
  currentTimestampUTC.setSeconds(Math.floor((new Date()).getTime() / 1000)); // UNIX Timestamp in UTC

  var buffer = new Buffer(token, 'base64');
  var tokenArray = buffer.toString().split(";");
  var deviceId = (tokenArray.length) ? parseInt(tokenArray[0]) : 0;

  var message = new protobuffer.DeviceRecord();
  message.setDeviceid(deviceId);
  message.setKey('year');
  message.setDate(currentTimestampUTC);
  message.setType(protobuffer.DeviceRecord.RecordType.INT32);
  message.setInt32value(1981);

  socket.emit('write', toArrayBuffer(message.serializeBinary()));
}

function toArrayBuffer(buffer) {
    var ab = new ArrayBuffer(buffer.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return ab;
}
