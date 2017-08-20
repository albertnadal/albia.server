
# albia.server

WebSockets server for Real Time Communication for the IoT

## How to use

```
$ npm install
$ protoc --js_out=import_style=commonjs,binary:. albia.proto
$ node server.js
```

## Features

- Manage multiple socket.io connections using dynamic namespaces.
