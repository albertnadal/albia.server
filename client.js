const io = require('socket.io-client');

var socket = io('ws://localhost:3000/v1', { transports: ['websocket'], forceNew: true });
socket.compress(true);
