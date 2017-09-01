module.exports = (express, mongoose) => {
  const router = express.Router()
  const Kegs = require('./../models/Kegs')

  router.get('/', getKegs)
  router.post('/new', newKeg)
  router.post('/save', saveKeg)
  router.post('/tap', tapKeg)
  router.post('/kick', kickKeg)
  router.delete('/delete', deleteKeg)
  router.post('/image', newImage)
  router.delete('/image/:id', deleteImage)

  function getKegs(req, res) {
    Kegs.find({ kicked: null }, (err, kegs) => {
      if (err || !kegs) return res.status(400)
      return res.status(200).json(kegs)
    })
  }

  function newKeg(req, res) {
    var keg = req.body
    keg.user = req.decodedToken.username
    if (keg) Kegs.create(keg, (err, keg) => {
      return res.status(200).json(keg)
    })
  }

  function saveKeg(req, res) {
    var updateKeg = req.body
    console.log(updateKeg)
    Kegs.findById(updateKeg._id, (err, keg) => {
      if (err) return res.status(400)
      Object.assign(keg, updateKeg)
      console.log(keg)
      keg.save((err, updatedKeg) => {
        if (err) return res.status(400)
        res.status(200).json(updatedKeg)
      })
    })
  }

  function tapKeg(req, res) {
    var tapKeg = req.body
    if (tapKeg) Kegs.findById(tapKeg._id, (err, keg) => {
      if (err || !keg) return res.status(400)
      keg.tapped = new Date()
      keg.save((err, updatedKeg) => {
        console.log(err, updatedKeg)
        if (err || !updatedKeg) return res.status(400)
        res.status(200).json(updatedKeg)
      })
    })
  }

  function kickKeg(req, res) {
    var keg = req.body
    if (keg) Kegs.findById(keg._id, (err, keg) => {
      keg.kicked = new Date()
      keg.used = keg.size
      keg.save((err, updatedKeg) => {
        res.status(200).json(updatedKeg)
      })
    })
  }

  function deleteKeg(req, res) {
    console.log(req)
    var keg = req.query
    if (keg) Kegs.findById(keg._id, (err, keg) => {
      if (err || !keg) return res.status(400).send()
      keg.remove((err, updatedKeg) => {
        res.status(200).send()
      })
    })
  }

  function newImage(req, res) {
    if(!req.files)
      return res.status(400).send('No files were uploaded.')

    
  }

  function deleteImage(req, res) {
    var id = req.params.id

  }
  return router
}
