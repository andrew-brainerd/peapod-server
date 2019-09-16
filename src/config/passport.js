const passport = require('passport');
const LocalStrategy = require('passport-local');
const usersData = require('../data/users');
const auth = require('../utils/auth');

const loginFields = {
  usernameField: 'email',
  passwordField: 'password',
};

passport.use(new LocalStrategy(loginFields,
  (email, password, done) => {
    usersData.getUserByEmail(email)
      .then(user => {
        if (!user || !auth.validateLogin(user, password)) {
          return done(null, false, { error: 'Invalid Login' });
        }
        return done(null, user);
      }).catch(done);
  }));
