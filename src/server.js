require('dotenv').config();
const express = require('express');
const log = require('./utils/log');

const app = express();
const port = process.env.PORT || 5000;
const version = process.env.API_VERSION;

const pods = require('./api/pods');

app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.post('/api', (req, res) => {
  res.send({
    message: `Welcome to the Peapod API ${version}!`
  });
});

app.get('/api', (req, res) => {
  res.send({
    message: `Welcome to the Peapod API ${version}!`
  });
});

app.post('/api/pods', async (req, res) => {
  const name = (req.body || {}).name;
  pods.createPod(res, name);
});

app.get('/api/pods', async (req, res) => {
  const { pageNum, pageSize } = req.query;
  pods.getPods(res, pageNum, pageSize);
});

app.listen(port, () => log.info(`Listening on port ${port}`));
