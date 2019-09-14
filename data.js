const mongo = require('mongodb').MongoClient;
const chalk = require('chalk');
const log = console.log;

const dbUri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

var db;

const options = { useNewUrlParser: true, useUnifiedTopology: true };

mongo.connect(dbUri, options, (err, client) => {
  if (err) { log(chalk.red(err)); return; }
  db = client.db(dbName);
});

exports.createPod = async name => {
  console.log(`Create Pod: ${name}`);
  if (!name) return;
  const collection = db.collection('pods');

  collection.insertOne({ name: name }, (err, result) => {
    console.log(result);
    if (!err) log(chalk.blue(`Created new pod ${name}`));
    else log(chalk.red(err));
  });
}
