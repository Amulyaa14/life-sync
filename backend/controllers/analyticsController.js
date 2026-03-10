const Schedule = require('../models/Schedule');
const Task = require('../models/Task');
const HealthLog = require('../models/HealthLog');

exports.getAnalytics = async (req, res) => {
    try {
        const userId = req.user._id;

        // Get date 7 days ago
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        oneWeekAgo.setHours(0, 0, 0, 0);

        // 1. Weekly Productivity (Tasks Completed per Day)
        const taskLogs = await Task.aggregate([
            { $match: { user: userId, completed: true, updatedAt: { $gte: oneWeekAgo } } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        // 2. Study Hours (Total study duration per day from Schedule)
        const scheduleLogs = await Schedule.find({ user: userId, date: { $gte: oneWeekAgo } });

        // Process block durations manually since they are strings like "06:00" - "08:00"
        const studyHoursByDate = {};
        scheduleLogs.forEach(schedule => {
            const dateStr = schedule.date.toISOString().split('T')[0];
            let studyMins = 0;
            schedule.blocks.forEach(block => {
                if (block.type === 'study') {
                    const startParts = block.startTime.split(':');
                    const endParts = block.endTime.split(':');
                    if (startParts.length === 2 && endParts.length === 2) {
                        const startMins = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
                        const endMins = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
                        studyMins += Math.max(0, endMins - startMins);
                    }
                }
            });
            studyHoursByDate[dateStr] = (studyMins / 60).toFixed(1);
        });

        // 3. Health Statistics (Averages over last 7 days)
        const healthLogs = await HealthLog.find({ user: userId, date: { $gte: oneWeekAgo } });
        let totalWater = 0, totalSleep = 0, totalExercise = 0;

        healthLogs.forEach(log => {
            totalWater += log.waterIntake || 0;
            totalSleep += log.sleepHours || 0;
            totalExercise += log.exerciseMinutes || 0;
        });

        const daysCount = Math.max(1, healthLogs.length);
        const healthAvgs = {
            water: (totalWater / daysCount).toFixed(1),
            sleep: (totalSleep / daysCount).toFixed(1),
            exercise: (totalExercise / daysCount).toFixed(1)
        };

        res.json({
            productivity: taskLogs,
            studyHours: studyHoursByDate,
            health: healthAvgs
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
