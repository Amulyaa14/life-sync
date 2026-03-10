const express = require('express');
const router = express.Router();
const { getAnalytics } = require('../controllers/analyticsController');

router.route('/').get(getAnalytics);

module.exports = router;
