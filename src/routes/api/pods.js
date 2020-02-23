const pods = require('express').Router();
const podsData = require('../../data/pods');
const status = require('../../constants/statusMessages');
const { isDefined } = require('../../utils/url');

pods.post('/', async (req, res) => {
  const { body: { name, createdBy } } = req;

  if (!name) return status.missingBodyParam(res, 'name');
  if (!createdBy) return status.missingBodyParam(res, 'createdBy');

  const newPod = await podsData.createPod(name, createdBy);
  if (!newPod) return status.serverError(res, 'Failed', `Failed to create pod [${name}]`);

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
    const { name } = await podsData.deletePod(podId);
    return status.success(res, { message: `Deleted pod [${name}]` });
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

  const { alreadyExists, podName } = await podsData.addMember(podId, user);
  if (alreadyExists)
    return status.alreadyExists(res, 'User', 'name', user.name, `pod [${podName}]`);

  return status.success(res, {
    message: `Added user [${user.name}] to pod [${podName}]`
  });
});

pods.delete('/:podId/members', async (req, res) => {
  const { params: { podId }, body: { user } } = req;

  if (!isDefined(podId)) return status.missingQueryParam(res, 'podId');
  if (!user) return status.missingBodyParam(res, 'user');

  const { notAMember, podName } = await podsData.removeMember(podId, user);
  if (notAMember) return status.doesNotExist(res, 'Member', user.name, `pod [${podName}]`);

  return status.success(res, {
    message: `Removed member [${user.name}] from pod [${podName}]`
  });
});

pods.patch('/:podId/queue', async (req, res) => {
  const { params: { podId }, body: { track } } = req;

  if (!isDefined(podId)) return status.missingQueryParam(res, 'podId');
  if (!track) return status.missingBodyParam(res, 'track');

  const { alreadyExists, podName } = await podsData.addTrackToPlayQueue(podId, track);
  if (alreadyExists) return status.alreadyExists(res, 'Track', 'name', podName);

  return status.success(res, {
    message: `Added track [${track.name}] to pod [${podName}] play history`
  });
});

pods.patch('/:podId/history', async (req, res) => {
  const { params: { podId }, body: { track } } = req;

  if (!isDefined(podId)) return status.missingQueryParam(res, 'podId');
  if (!track) return status.missingBodyParam(res, 'track');

  const { alreadyExists, podName } = await podsData.addTrackToPlayHistory(podId, track);
  // if (alreadyExists) return status.alreadyExists(res, 'Track', 'name', podName);

  return status.success(res, {
    message: `Added track [${track.name}] to pod [${podName}] play history`
  });
});

pods.patch('/:podId/activeMembers', async (req, res) => {
  const { params: { podId }, body: { user } } = req;

  if (!isDefined(podId)) return status.missingQueryParam(res, 'podId');
  if (!user) return status.missingBodyParam(res, 'user');

  const { alreadyExists, podName } = await podsData.addActiveMember(podId, user);
  // if (alreadyExists)
  //   return status.alreadyExists(res, 'User', 'name', user.name, `pod [${podName}]`);

  return status.success(res, {
    message: `Added active user [${user.name}] to pod [${podName}]`
  });
});

pods.delete('/:podId/activeMembers', async (req, res) => {
  const { params: { podId }, body: { user } } = req;

  if (!isDefined(podId)) return status.missingQueryParam(res, 'podId');
  if (!user) return status.missingBodyParam(res, 'user');

  const { notAMember, podName } = await podsData.removeActiveMember(podId, user);
  if (notAMember) return status.doesNotExist(res, 'Member', user.name, `pod [${podName}]`);

  return status.success(res, {
    message: `Removed active member [${user.name}] from pod [${podName}]`
  });
});

module.exports = pods;
