const router = require('express').Router();
const { version } = require('../../package.json');

router.get('/', (req, res) => {
  res.send({
    message: `Welcome to the Peapod API v${version}!`
  });
});

router.use('/notify', require('./notify'));
router.use('/pods', require('./pods'));
router.use('/spotify', require('./spotify'));
router.use('/sync', require('./sync'));

module.exports = router;
