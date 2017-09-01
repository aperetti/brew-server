const mqttMatch = require('mqtt-match')
const _ = require('lodash')
const Sensor = require('./models/Sensor')
const Kegs = require('./models/Kegs')
var sensorLog = []
var kegSensorBuffer = []

function consume(i, sensor) {
  bufferIndex = _.findIndex(kegSensorBuffer, (o) => o.sensor === sensor)
  if (bufferIndex === -1) {
    bufferIndex = kegSensorBuffer.push({ sensor: sensor, pullSize: 0, kegTimeOut: null }) - 1
  }
  keg = kegSensorBuffer[bufferIndex]
  keg.pullSize += 1
  clearTimeout(keg.kegTimeOut)
  keg.kegTimeOut = setTimeout(() => {
    kegIndex = _.findIndex(kegSensorBuffer, ['sensor', sensor])
    if (kegIndex !== -1) {
      keg = kegSensorBuffer[kegIndex]
      Kegs.findOneAndUpdate({ sensor: keg.sensor, kicked: null, tapped: { $ne: null } }, { $push: { "consumption": { date: new Date(), consumed: keg.pullSize } } }, { safe: true, upsert: false },
        (err, keg) => {
          if (err) console.log(err)
          console.log(keg)
        })
      kegSensorBuffer.splice(kegIndex, 1)
    }
  }, 10000)
}

module.exports = function(packet, client) {
  // Check for temperature sensor data and saves it in temporary mongo storage
  if (mqttMatch('/sensor/ds18b20/+', packet.topic)) {
    var m = {}

    m.sensor = packet.topic.split('/')[3]
    m.time = Date.now()
    m.temp = packet.payload.toString()
    var i = _.findIndex(sensorLog, (o) => o.sensor === m.sensor)
    if (i === -1 || m.time - sensorLog[i].time > 1000 * 15) {
      i === -1 ? sensorLog.push(m) : sensorLog[i] = m
      Sensor.create(m, (err, m) => {
        if (err) console.log('Could not save sensor measurement!')
      })
    }
    // Check if flow sensor is being triggered
  } else if (mqttMatch('/sensor/flow/+', packet.topic)) {
    var m = {}
    m.sensor = packet.topic.split('/')[3]
    m.time = Date.now()
    m.consume = packet.payload.toString()
    consume(i, m.sensor)
    Kegs.findOne({ sensor: m.sensor, kicked: null, tapped: { $ne: null } }, (err, keg) => {
      if (err || !keg) {
        return console.log('Could not find Keg or Error in Query', err)
      }
      if (!keg.used) {
        keg.used = 0
      }
      keg.used += m.consume / 128
      keg.save((err) => {
        if (err)
          console.log('Error updating Keg Consumptions')
      })
    })
  }

}
