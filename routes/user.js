module.exports = (express, mongoose) => {
  const User = require('./../models/User')
  const router = express.Router()
  const _ = require('lodash')
  router.get('/status', getLoggedStatus)
  router.post('/sensor_aliases', setSensorAliases)

  function getLoggedStatus(req, res) {
    res.status(200).send()
  }

  function setSensorAliases(req, res) {
    var aliases = req.body
    console.log(aliases)
    return User.findOne({ username: req.client }, (err, user) => {
      if (err) {
        return res.status(400)
      }
      aliases.map(sensor => {
        if (!user.sensors) {
          user.sensors = []
        }
        var idx = _.findIndex(user.sensors, (o) => o.sensor === sensor.sensor)
        if (idx === -1) {
          user.sensors.push(sensor)
        } else {
          user.sensors[idx].alias = sensor.alias
        }
      })
      console.log('attempting save')
      user.save((err) => {
        if (err) {
          return res.status(400)
        } else {
          return res.status(200).send('Updated Aliases')
        }
      })
    })
  }
  return router
}
