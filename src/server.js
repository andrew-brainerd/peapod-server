require('dotenv').config();
const express = require('express');
const passport = require('passport');
const errorHandler = require('errorhandler');
const log = require('./utils/log');

const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 5000;

const app = express();

app.use(express.json());

if (!isProduction) {
  app.use(errorHandler());
}

require('./config/passport');
app.use(passport.initialize());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use((req, res, next) => {
  res.sendMissingParam = param =>
    res.status(400).send({
      error: `Missing required param: [${param}]`
    });
  res.sendAlreadyExists = ({ entity = 'Entity', property = 'property', value = 'value' }) =>
    res.status(400).send({
      error: `${entity} with ${property} [${value}] already exists`
    });
  next();
});

app.use('/', require('./routes'));

app.listen(port, () => log.info(`Listening on port ${port}`));
