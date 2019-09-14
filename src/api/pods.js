const data = require('../utils/db');
const log = require('../utils/log');
const { PODs_COLLECTION } = require('../constants/collections');

exports.createPod = async name => {
  log.info(`Create Pod: ${name}`);
  if (!name) return;

  const collection = data.db.collection('pods');

  collection.insertOne({ name: name }, (err, result) => {
    if (!err) log.cool(`Created new pod ${name}`);
    else log.error(err);
  });
}

exports.getPods = async () => {
  log.info(`Get Pods`);
  const { pageNum, pageSize } = req.query;
  const page = parseInt(pageNum) || 1;
  const size = parseInt(pageSize) || 0;
  const collection = db.collection(PODs_COLLECTION);

  const pods = collection.find({})
    .skip(size * (page - 1))
    .limit(size)
    .sort({ $natural: -1 });
}
