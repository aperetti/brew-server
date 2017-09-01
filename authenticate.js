jwt = require('jsonwebtoken')

module.exports = (app) => (req, res, next) => {
  if (req.headers.authorization) {
    req.token = req.headers.authorization.split(" ")[1]
  }
  var token = req.token || req.body.token || req.query.token || req.headers['x-access-token'];
  jwt.verify(token, app.get('apiSecret'), function(err, decodedToken) {
    if (err) {
      return res.status(403).send('Nuh uh! Authentication Blocked!');
    } else {
      req.decodedToken = decodedToken;
      req.client = decodedToken.username;
      next()
    }
  })
}
