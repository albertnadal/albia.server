var DB = require("./../Database.js");

module.exports = class Account {

  constructor() {
    this.namespace = null;
  }

  initWithDeviceToken(deviceToken, callback) {

    var self = this;
    DB.query('SELECT a.namespace AS namespace FROM account a, device d WHERE d.device_token = \''+deviceToken+'\' LIMIT 1', function(error, results, fields) {

      if(results) {
        self.namespace = results[0].namespace;

        // Device is valid
        callback(true);
      } else {
        // Device is invalid
        callback(false);
      }

    });

  }


};
