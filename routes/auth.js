module.exports = (express, app) => {
  var router = express.Router()
  var User = require('./../models/User')
  var jwt = require('jsonwebtoken')
  var bcrypt = require('bcrypt-nodejs')
  router.post('/login', login)

  function login(req, res) {
    var tokenExpiration = app.get('tokenExpiration') || '1y'
    var username = req.body.username
    User.findOne({ username: username }, 'username password', (err, person) => {
      if (person) {
        person.comparePassword(req.body.password, (err, match) => {
          if (match) {
            var token = jwt.sign({username: username},
              app.get('apiSecret'), {
                expiresIn: tokenExpiration
              })
            let date = Date.now();
            res.json({
              token: token
            })
          } else {
            console.log('Nope')
            return res.status(400).send('Incorrect Username/Password')
          }
        })
      } else {
      	return res.status(400).send('Incorrect Username/Password')
      }
    })
  }

  return router
}
