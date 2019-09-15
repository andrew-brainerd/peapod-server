const passport = require('passport');
const LocalStrategy = require('passport-local');
const users = require('../routes/api/users');
const auth = require('../utils/auth');

passport.use(new LocalStrategy({
  usernameField: 'user[email]',
  passwordField: 'user[password]',
}, (email, password, done) => {
  users.getUserByEmail(email)
    .then(user => {
      if (!user || !auth.validateLogin(user, password)) {
        return done(null, false, { error: 'Invalid Login' });
      }

      return done(null, user);
    }).catch(done);
}));
