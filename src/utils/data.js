/* eslint node/exports-style: off */

const mongo = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const log = require('./log');

const dbUri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

const mongoOptions = { useNewUrlParser: true, useUnifiedTopology: true };

var db;

const connectToMongoDB = async () => {
  mongo.connect(dbUri, mongoOptions, (err, client) => {
    if (err) {
      log.error(err);
      connect(false);
      return;
    }

    db = client.db(dbName);

    log.cool(`Connected to DB: ${dbName}`);
    connect(true);
  });
}

const connect = async (connected) => !connected && connectToMongoDB();

const calculateTotalPages = (items, size) => items > size ? Math.ceil(items / size) : 1;

connect();

const insertOne = async (collectionName, document) => {
  return new Promise((resolve, reject) => {
    db.collection(collectionName)
      .insertOne(document, (err, { ops }) => {
        err ? reject(err) : resolve(ops[0]);
      });
  });
};

const getSome = async (collectionName, page, size, identifier, idValue) => {
  const collection = db.collection(collectionName);
  const totalItems = await collection.countDocuments({});
  const totalPages = calculateTotalPages(totalItems, size);

  return new Promise((resolve, reject) => {
    const query = identifier && idValue ? { [identifier]: idValue } : {};
    collection
      .find(query)
      .skip(size * (page - 1))
      .limit(size)
      .sort({ $natural: -1 })
      .toArray((err, items) => {
        err ? reject(err) : resolve({
          items,
          totalItems,
          totalPages
        });
      });
  });
};

const getById = async (collectionName, id) => {
  return new Promise((resolve, reject) => {
    db.collection(collectionName)
      .find({ _id: ObjectId(id) })
      .toArray((err, result) =>
        err ? reject(err) : resolve(result[0])
      );
  });
};

const getByProperty = (collectionName, property, value) => {
  return new Promise((resolve, reject) => {
    db.collection(collectionName)
      .find({ [property]: value })
      .toArray((err, result) =>
        err ? reject(err) : resolve(result[0])
      );
  });
};

const updateOne = async (collectionName, id, update) => {
  return new Promise((resolve, reject) => {
    try {
      db.collection(collectionName)
        .updateOne(
          { _id: ObjectId(id) },
          { $addToSet: update },
          (err, result) => {
            const { matchedCount, modifiedCount } = result || {};
            if (err) reject(err);
            const alreadyExists = matchedCount === 1 && modifiedCount === 0;
            resolve({ alreadyExists, id });
          }
        );
    } catch (err) {
      reject(err);
    }
  })
};

module.exports = {
  db,
  calculateTotalPages,
  insertOne,
  getSome,
  getById,
  getByProperty,
  updateOne
};
