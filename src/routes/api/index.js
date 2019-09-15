const router = require('express').Router();
const passport = require('passport');
const version = process.env.API_VERSION;

// passport.authenticate('local'),

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
router.use('/users', require('./users'));

module.exports = router;
