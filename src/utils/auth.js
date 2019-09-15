const jwt = require('express-jwt');
const crypto = require('crypto');
const webtoken = require('jsonwebtoken');

const setPassword = password => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 512, 'sha512').toString('hex');
  console.log(`Set Password`); //salt, hash);
  // push to Mongp
}

const validateLogin = (user, password) => {
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 512, 'sha512').toString('hex');
  return user && user.hash === hash;
}

const generateJWT = user => {
  // console.log(`generateJWT: %o`, user);
  if (!user) return { error: 'Invalid auth user' };
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 60);

  return webtoken.sign({
    id: user._id,
    email: user.email,
    exp: parseInt(expirationDate.getTime() / 1000, 10),
  }, 'secret');
}

const toAuthJSON = user => {
  console.log(`toAuthJSON: %o`, user);
  if (!user) return { error: 'Invalid auth user' };
  return {
    user: {
      _id: user._id,
      email: user.email,
      token: generateJWT(user)
    }
  };
}

const getTokenFromHeaders = (req) => {
  const { headers: { authorization } } = req;

  if (authorization && authorization.split(' ')[0] === 'Token') {
    return authorization.split(' ')[1];
  }
  return null;
};

const auth = {
  required: jwt({
    secret: 'secret',
    userProperty: 'payload',
    getToken: getTokenFromHeaders,
  }),
  optional: jwt({
    secret: 'secret',
    userProperty: 'payload',
    getToken: getTokenFromHeaders,
    credentialsRequired: false,
  }),
}

module.exports = {
  auth,
  setPassword,
  toAuthJSON
}
