const express = require('express');
const router = express.Router();
const { createRoutineAndSchedule, getSchedule } = require('../controllers/scheduleController');

// Define routes
router.route('/').get(getSchedule).post(createRoutineAndSchedule);

module.exports = router;
