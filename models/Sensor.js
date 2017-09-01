var mongoose = require('mongoose')
var Schema = mongoose.Schema

var SensorSchema = new Schema({
  time: Number,
  temp: Number,
  sensor: String
}, {
  toObject: { getters: true },
  toJSON: { getters: true }
})

var Sensor = mongoose.model('Sensor', SensorSchema)
module.exports = Sensor
