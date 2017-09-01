const config = require('./config')

module.exports = (app) => {
	var User = require('./models/User')
	console.log('Initializing Database')
	User.findOne({username: config.defaultUser.username}, (err, user) => {
		if (err) {
			return console.log(err)
		}
		if (!user) {
			User.create(config.defaultUser, function (err, user) {
				console.log('User initiated')
			})
		} else {
			user.password = config.defaultUser.password
			user.save()
			console.log('User saved')
		}
	})
}