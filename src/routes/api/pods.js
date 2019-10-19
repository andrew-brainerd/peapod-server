const pods = require('express').Router();
const podsData = require('../../data/pods');
const ObjectId = require('mongodb').ObjectId;
const data = require('../../utils/data');
const status = require('../../constants/statusMessages');
const { PODS_COLLECTION } = require('../../constants/collections');

pods.post('/', async (req, res) => {
  const { body: { name } } = req;

  if (!name) return status.missingQueryParam(res, 'name');

  const newPod = await podsData.createPod(name);
  if (!newPod) return status.serverError(res, err, `Failed to create pod ${name}`);

  return status.created(res, { ...newPod });
});

pods.get('/', async (req, res) => {
  const { query: { pageNum, pageSize } } = req;
  const page = parseInt(pageNum) || 1;
  const size = parseInt(pageSize) || 50;

  const { items, totalItems, totalPages } = await podsData.getPods(page, size);

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

  const collection = data.db.collection(PODS_COLLECTION);
  const updatedPod = collection.updateOne(
    { _id: ObjectId(podId) },
    { $pull: { members: user } }
  );

  return status.success(res, {
    message: `Removed member ${user.name} from pod ${podId}`
  });
});

pods.patch('/:podId/categories', async (req, res) => {
  const { params: { podId }, body: { category } } = req;

  if (!podId) return status.missingQueryParam(res, 'podId');
  if (!category) return status.missingBodyParam(res, 'category');

  const { alreadyExists } = await podsData.addCategory(podId, category);
  if (alreadyExists) return status.alreadyExists(res, 'Category', 'name', category.name);

  return status.success(res, {
    message: `Added category ${category.name} to pod ${podId}`
  });
});

module.exports = pods;
