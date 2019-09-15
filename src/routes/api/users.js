const passport = require('passport');
const usersRouter = require('express').Router();
const log = require('../../utils/log');
const { auth, setPassword, toAuthJSON } = require('../../utils/auth');
const usersData = require('../../data/users');

usersRouter.post('/', auth.optional, async (req, res, next) => {
  const { body: { user } } = req;

  if (!user) {
    return res.status(400).send({
      error: `Missing required param: [user]`
    });
  }

  const { email, password } = user;

  if (!email) {
    return res.status(400).send({
      error: `Missing required param: [user.email]`
    });
  }

  if (!password) {
    return res.status(400).send({
      error: `Missing required param: [user.password]`
    });
  }

  const existingUser = await usersData.getUserByEmail(email);
  if (existingUser) {
    return res.status(400).send({
      error: `User with email ${email} already exists`
    });
  }

  const newUser = await usersData.createUser(user);
  return res.send(toAuthJSON(newUser));
});

usersRouter.post('/login', auth.optional, (req, res, next) => {
  const { body: { user } } = req;

  console.log(`/login`, { req, res });

  if (!user.email) {
    return res.status(400).send({
      errors: {
        email: 'is required',
      },
    });
  }

  if (!user.password) {
    return res.status(400).send({
      errors: {
        password: 'is required',
      },
    });
  }

  return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
    if (err) {
      console.log(`passport.authentication error: ${err}`);
      return next(err);
    }

    console.log(`Passport User: ${passportUser}`);

    if (passportUser) {
      const user = passportUser;
      user.token = passportUser.generateJWT();

      return res.json({ user: user.toAuthJSON() });
    }

    return status(400).info;
  })(req, res, next);
});

usersRouter.get('/current', auth.required, (req, res, next) => {
  const { payload: { id } } = req;

  return Users.findById(id)
    .then((user) => {
      if (!user) {
        return res.sendStatus(400);
      }

      return res.json({ user: user.toAuthJSON() });
    });
});

module.exports = usersRouter;
