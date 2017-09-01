var mongoose = require('mongoose')
var Schema = mongoose.Schema

var DateConsume = new Schema({
  date: Date,
  consumed: Number
})

var KegSchema = new Schema({
  name: String,
  description: String,
  user: String,
  size: Number,
  used: {type: Number, default: 0},
  tapped: Date,
  kicked: Date,
  consumption: [DateConsume],
  sensor: {type: String, default: null},
  ratings: [Number]
}, {
  toObject: { getters: true },
  toJSON: { getters: true }
})

var Keg = mongoose.model('Keg', KegSchema)
module.exports = Keg
