const pods = require('express').Router();
const podsData = require('../data/pods');
const status = require('../constants/statusMessages');
const { pusher } = require('../utils/notifications');
const { isDefined } = require('../utils/url');
const { MEMBER_ADDED, LAUNCH_GAME } = require('../constants/pusher');

pods.post('/', async (req, res) => {
  const { body: { createdBy } } = req;

  if (!createdBy) return status.missingBodyParam(res, 'createdBy');

  const newPod = await podsData.createPod(createdBy);
  if (!newPod) return status.serverError(res, 'Failed', `Failed to create pod`);

  return status.created(res, { ...newPod });
});

pods.get('/', async (req, res) => {
  const { query: { pageNum, pageSize, userId } } = req;
  const page = parseInt(pageNum) || 1;
  const size = parseInt(pageSize) || 50;

  const { items, totalItems, totalPages } = await podsData.getPods(page, size, userId);

  return status.success(res, {
    items,
    pageNum: page,
    pageSize: size,
    totalItems,
    totalPages
  });
});

pods.get('/:podId', async (req, res) => {
  const { params: { podId } } = req;

  if (!isDefined(podId)) return status.missingQueryParam(res, 'podId');

  const pod = await podsData.getPod(podId);
  return status.success(res, { ...pod });
});

pods.delete('/:podId', async (req, res) => {
  const { params: { podId } } = req;

  if (!isDefined(podId)) return status.missingQueryParam(res, 'podId');

  try {
    await podsData.deletePod(podId);
    return status.success(res, { message: `Deleted pod [${podId}]` });
  } catch (err) {
    return status.doesNotExist(res, 'Pod', podId);
  }
});

pods.post('/:podId/invite', async (req, res) => {
  const { params: { podId }, body: { messageType, to } } = req;

  if (!isDefined(podId)) return status.missingQueryParam(res, 'podId');
  if (!to) return status.missingBodyParam(res, 'to');

  const invite = await podsData.sendInviteCode(podId, messageType, to);
  if (!invite) return status.serverError(res, 'Failed', `Failed sending invite to [${to}]`);

  return status.success(res, { ...invite });
});

pods.patch('/:podId/members', async (req, res) => {
  const { params: { podId }, body: { user } } = req;

  if (!isDefined(podId)) return status.missingQueryParam(res, 'podId');
  if (!user) return status.missingBodyParam(res, 'user');

  const { alreadyExists } = await podsData.addMember(podId, user);
  if (alreadyExists)
    return status.alreadyExists(res, 'User', 'name', user.name, `pod [${podId}]`);

  pusher.trigger(podId, MEMBER_ADDED, {});

  return status.success(res, {
    message: `Added user [${user.name}] to pod [${podId}]`
  });
});

pods.delete('/:podId/members', async (req, res) => {
  const { params: { podId }, body: { user } } = req;

  if (!isDefined(podId)) return status.missingQueryParam(res, 'podId');
  if (!user) return status.missingBodyParam(res, 'user');

  const { notAMember } = await podsData.removeMember(podId, user);
  if (notAMember) return status.doesNotExist(res, 'Member', user.name, `pod [${podId}]`);

  return status.success(res, {
    message: `Removed member [${user.name}] from pod [${podId}]`
  });
});

pods.patch('/:podId/queue', async (req, res) => {
  const { params: { podId }, body: { track } } = req;

  if (!isDefined(podId)) return status.missingQueryParam(res, 'podId');
  if (!track) return status.missingBodyParam(res, 'track');

  const { alreadyExists } = await podsData.addTrackToPlayQueue(podId, track);
  if (alreadyExists) return status.alreadyExists(res, 'Track', 'name', podId);

  return status.success(res, {
    message: `Added track [${track.name}] to pod [${podId}] play queue`
  });
});

pods.delete('/:podId/queue', async (req, res) => {
  const { params: { podId }, body: { track } } = req;

  if (!isDefined(podId)) return status.missingQueryParam(res, 'podId');
  if (!track) return status.missingBodyParam(res, 'track');

  const { notAMember } = await podsData.removeTrackFromPlayQueue(podId, track);
  if (notAMember) return status.doesNotExist(res, 'Member', track.name, `pod [${podId}]`);

  return status.success(res, {
    message: `Removed track [${track.name}] from pod [${podId}]`
  });
});

pods.patch('/:podId/history', async (req, res) => {
  const { params: { podId }, body: { track } } = req;

  if (!isDefined(podId)) return status.missingQueryParam(res, 'podId');
  if (!track) return status.missingBodyParam(res, 'track');

  await podsData.addTrackToPlayHistory(podId, track);

  return status.success(res, {
    message: `Added track [${track.name}] to pod [${podId}] play history`
  });
});

pods.patch('/:podId/activeMembers', async (req, res) => {
  const { params: { podId }, body: { user } } = req;

  if (!isDefined(podId)) return status.missingQueryParam(res, 'podId');
  if (!user) return status.missingBodyParam(res, 'user');

  await podsData.addActiveMember(podId, user);
  await podsData.addMember(podId, user);

  return status.success(res, {
    message: `Added active user [${user.name}] to pod [${podId}]`
  });
});

pods.post('/:podId/activeMembers/:userId', async (req, res) => {
  const { params: { podId, userId } } = req;

  if (!isDefined(podId)) return status.missingQueryParam(res, 'podId');

  const { notAMember } = await podsData.removeActiveMember(podId, userId);
  if (notAMember) return status.doesNotExist(res, 'Member', userId, `pod [${podId}]`);

  return status.success(res, {
    message: `Removed active member [${userId}] from pod [${podId}]`
  });
});

pods.put('/:podId/launch', async (req, res) => {
  const { params: { podId } } = req;

  if (!isDefined(podId)) return status.missingQueryParam(res, 'podId');

  pusher.trigger(podId, LAUNCH_GAME, {});

  return status.success(res, {
    message: `Launching Pod ${podId}`
  });
});

module.exports = pods;
