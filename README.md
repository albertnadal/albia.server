
# albia.server

WebSockets server for Real Time Communication for the IoT

## Install and run

```
$ git clone https://github.com/albiasoft/albia.server.git
$ cd albia.server
$ npm install
$ protoc --js_out=import_style=commonjs,binary:. src/proto3/albia.proto src/proto3/timestamp.proto
$ docker run -d --hostname my-rabbit --name some-rabbit -p 5672:5672 -p 15672:15672 rabbitmq:3-management
$ node server.js
```

## Features

- Manage multiple socket.io connections using dynamic namespaces.
