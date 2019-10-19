const data = require('../utils/data');
const ObjectId = require('mongodb').ObjectId;
const log = require('../utils/log');
const messaging = require('../utils/messaging');
const { PODS_COLLECTION } = require('../constants/collections');

const createPod = name => {
  return new Promise((resolve, reject) => {
    const pod = {
      name: name,
      members: [{ name: 'admin' }]
    };

    data.db.collection(PODS_COLLECTION)
      .insertOne(pod, (err, { ops }) => {
        log.success(`Created new pod ${name}`);
        messaging.sendSms(`Created new pod ${name}`);
        err ? reject(err) : resolve(ops[0]);
      });
  });
};

const getPods = (page, size) => {
  return new Promise(async (resolve, reject) => {
    const collection = data.db.collection(PODS_COLLECTION);
    const totalItems = await collection.countDocuments({});
    const totalPages = data.calculateTotalPages(totalItems, size);

    collection.find({})
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

const getPod = podId => {
  return new Promise(async (resolve, reject) => {
    data.db.collection(PODS_COLLECTION)
      .find({ _id: ObjectId(podId) })
      .toArray((err, result) =>
        err ? reject(err) : resolve(result[0])
      );
  });
};

const updatePod = (podId, updates) => {
  console.log(`Update Pod: ${updates}`);
};

const deletePod = podId => {
  return new Promise(async (resolve, reject) => {
    const pod = await getPod(podId);
    if (!pod) return reject({ error: `Pod [${podId}] does not exist` });
    data.db.collection(PODS_COLLECTION)
      .deleteOne(
        { _id: ObjectId(podId) },
        err => err ? reject(err) : resolve({ name: pod.name })
      )
  });
};

const addMember = (podId, user) => {
  return new Promise(async (resolve, reject) => {
    const { name } = await getPod(podId);
    data.db.collection(PODS_COLLECTION)
      .updateOne(
        { _id: ObjectId(podId) },
        { $addToSet: { members: user } },
        (err, { matchedCount, modifiedCount }) => {
          if (err) reject(err);
          const alreadyExists = matchedCount === 1 && modifiedCount === 0;
          resolve({ alreadyExists });
        }
      );
  });
};

const addCategory = (podId, category) => {
  return new Promise(async (resolve, reject) => {
    data.db.collection(PODS_COLLECTION)
      .updateOne(
        { _id: ObjectId(podId) },
        { $addToSet: { categories: category } },
        (err, { matchedCount, modifiedCount }) => {
          if (err) reject(err);
          const alreadyExists = matchedCount === 1 && modifiedCount === 0;
          resolve({ alreadyExists });
        }
      );
  });
};

module.exports = {
  createPod,
  getPods,
  getPod,
  updatePod,
  deletePod,
  addMember,
  addCategory
};
