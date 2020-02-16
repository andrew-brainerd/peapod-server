const data = require('../utils/data');
const ObjectId = require('mongodb').ObjectId;
const log = require('../utils/log');
const { messageTypes, sendSms } = require('../utils/messaging');
const { PODS_COLLECTION } = require('../constants/collections');

const createPod = (name, createdBy) => {
  return new Promise((resolve, reject) => {
    data.db && data.db.collection(PODS_COLLECTION)
      .insertOne({ name, createdBy, members: [createdBy] }, (err, { ops }) => {
        const newPod = ops[0];
        log.success(`Created new pod ${newPod.name} (${newPod._id})`);
        sendSms(`Created new pod ${newPod.name}`, '9897210902');
        err ? reject(err) : resolve(newPod);
      });
  });
};

const sendInviteCode = async (podId, messageType, to) => {
  const { name } = await getPod(podId);
  const frontendUrl = process.env.PEAPOD_UI_URL;
  const inviteLink = `${frontendUrl}/pods/${podId}`;

  return new Promise((resolve, reject) => {
    if (messageType === messageTypes.SMS) {
      try {
        sendSms(`You've been invited to a Peapod: ${inviteLink}`, to);
        resolve({ message: `Sent invite link via ${messageType} for pod ${name} (${podId}) to ${to}` });
      } catch (err) {
        const errorMessage = `Invalid messageType provided: [${messageType}]`;
      console.error(errorMessage);
      reject(errorMessage);
      }
    }
  });
};

const getPods = async (page, size, userId) => {
  const collection = data.db && data.db.collection(PODS_COLLECTION);
  const totalItems = await collection.countDocuments({});
  const totalPages = data.calculateTotalPages(totalItems, size);

  return new Promise((resolve, reject) => {
    const query = userId ? { 'members.id': userId } : {};
    collection && collection
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

const getPod = podId => {
  return new Promise((resolve, reject) => {
    data.db && data.db.collection(PODS_COLLECTION)
      .find({ _id: ObjectId(podId) })
      .toArray((err, result) =>
        err ? reject(err) : resolve(result[0])
      );
  });
};

const updatePod = (podId, updates) => {
  log.info(`Update Pod ${podId}: ${updates}`);
};

const deletePod = async podId => {
  const pod = await getPod(podId);
  return new Promise((resolve, reject) => {
    if (!pod) return reject({ error: `Pod [${podId}] does not exist` });
    data.db && data.db.collection(PODS_COLLECTION)
      .deleteOne(
        { _id: ObjectId(podId) },
        err => err ? reject(err) : resolve({ name: pod.name })
      )
  });
};

const addMember = async (podId, user) => {
  const { name } = await getPod(podId);
  log.cool(`Adding member ${user.name} (${user._id}) to pod ${name} (${podId})`);
  return new Promise((resolve, reject) => {
    data.db && data.db.collection(PODS_COLLECTION)
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
  log.cool(`Removing member ${user.name} (${user._id}) from pod ${name} (${podId})`);
  return new Promise((resolve, reject) => {
    data.db && data.db.collection(PODS_COLLECTION)
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

const addTrackToPlayQueue = async (podId, track) => {
  const { name } = await getPod(podId);
  log.info(`Adding track ${track.name} to pod ${name} (${podId}) play queue`);
  return new Promise((resolve, reject) => {
    data.db && data.db.collection(PODS_COLLECTION)
      .updateOne(
        { _id: ObjectId(podId) },
        { $addToSet: { queue: track } },
        (err, { matchedCount, modifiedCount }) => {
          if (err) reject(err);
          const alreadyExists = matchedCount === 1 && modifiedCount === 0;
          resolve({ alreadyExists, podName: name });
        }
      );
  });
};

const addTrackToPlayHistory = async (podId, track) => {
  const { name } = await getPod(podId);
  log.info(`Adding track ${track.name} to pod ${name} (${podId}) play history`);
  return new Promise((resolve, reject) => {
    data.db && data.db.collection(PODS_COLLECTION)
      .updateOne(
        { _id: ObjectId(podId) },
        { $addToSet: { history: track } },
        (err, { matchedCount, modifiedCount }) => {
          if (err) reject(err);
          const alreadyExists = matchedCount === 1 && modifiedCount === 0;
          resolve({ alreadyExists, podName: name });
        }
      );
  });
};

const removeTrack = async (podId, track) => {
  const { name } = await getPod(podId);
  log.info(`Removing track ${track} from pod ${name} (${podId})`);
  return new Promise((resolve, reject) => {
    data.db && data.db.collection(PODS_COLLECTION)
      .updateOne(
        { _id: ObjectId(podId) },
        { $pull: { tracks: track } },
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
  sendInviteCode,
  getPods,
  getPod,
  updatePod,
  deletePod,
  addMember,
  removeMember,
  addTrackToPlayQueue,
  addTrackToPlayHistory,
  removeTrack
};
