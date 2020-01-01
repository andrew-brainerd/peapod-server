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

pods.patch('/:podId/categories', async (req, res) => {
  const { params: { podId }, body: { category } } = req;

  if (!podId) return status.missingQueryParam(res, 'podId');
  if (!category) return status.missingBodyParam(res, 'category');

  const { alreadyExists, podName } = await podsData.addCategory(podId, category);
  if (alreadyExists) return status.alreadyExists(res, 'Category', 'name', podName);

  return status.success(res, {
    message: `Added category [${category.name}] to pod [${podName}]`
  });
});

pods.delete('/:podId/categories', async (req, res) => {
  const { params: { podId }, body: { category } } = req;

  if (!podId) return status.missingQueryParam(res, 'podId');
  if (!category) return status.missingBodyParam(res, 'category');

  const { doesNotExist, podName } = await podsData.removeCategory(podId, category);
  if (doesNotExist) return status.doesNotExist(res, 'Category', category.name, `pod [${podName}]`);

  return status.success(res, {
    message: `Removed category [${category.name}] from pod [${podName}]`
  });
});

module.exports = pods;
