var api = require('express').Router();

api.use('/api', require('./api'));

module.exports = api;
