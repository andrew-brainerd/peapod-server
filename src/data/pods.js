const data = require('../utils/data');
const log = require('../utils/log');
const { messageTypes, sendSms } = require('../utils/messaging');
const { PODS_COLLECTION } = require('../constants/collections');

const createPod = async (name, createdBy) => {
  const newPod = await data.insertOne(PODS_COLLECTION,
    { name, createdBy, members: [createdBy] }
  );

  log.success(`Created new pod ${newPod.name} (${newPod._id})`);

  return newPod;
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

const getPods = async (page, size, userId) =>
  await data.getSome(PODS_COLLECTION, page, size, 'members.id', userId);

const getPod = async podId => await data.getById(PODS_COLLECTION, podId);

const deletePod = async podId => await data.deleteOne(PODS_COLLECTION, podId);

const addMember = async (podId, user) => {
  const { name } = await getPod(podId);
  log.cool(`Adding member ${user.name} (${user.id}) to pod ${name} (${podId})`);
  
  return await data.addToSet(PODS_COLLECTION, podId, { members: user });
};

const removeMember = async (podId, user) => {
  const { name } = await getPod(podId);
  const { display_name: userName, id: userId } = user;
  log.cool(`Removing member ${userName} (${userId}) from pod ${name} (${podId})`);
  
  return await data.pullFromSet(PODS_COLLECTION, podId, { members: user });
};

const addTrackToPlayQueue = async (podId, track) => {
  const { name } = await getPod(podId);
  log.cool(`Adding track ${track.name} to pod ${name} (${podId}) play queue`);

  return await data.addToSet(PODS_COLLECTION, podId, { queue: track });
};

const removeTrackFromPlayQueue = async (podId, track) => {
  const { name } = await getPod(podId);
  log.cool(`Removing track ${track.name} from pod ${name} (${podId}) play queue`);
  
  return await data.pullFromSet(PODS_COLLECTION, podId, { queue: { id: track.id } });
};

const addTrackToPlayHistory = async (podId, track) => {
  const { name } = await getPod(podId);
  log.cool(`Adding track ${track.name} to pod ${name} (${podId}) play history`);
  
  return await data.addToSet(PODS_COLLECTION, podId, { history: track });
};

const addActiveMember = async (podId, user) => {
  const { name } = await getPod(podId);
  const { display_name: userName, id: userId } = user;
  log.cool(`Adding active member ${userName} (${userId}) to pod ${name} (${podId})`);

  return await data.addToSet(PODS_COLLECTION, podId, { activeMembers: userId });
};

const removeActiveMember = async (podId, userId) => {
  const { name } = await getPod(podId);
  log.cool(`Removing active member ${userId} from pod ${name} (${podId})`);

  return data.pullFromSet(PODS_COLLECTION, podId, { activeMembers: userId });
};

module.exports = {
  createPod,
  sendInviteCode,
  getPods,
  getPod,
  deletePod,
  addMember,
  removeMember,
  addTrackToPlayQueue,
  addTrackToPlayHistory,
  removeTrackFromPlayQueue,
  addActiveMember,
  removeActiveMember
};
