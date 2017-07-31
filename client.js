const io = require('socket.io-client');

var socket = io('ws://localhost:3000/v1/namespace1234', {
  extraHeaders: {
    Authorization: "token1234"
  },
  transports: ['websocket'],
  forceNew: true
});
socket.compress(true);
