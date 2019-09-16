const router = require('express').Router();
const passport = require('passport');
const version = process.env.API_VERSION;

const authOpts = { session: false };

router.post('/', passport.authenticate('local', authOpts), (req, res) => {
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
router.use('/users', require('./users'));

module.exports = router;
