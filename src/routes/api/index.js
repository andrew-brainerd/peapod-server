const router = require('express').Router();
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
router.use('/spotify', require('./spotify'));

module.exports = router;
