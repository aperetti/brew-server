
const stream = require('stream')
const Sensor = require('../models/Sensor')
const User = require('../models/User')
const _ = require('lodash')
module.exports = (express, mongoose, client) => {

  const router = express.Router()
  router.get('/sensor', getSensorData)
  router.post('/relay/toggle/:id', toggleRelay)
  router.post('/sensor/clear', clearSensorData)


  client.on('connect', () => {
    client.subscribe('/relay/status/#')
  })

  function toggleRelay(req, res) {
    var relay = req.params.id
    client.publish(`/relay/toggle`, relay)
    res.status(200).send('toggled')
  }
  function clearSensorData(req, res) {
    Sensor.remove({}, function (err) {
      if (err)
        return res.status(400)
      res.status(200).send('Cleared Sensor Data')
    })
  }

  function getSensorData(req, res) {
    var nobuffer = req.query.nobuffer ? true : false
    User.getSensorAliases(req.client, (err, aliases) => {
      if (err)
        return res.status(400)
      Sensor.find({}, '-_id').sort('time').exec((err, data) => {
        // GraphData Creation
        graphData = data.slice()
        graphData.map(o => Object.assign(o, { time: Math.round(o.time / 15000) * 15000 }))
        graphGroups = _.groupBy(graphData, o => o.time)
        var graphData = []
        _.forIn(graphGroups, (v, k) => graphData.push({ x: k, y: v }))
        _.sortBy(graphData, [(o) => o.time])

        // SensorData Creation
        var sensorGroups = _.groupBy(data, (o) => o.sensor)
        var sensorData = []
        _.forIn(sensorGroups, (v, k) => {
          var aliasIndex = _.findIndex(aliases, o => o.sensor === k)
          var alias = aliasIndex !== -1 ? aliases[aliasIndex].alias : null
          sensorData.push({
            sensor: k,
            runningTemp: nobuffer ? null : v,
            lastUpdate: _.nth(v, -1).time,
            temp: _.nth(v, -1).temp,
            alias: alias,
            targetTemp: null
          })
        })
        res.status(200).json(sensorData)
      })
    })
  }

  return router
}
