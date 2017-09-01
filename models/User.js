var mongoose = require('mongoose')
var Schema = mongoose.Schema
var bcrypt = require('bcrypt-nodejs')
var SALT_WORK_FACTOR = 10

// set up a mongoose and pass it using module.exports
var userSchema = new Schema({
  username: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true, select: false },
  sensors: [{
    sensor: {type: String, required: true, index: {unique: true }},
    alias: {type: String}
  }]
})

userSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err)
    cb(null, isMatch)
  })
}

userSchema.statics.login = function(username, password, cb) {
  return this.where('username', username).limit(1).exec((err, user) => {
    var user = user[0]
    user.comparePassword(password, (match) => {
      cb(null, match)
    })
  })
}

userSchema.statics.getSensorAliases = function (username, cb) {
  return this.where('username', username).limit(1).exec((err, user) => {
    var user = user[0]
    cb(err, user.sensors)
  })
}

userSchema.pre('save', function(next) {
  var user = this
    //only hash password if password has change or is new
  if (!user.isModified('password')) return next();
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err)
    bcrypt.hash(user.password, salt, function() {}, function(err, hash) {
      if (err) return next(err)
      user.password = hash
      next()
    })
  })
})

module.exports = mongoose.model('User', userSchema)
