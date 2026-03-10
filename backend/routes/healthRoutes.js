const express = require('express');
const router = express.Router();
const { getTodayHealthLog, updateHealthLog } = require('../controllers/healthController');

// Define routes
router.route('/').get(getTodayHealthLog).put(updateHealthLog);

module.exports = router;
