var DB = require("./../Database.js");

module.exports = class Device {

  constructor() {
    this.id_device = null;
    this.name = '';
    this.summary = '';
    this.key = null;
    this.token = null;
    this.submit_date = null;
    this.data_insert = null;
  }

  initWithDeviceKey(deviceKey, callback) {

    var self = this;
    DB.query('SELECT id_device AS id_device, name AS name, summary AS summary, device_key AS device_key, device_token AS device_token, submit_date AS submit_date, data_insert AS data_insert FROM device WHERE device_key = \''+deviceKey+'\' LIMIT 1', function(error, results, fields) {

      if(results) {
        self.id_device = results[0].id_device;
        self.name = results[0].name;
        self.summary = results[0].summary;
        self.key = results[0].device_key;
        self.token = results[0].device_token;
        self.submit_date = results[0].submit_date;
        self.data_insert = results[0].data_insert;

        // Device is valid
        callback(true);
      } else {
        // Device is invalid
        callback(false);
      }

    });

  }


};
