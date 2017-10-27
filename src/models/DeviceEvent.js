var DB = require("./../Database.js");
var messages = require('../proto3/albia_pb');

module.exports = class DeviceEvent {

  constructor(_deviceEventData) {
    this.action = _deviceEventData.getAction();
    this.id_device = _deviceEventData.getDeviceid();
    this.id_target_device = _deviceEventData.getTargetdeviceid();
    this.data = _deviceEventData.getData();
    this.date = this.secondsToDate(_deviceEventData.getDate().getSeconds());
  }

  secondsToDate(secs) {
      var t = new Date(1970, 0, 1); // Epoch
      t.setSeconds(secs);
      return t;
  }

  getTargetDeviceId() {
    return this.id_target_device;
  }

};
