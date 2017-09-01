var mongoose = require('mongoose')
var Schema = mongoose.Schema
var moment = require('moment')
var StatusSchema = {
  type: String, 
  enum: ['Planning', 'In Progress', 'Completed', 'Cancelled'], 
  default: 'Planning'
}

var StepSchema = new Schema({
  status: StatusSchema,
  name: {type: String},
  notes: {type: String},
  recommendations: {type: String},
  targetTemp: {type: Number},
  startTime: {type: Number},
  endTime: {type: Number},
  timer: {type: Number},
  timerStart: {type: Number}
})
var BrewSchema = new Schema({
    name: {type: String, default: 'New Brew (Change)'},
    notes: {type: String, default: ''},
    date: {type: Date, default: new Date()},
    batchSize: {type: Number, default: 0},
    sensorId: {type: String, default: null},
    status: StatusSchema,
    steps: {type: [StepSchema], default: [ 
      { status: 'Planning', name: 'Heat Water', notes: '', recommendations: 'Reach mash temperature', targetTemp: 170, startTime: 0, timer: null, endTime: 0},
      { status: 'Planning', name: 'Mash-in', notes: '', recommendations: 'Keep temperature at the target temperature', startTime: 0, targetTemp: 152, timer: 60, endTime: 0},
      { status: 'Planning', name: 'Mash-out', notes: '', recommendations: 'Reach 170-degress and let sit at 170-degress for 10-minutes.', timer: 10, targetTemp: 170, startTime: 0, endTime: 0 },
      { status: 'Planning', name: 'Measure Results', notes: '', recommendations: 'Remove grains, and take a pre-boil gravity reading to determine efficiency.', startTime: 0, endTime: 0, targetTemp: null, timer: null },
      { status: 'Planning', name: 'Heat Water', notes: '', recommendations: 'Reach boiing temperature', timer: null, startTime: 0, endTime: 0, targetTemp: 212 },
      { status: 'Planning', name: 'Boil', notes: '', recommendations: 'Boil wort', timer: 60, startTime: 0, targetTemp: 212 },
      { status: 'Planning', name: 'Cool', notes: '', recommendations: 'Chill the wort to pitching temperature, and take gravity measurment when at temp. Record the temperature and gravity reading.', targetTemp: 65, startTime: 0, endTime: 0 }
    ]}  
}, {
  toObject: { getters: true },
  toJSON: { getters: true }
})

function formatDate(v) {
  if (v) return moment(v).format('YYYY-MM-DD')
  else return null
}

var Brew = mongoose.model('Brew', BrewSchema)
module.exports = Brew
