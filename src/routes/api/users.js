const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const _id = '01234';
const email = 'drwb333@hotmail.com';
let hash, salt;

const getUserByEmail = email => {
  const user = users.find(u => u.email === email);
  console.log(`User:`, user);
  return user;
}

const setPassword = password => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 512, 'sha512').toString('hex');

  // push to Mongo

}

const validateLogin = (user, password) => {
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 512, 'sha512').toString('hex');
  return user && user.hash === hash;
}

const generateJWT = () => {
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 60);

  return jwt.sign({
    email: email,
    id: _id,
    exp: parseInt(expirationDate.getTime() / 1000, 10),
  }, 'secret');
}

const toAuthJSON = function() {
  return {
    _id: _id,
    email: email,
    token: generateJWT(),
  };
}
