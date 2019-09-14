require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require("express-session");
const passport = require('passport');
const log = require('./utils/log');

const app = express();

const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 5000;
const version = process.env.API_VERSION;

const { ROOT_ROUTE, PODS_ROUTE } = require('./constants/routes');
const pods = require('./routes/api/pods');

app.use(express.json());
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: 'peas'
}));

require('./config/passport');
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.post(ROOT_ROUTE, passport.authenticate('local'), (req, res) => {
  res.send({
    message: `Welcome to the Peapod API ${version}!`
  });
});

app.get(ROOT_ROUTE, (req, res) => {
  res.send({
    message: `Welcome to the Peapod API ${version}!`
  });
});

app.post(PODS_ROUTE, async (req, res) => {
  const name = (req.body || {}).name;
  pods.createPod(res, name);
});

app.get(PODS_ROUTE, async (req, res) => {
  const { pageNum, pageSize } = req.query;
  pods.getPods(res, pageNum, pageSize);
});

app.listen(port, () => log.info(`Listening on port ${port}`));
