import * as data from '../common/db.js';
import * as log from '../common/logger.js';
import { messageTypes, sendSms, sendEmail } from '../common/messaging.js';
import { PODS_COLLECTION } from '../common/collections.js';

interface User {
  id: string;
  name: string;
  email?: string;
  display_name?: string;
}

interface Track {
  id: string;
  name: string;
  artist?: string;
}

export const createPod = async (createdBy: User) => {
  const newPod = await data.insertOne(PODS_COLLECTION, {
    createdBy,
    members: [createdBy]
  });

  log.success(`Created new pod ${newPod._id}`);

  return newPod;
};

export const getInviteLink = (podId: string): string => {
  const frontendUrl = process.env.PEAPOD_UI_URL;
  return `${frontendUrl}/invite/${podId}`;
};

export const sendInviteCode = async (podId: string, messageType: string, to: string) => {
  const inviteLink = getInviteLink(podId);

  if (messageType === messageTypes.SMS) {
    sendSms(`You've been invited to a Peapod: ${inviteLink}`, to);
    return { message: `Sent invite link via ${messageType} for pod ${podId} to ${to}` };
  }

  if (messageType === messageTypes.EMAIL) {
    const subject = "You've been invited to a Peapod!";
    const body = `<p>You've been invited to join a pod on Peapod!</p><p><a href="${inviteLink}">Click here to join</a></p>`;
    sendEmail(subject, body, to);
    return { message: `Sent invite link via ${messageType} for pod ${podId} to ${to}` };
  }

  throw new Error(`Invalid messageType provided: [${messageType}]`);
};

export const getPods = async (page: number, size: number, userId?: string) =>
  data.getSome(PODS_COLLECTION, page, size, 'members.id', userId);

export const getPod = async (podId: string) => data.getById(PODS_COLLECTION, podId);

export const deletePod = async (podId: string) => {
  log.cool(`Deleting pod ${podId}`);
  return data.deleteOne(PODS_COLLECTION, podId);
};

export const addMember = async (podId: string, user: User) => {
  log.cool(`Adding member ${user.id} to pod ${podId}`);
  return data.addToSet(PODS_COLLECTION, podId, { members: user });
};

export const removeMember = async (podId: string, user: User) => {
  log.cool(`Removing member ${user.id} from pod ${podId}`);
  return data.pullFromSet(PODS_COLLECTION, podId, { members: user });
};

export const addTrackToPlayQueue = async (podId: string, track: Track) => {
  log.cool(`Adding track ${track.name} to pod ${podId} play queue`);
  return data.addToSet(PODS_COLLECTION, podId, { queue: track });
};

export const removeTrackFromPlayQueue = async (podId: string, track: Track) => {
  log.cool(`Removing track ${track.name} from pod ${podId} play queue`);
  return data.pullFromSet(PODS_COLLECTION, podId, { queue: { id: track.id } });
};

export const addTrackToPlayHistory = async (podId: string, track: Track) => {
  log.cool(`Adding track ${track.name} to pod ${podId} play history`);
  return data.addToSet(PODS_COLLECTION, podId, { history: track });
};

export const addActiveMember = async (podId: string, user: User) => {
  const { display_name: userName, id: userId } = user;
  log.cool(`Adding active member ${userName} (${userId}) to pod ${podId}`);
  return data.addToSet(PODS_COLLECTION, podId, { activeMembers: userId });
};

export const removeActiveMember = async (podId: string, userId: string) => {
  log.cool(`Removing active member ${userId} from pod ${podId}`);
  return data.pullFromSet(PODS_COLLECTION, podId, { activeMembers: userId });
};
