const express = require('express')
const mosca = require('mosca')
const mqttRouter = require('./mqttRouter')
const mqtt = require('mqtt')
const user = require('./config').defaultUser
const app = express()
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const mongoose = require('mongoose')
const config = require('./config')
const init = require('./init')
const CronJob = require('cron').CronJob;
const Sensor = require('./models/Sensor')
const _ = require('lodash')

mongoose.connect('mongodb://localhost/brew')
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB')
  init(app)
})

// App Variables
app.set('apiSecret', config.secret)
app.all('*', function(req, res, next){
  if (!req.get('Origin')) return next();

  console.log(req.headers)
  next()
})
// App Middleware
app.use(express.static('static/dist'))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(fileUpload())
app.use(function(error, req, res, next) {
  if (error instanceof SyntaxError) {
    res.status(400).json({ error: 'Malformed Request - See Body', res: error }).send()
  } else {
    next();
  }
})

var ascoltatore = {
  type: 'mongo',
  url: 'mongodb://localhost:27017/mqtt',
  pubsubCollection: 'ascoltatori',
  mongo: {}
}
console.log(__dirname)
var settings = {
  port: 9094,
  https: {
      port: 9095,
      static: "./",
      bundle: true
  },
  secure: {
      port: 9093,
      keyPath: "/etc/letsencrypt/live/brew.photoredux.com/privkey.pem",
      certPath: "/etc/letsencrypt/live/brew.photoredux.com/fullchain.pem"
  },
  backend: ascoltatore,
  persistance: {
    url: 'mongodb://localhost:27017/mosca',
    factory: mosca.persistence.Mongo
  }
}

var mqServer = new mosca.Server(settings)
mqServer.on('ready', () => {
  mqServer.authenticate = (client, user, pass, cb) => {
    var authorized = (user === config.defaultUser.username && pass.toString() === config.defaultUser.password)
    if (authorized) {
      client.user = user
    }
    cb(null, true)
  }
  mqServer.authorizeSubscribe = (client, topic, cb) => cb(null, true)
  mqServer.authorizePublish = (client, topic, payload, cb) => {
    cb(null, client.user === config.defaultUser.username)
  }
  
  // Setting up client connection to sensor data
  var client = mqtt.connect(
    'mqtts://brew.photoredux.com:9093', {
      clientId: 'Server',
      username: user.username,
      password: user.password,
      protocolId: 'MQIsdp',
      protocolVersion: 3,
      keepalive: 30000
    }
  )


    // Routes
  const authRoute = require('./routes/auth')(express, app)
  app.get('/test', (req, res) => {
    res.status(200).send('Hello!')
  })
  app.use('/auth', authRoute)
  // Route Middleware Need to be logged in
  app.use(require('./authenticate')(app))
  const brewRoute = require('./routes/brew')(express, app, client)
  app.use('/brew', brewRoute)
  const monitorRoute = require('./routes/monitor')(express, app, client)
  app.use('/monitor', monitorRoute)
  const userRoute = require('./routes/user')(express, app)
  app.use('/user', userRoute)
  const kegsRoute = require('./routes/kegs')(express, app)
  app.use('/kegs', kegsRoute)
  app.listen(9092, function() {
    console.log('Serving HTTP')
  })

})
mqServer.on('clientConnected', function(client) {
  console.log('client connected', client.id)
})

mqServer.on('published', mqttRouter)

// Only keeps the last 60 minutes of temperature sensor data
Sensor.find({time: {$lt: Date.now() - 1000*60*60}}).remove((err, removed) => {
  console.log('removed ', removed)
})
var saveSensorData = new CronJob('')
var sensorBufferCleanup = new CronJob('00 * * * * *', () => {
  Sensor.find({time: {$lt: Date.now() - 1000*60*60}}).remove().exec()
}, null, true, 'America/Los_Angeles')