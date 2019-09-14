const data = require('../utils/db');
const log = require('../utils/log');
const { PODS_COLLECTION } = require('../constants/collections');

exports.createPod = async (res, name) => {
  log.info(`Create Pod: ${name}`);

  if (!name) {
    res.status(400).send({
      message: `Missing name ${name}`
    }); 
    return;
  }

  const collection = data.db.collection(PODS_COLLECTION);
  const pod = { name: name };

  const newPod = collection.insertOne(pod, (err, result) => {
    if (!err) {
      log.cool(`Created new pod ${name}`);
      res.send({
        message: `Created new pod ${name}`,
        pod
      });
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
}

exports.getPods = async (res, page = 1, size = 0) => {
  log.info(`Get Pods`);
  const pageNum = parseInt(page);
  const pageSize = parseInt(size);

  const collection = data.db.collection(PODS_COLLECTION);

  const totalItems = await collection.countDocuments({});
  const totalPages = data.calculateTotalPages(totalItems, pageSize);

  const results = collection.find({})
    .skip(pageSize * (pageNum - 1))
    .limit(pageSize)
    .sort({ $natural: -1 });

  return await results.toArray((err, items) => {
    if (err) throw err;
    res.send({
      items,
      pageNum: page,
      pageSize: size,
      totalItems,
      totalPages
    });
  });
}
