const express = require('express');
const router = express.Router();
const { createRoutineAndSchedule, getSchedule, updateScheduleReminder } = require('../controllers/scheduleController');

// Define routes
router.route('/').get(getSchedule).post(createRoutineAndSchedule);
router.route('/reminders').put(updateScheduleReminder);

module.exports = router;
