var mysql = require('mysql');
var Config = require("./Configuration.js");

module.exports = {
  openConnection: openConnection,
  closeConnection: closeConnection,
  queryWithConnection: queryWithConnection,
  query: query
};

function openConnection() {
  var connection = mysql.createConnection(Config.database);
  connection.connect();
  return connection;
}

function closeConnection(connection) {
  connection.end();
}

function queryWithConnection(sql, connection, callback) {
  connection.query(sql, function(error, results, fields) {
    callback(error, results, fields);
  });
}

function query(sql, callback) {
  var connection = openConnection();
  queryWithConnection(sql, connection, callback);
  closeConnection(connection);
}
