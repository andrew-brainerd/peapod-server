const passport = require('passport');
const users = require('express').Router();
const { auth, setPassword, toAuthJSON } = require('../../utils/auth');
const data = require('../../utils/db');
const log = require('../../utils/log');
const { USERS_COLLECTION } = require('../../constants/collections');

const getUserByEmail = email => {
  const user = {
    '_id': '012345',
    'email': 'none',
    'password': 'none'
  }
  return user;
}

users.post('/', auth.optional, (req, res, next) => {
  const { body: { user } } = req;

  if (!user) {
    return res.status(400).send({
      message: `Missing required param: [user]`
    });
  }

  console.log(`Users: POST /`);

  if (!user.email) {
    return res.status(400).send({
      message: `Missing required param: [user.email]`
    });
  }

  if (!user.password) {
    return res.status(400).send({
      message: `Missing required param: [user.password]`
    });
  }

  const collection = data.db.collection(USERS_COLLECTION);
  collection.insertOne(user, (err, result) => {
    if (!err) {
      const { _id, email } = result.ops[0];
      log.success(`Created new user ${email}`);
      return res.send(toAuthJSON({ _id, email }));
    }
  });
});

users.post('/login', auth.optional, (req, res, next) => {
  const { body: { user } } = req;

  console.log(`/login`, { req, res });

  if (!user.email) {
    return res.status(422).json({
      errors: {
        email: 'is required',
      },
    });
  }

  if (!user.password) {
    return res.status(422).json({
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

users.get('/current', auth.required, (req, res, next) => {
  const { payload: { id } } = req;

  return Users.findById(id)
    .then((user) => {
      if (!user) {
        return res.sendStatus(400);
      }

      return res.json({ user: user.toAuthJSON() });
    });
});

module.exports = users;
