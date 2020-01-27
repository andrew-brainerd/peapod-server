const pods = require('express').Router();
const podsData = require('../../data/pods');
const status = require('../../constants/statusMessages');

pods.post('/', async (req, res) => {
  const { body: { name } } = req;

  if (!name) return status.missingQueryParam(res, 'name');

  const newPod = await podsData.createPod(name);
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

  if (!podId) return status.missingQueryParam(res, 'podId');

  const pod = await podsData.getPod(podId);
  return status.success(res, { ...pod });
});

pods.delete('/:podId', async (req, res) => {
  const { params: { podId } } = req;

  if (!podId) return status.missingQueryParam(res, 'podId');

  try {
    const { name } = await podsData.deletePod(podId);
    return status.success(res, { message: `Deleted pod [${name}]` });
  } catch (err) {
    return status.doesNotExist(res, 'Pod', podId);
  }
});

pods.post('/:podId/invite', async (req, res) => {
  const { params: { podId }, body: { messageType, to } } = req;

  if (!to) return status.missingQueryParam(res, 'to');

  const invite = await podsData.sendInviteCode(podId, messageType, to);
  if (!invite) return status.serverError(res, 'Failed', `Failed sending invite to [${to}]`);

  return status.success(res, { ...invite });
});

pods.patch('/:podId/members', async (req, res) => {
  const { params: { podId }, body: { user } } = req;

  if (!podId) return status.missingQueryParam(res, 'podId');
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

  if (!podId) return status.missingQueryParam(res, 'podId');
  if (!user) return status.missingBodyParam(res, 'user');

  const { notAMember, podName } = await podsData.removeMember(podId, user);
  if (notAMember) return status.doesNotExist(res, 'Member', user.name, `pod [${podName}]`);

  return status.success(res, {
    message: `Removed member [${user.name}] from pod [${podName}]`
  });
});

pods.patch('/:podId/tracks', async (req, res) => {
  const { params: { podId }, body: { track } } = req;

  if (!podId) return status.missingQueryParam(res, 'podId');
  if (!track) return status.missingBodyParam(res, 'track');

  const { alreadyExists, podName } = await podsData.addTrack(podId, track);
  if (alreadyExists) return status.alreadyExists(res, 'Track', 'name', podName);

  return status.success(res, {
    message: `Added track [${track.name}] to pod [${podName}]`
  });
});

pods.delete('/:podId/tracks', async (req, res) => {
  const { params: { podId }, body: { track } } = req;

  if (!podId) return status.missingQueryParam(res, 'podId');
  if (!track) return status.missingBodyParam(res, 'track');

  const { doesNotExist, podName } = await podsData.removeTrack(podId, track);
  if (doesNotExist) return status.doesNotExist(res, 'Track', track.name, `pod [${podName}]`);

  return status.success(res, {
    message: `Removed track [${track.name}] from pod [${podName}]`
  });
});

module.exports = pods;
