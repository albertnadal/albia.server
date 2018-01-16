var DB = require("./../Database.js");
var messages = require('../proto3/albia_pb');

module.exports = class DeviceRecord {

  constructor(_deviceRecordData) {
    this.id_device = _deviceRecordData.getDeviceid();
    this.key = _deviceRecordData.getKey();
    this.type = _deviceRecordData.getType();
    this.date = this.secondsToDate(_deviceRecordData.getDate().getSeconds());
    this.deviceRecordData = _deviceRecordData;
  }

  secondsToDate(secs) {
      var t = new Date(1970, 0, 1); // Epoch
      t.setSeconds(secs);
      return t;
  }

  save(callback) {

    let sqlValues = [this.id_device, this.key, this.type, this.date, null, null, null, null, null, null, null, null, null];

    switch(this.type) {
      case messages.DeviceRecordMsg.RecordType.DOUBLE: sqlValues[4] = this.deviceRecordData.getDoublevalue(); break;
      case messages.DeviceRecordMsg.RecordType.FLOAT: sqlValues[5] = this.deviceRecordData.getFloatvalue(); break;
      case messages.DeviceRecordMsg.RecordType.INT32: sqlValues[6] = this.deviceRecordData.getInt32value(); break;
      case messages.DeviceRecordMsg.RecordType.INT64: sqlValues[7] = this.deviceRecordData.getInt64value(); break;
      case messages.DeviceRecordMsg.RecordType.UINT32: sqlValues[8] = this.deviceRecordData.getUint32value(); break;
      case messages.DeviceRecordMsg.RecordType.UINT64: sqlValues[9] = this.deviceRecordData.getUint64value(); break;
      case messages.DeviceRecordMsg.RecordType.BOOL: sqlValues[10] = this.deviceRecordData.getBoolvalue(); break;
      case messages.DeviceRecordMsg.RecordType.STRING: sqlValues[11] = this.deviceRecordData.getStringvalue(); break;
      case messages.DeviceRecordMsg.RecordType.BYTES:  var uint8vector = this.deviceRecordData.getBytestringvalue();
						sqlValues[12] = new Buffer(uint8vector, "binary"); break;
    }


    DB.queryWithValues('INSERT INTO device_record(id_device, valueKey, valueType, valueDate, doubleValue, floatValue, int32Value, int64Value, uint32Value, uint64Value, boolValue, stringValue, byteStringValue) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', sqlValues, function(error, results, fields) {

      if(!error) {
        // Saved to DB success
        callback(true);
      } else {
        // Saved to DB failed
        callback(false);
      }

    });
  }

};
