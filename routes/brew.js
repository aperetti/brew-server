module.exports = (express, mongoose, client) => {
  const router = express.Router()
  const Brew = require('./../models/Brew')

  router.get('/id/:id', getBrewById)
  router.post('/id/:id', postBrewById)
  router.delete('/id/:id', deleteBrewById)
  router.get('/list', getBrewList)
  router.post('/new', postNewBrew)
  router.get('/schema', getSchema)
  router.get('/status/enum', getBrewStatusSchema)

  function getBrewById(req, res) {
    Brew.findById(req.params.id, (err, brew) => {
      if (err || !brew) return res.status(400)
      return res.status(200).json(brew.toObject({getters: true}))
    })
  }

  function postBrewById(req, res) {
    var id = req.params.id
    var brew = req.body
    console.log(req.body)
    Brew.findByIdAndUpdate(id, brew, {new: true}, (err, brew) => {
      console.log('saved')
      if(err) return res.status(400)
      res.status(200).json(brew)
      client.publish(`/brew`, brew.id)
    })
  }

  function getBrewStatusSchema(req, res) {
    res.status(200).json(Brew.schema.path('status').enumValues)
  }

  function deleteBrewById(req, res) {
    Brew.remove({_id: req.params.id}, (err, brew) => {
      if (err) return res.status(400)
      return res.status(200).json(brew)
    })
  }

  function getBrewList(req, res) {
    var status = req.query.status || null
    status = status ? {status: status} : {}
    return Brew.find(status, 'name', (err, brews) => res.status(200).json(brews))
  }

  function postNewBrew(req, res) {
    var newBrew = req.body.name
    newBrew = newBrew ? {name: newBrew} : {}
    Brew.create(newBrew, (err, brew) => {
      if (err) {
        console.log(err)
        return res.status(400).send()
      }
      console.log(brew)
    	res.status(200).send(brew)
    })
    return
  }

  function getSchema(req, res) {
    return res.status(200).json(Brew.schema)
  }
  return router
}
