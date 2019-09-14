require('dotenv').config();
const db = require('./data');
const express = require('express');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.post('/api', (req, res) => {
  res.send({
    message: 'Welcome to the Peapod API!'
  });
});

app.get('/api', (req, res) => {
  res.send({
    message: 'Welcome to the Peapod API!'
  });
});

app.post('/api/pods', async (req, res) => {
  const name = (req.body || {}).name;

  console.log(`DB: %o`, db);
  
  if (!!name) {
    db.createPod(name).then(pod => {
      console.log(pod);
      res.send({
        message: `Added new pod ${name}`,
        pod: pod || 'none'
      });
    });
  } else {
    res.status(400).send({
      message: `Failed to add pod ${name}`
    });
  }
});

app.listen(port, () => console.log(`Listening on port ${port}`));
