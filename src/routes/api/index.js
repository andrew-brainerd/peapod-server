const express = require('express');
const router = express.Router();
const { PODS_ROUTE, USERS_ROUTE } = require('../../constants/routes');

router.use(PODS_ROUTE, require('./pods'));
router.use(USERS_ROUTE, require('./users'));

module.exports = router;
