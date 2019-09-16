const passport = require('passport');
const usersRouter = require('express').Router();
const log = require('../../utils/log');
const { auth, toAuthJSON } = require('../../utils/auth');
const usersData = require('../../data/users');

usersRouter.post('/', auth.optional, async (req, res, next) => {
  const { body: { email, password } } = req;

  if (!email) return res.sendMissingParam('email');
  if (!password) return res.sendMissingParam('password');

  const existingUser = await usersData.getUserByEmail(email);
  if (existingUser) {
    return res.sendAlreadyExists({
      entity: 'User',
      property: 'email',
      value: email
    });
  }

  const newUser = await usersData.createUser({ email, password });
  return res.send(toAuthJSON(newUser));
});

usersRouter.post('/login', auth.optional, (req, res, next) => {
  const { body: { email, password } } = req;

  if (!email) return res.sendMissingParam('email');
  if (!password) return res.sendMissingParam('password');

  return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
    if (err) {
      log.error(`Passport Authentication Errror: ${err}`);
      return next(err);
    }

    if (passportUser) {
      const user = passportUser;
      user.token = passportUser.generateJWT();

      return res.json({ user: user.toAuthJSON() });
    }

    return res.status(400).send({ info });
  })(req, res, next);
});

module.exports = usersRouter;
