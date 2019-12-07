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

const getPods = async (page, size) => {
  const collection = data.db.collection(PODS_COLLECTION);
  const totalItems = await collection.countDocuments({});
  const totalPages = data.calculateTotalPages(totalItems, size);

  return new Promise((resolve, reject) => {
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
  return new Promise((resolve, reject) => {
    data.db.collection(PODS_COLLECTION)
      .find({ _id: ObjectId(podId) })
      .toArray((err, result) =>
        err ? reject(err) : resolve(result[0])
      );
  });
};

const updatePod = (podId, updates) => {
  console.log(`Update Pod ${podId}: ${updates}`);
};

const deletePod = async podId => {
  const pod = await getPod(podId);
  return new Promise((resolve, reject) => {
    if (!pod) return reject({ error: `Pod [${podId}] does not exist` });
    data.db.collection(PODS_COLLECTION)
      .deleteOne(
        { _id: ObjectId(podId) },
        err => err ? reject(err) : resolve({ name: pod.name })
      )
  });
};

const addMember = async (podId, user) => {
  const { name } = await getPod(podId);
  return new Promise((resolve, reject) => {
    data.db.collection(PODS_COLLECTION)
      .updateOne(
        { _id: ObjectId(podId) },
        { $addToSet: { members: user } },
        (err, { matchedCount, modifiedCount }) => {
          if (err) reject(err);
          const alreadyExists = matchedCount === 1 && modifiedCount === 0;
          resolve({ alreadyExists, podName: name });
        }
      );
  });
};

const removeMember = async (podId, user) => {
  const { name } = await getPod(podId);
  return new Promise((resolve, reject) => {
    data.db.collection(PODS_COLLECTION)
      .updateOne(
        { _id: ObjectId(podId) },
        { $pull: { members: user } },
        (err, { matchedCount, modifiedCount }) => {
          if (err) reject(err);
          const notAMember = matchedCount === 1 && modifiedCount === 0;
          resolve({ notAMember, podName: name });
        }
      );
  });
};

const addCategory = async (podId, category) => {
  const { name } = await getPod(podId);
  return new Promise((resolve, reject) => {
    data.db.collection(PODS_COLLECTION)
      .updateOne(
        { _id: ObjectId(podId) },
        { $addToSet: { categories: category } },
        (err, { matchedCount, modifiedCount }) => {
          if (err) reject(err);
          const alreadyExists = matchedCount === 1 && modifiedCount === 0;
          resolve({ alreadyExists, podName: name });
        }
      );
  });
};

const removeCategory = async (podId, category) => {
  const { name } = await getPod(podId);
  return new Promise((resolve, reject) => {
    data.db.collection(PODS_COLLECTION)
      .updateOne(
        { _id: ObjectId(podId) },
        { $pull: { categories: category } },
        (err, { matchedCount, modifiedCount }) => {
          if (err) reject(err);
          const doesNotExist = matchedCount === 1 && modifiedCount === 0;
          resolve({ doesNotExist, podName: name });
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
  removeMember,
  addCategory,
  removeCategory
};
