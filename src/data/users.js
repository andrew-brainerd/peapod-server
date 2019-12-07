const data = require('../utils/data');
const auth = require('../utils/auth');
const { USERS_COLLECTION } = require('../constants/collections');

const getUserByEmail = email => {
  return new Promise((resolve, reject) => {
    data.db.collection(USERS_COLLECTION)
      .find({ email })
      .project({ password: 0 })
      .toArray((err, result) =>
        err ? reject(err) : resolve(result[0])
      );
  });
};

const createUser = user => {
  const userAuth = auth.encryptPassword(user.password);
  const newUser = { email: user.email , ...userAuth };
  return new Promise((resolve, reject) => {
    data.db.collection(USERS_COLLECTION)
      .insertOne(newUser, (err, { ops }) => {
        err ? reject(err) : resolve(ops[0]);
      });
  });
};

module.exports = {
  getUserByEmail,
  createUser
};
