const passport = require('passport');
const LocalStrategy = require('passport-local');
const users = require('../routes/api/users');

passport.use(new LocalStrategy({
  usernameField: 'user[email]',
  passwordField: 'user[password]',
}, (email, password, done) => {
  users.getUserByEmail(email)
    .then(user => {
      if (!user || !users.validateLogin(user, password)) {
        return done(null, false, { errors: { 'email or password': 'is invalid' } });
      }

      return done(null, user);
    }).catch(done);
}));
