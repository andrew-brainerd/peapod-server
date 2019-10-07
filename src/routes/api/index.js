const router = require('express').Router();
const request = require('request');
const version = process.env.API_VERSION;

router.post('/', (req, res) => {
  res.send({
    message: `Welcome to the Peapod API v${version}!`
  });
});

router.get('/', (req, res) => {
  res.send({
    message: `Welcome to the Peapod API v${version}!`
  });
});

router.use('/pods', require('./pods'));

module.exports = router;
