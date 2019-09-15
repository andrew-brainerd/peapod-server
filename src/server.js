require('dotenv').config();
const express = require('express');
const session = require("express-session");
const passport = require('passport');
const errorHandler = require('errorhandler');
const log = require('./utils/log');

const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 5000;

const app = express();

app.use(express.json());
app.use(session({
  cookie: { maxAge: 60000 },
  resave: false,
  saveUninitialized: false,
  secret: 'peas'
}));

if(!isProduction) {
  app.use(errorHandler());
}

require('./config/passport');
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use('/', require('./routes'));

app.listen(port, () => log.info(`Listening on port ${port}`));
