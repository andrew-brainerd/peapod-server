const pods = require('express').Router();
const data = require('../../utils/data');
const log = require('../../utils/log');
const { PODS_COLLECTION } = require('../../constants/collections');

pods.post('/', async (req, res) => {
  const name = (req.body || {}).name;

  if (!name) {
    return res.status(400).send({
      message: `Missing required param: [name]`
    });
  }

  const collection = data.db.collection(PODS_COLLECTION);
  const pod = {
    name: name,
    members: [
      {
        name: 'admin'
      }
    ]
  }

  const newPod = collection.insertOne(pod, (err, result) => {
    if (!err) {
      log.success(`Created new pod ${name}`);
      res.send({ ...pod });
    }
    else {
      log.error(err);
      res.status(500).send({
        message: `Failed to create pod ${name}`,
        error: err
      });
      return;
    }
  });

  return newPod;
});

pods.get('/', async (req, res) => {
  log.info(`Get Pods`);
  const { pageNum, pageSize } = req.query;
  const page = parseInt(pageNum) || 1;
  const size = parseInt(pageSize) || 0;

  const collection = data.db.collection(PODS_COLLECTION);

  const totalItems = await collection.countDocuments({});
  const totalPages = data.calculateTotalPages(totalItems, pageSize);

  const results = collection.find({})
    .skip(size * (page - 1))
    .limit(size)
    .sort({ $natural: -1 });

  return results.toArray((err, items) => {
    if (err) throw err;
    res.send({
      items,
      pageNum: page,
      pageSize: size,
      totalItems,
      totalPages
    });
  });
});

module.exports = pods;
