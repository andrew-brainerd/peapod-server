const data = require('../utils/data');
const { USERS_COLLECTION } = require('../constants/collections');

const getUserByEmail = email => {
  return new Promise((resolve, reject) => {
    data.db.collection(USERS_COLLECTION)
      .find({ email })
      .project({ password: 0 })
      .toArray((err, result) => {
        err ? reject(err) : resolve(result[0]);
      });
  });
}

const createUser = user => {
  return new Promise((resolve, reject) => {
    data.db.collection(USERS_COLLECTION)
      .insertOne(user, (err, { ops }) => {
        err ? reject(err) : resolve(ops[0]);
      });
  });
}

module.exports = {
  getUserByEmail,
  createUser
}
