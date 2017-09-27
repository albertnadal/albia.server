
# albia.server

WebSockets server for Real Time Communication for the IoT

## Install and run

```
$ git clone https://github.com/albiasoft/albia.server.git
$ cd albia.server
$ npm install
$ protoc --js_out=import_style=commonjs,binary:. src/proto3/albia.proto src/proto3/timestamp.proto
$ node server.js
```

## Features

- Manage multiple socket.io connections using dynamic namespaces.
