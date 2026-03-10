const Schedule = require('../models/Schedule');
const Task = require('../models/Task');
const HealthLog = require('../models/HealthLog');
const { Op } = require('sequelize');

exports.getAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        oneWeekAgo.setHours(0, 0, 0, 0);

        // 1. Weekly Productivity
        const completedTasks = await Task.findAll({
            where: { userId, completed: true, updatedAt: { [Op.gte]: oneWeekAgo } }
        });

        const prodMap = {};
        completedTasks.forEach(task => {
            const dateStr = task.updatedAt.toISOString().split('T')[0];
            prodMap[dateStr] = (prodMap[dateStr] || 0) + 1;
        });

        const taskLogs = Object.keys(prodMap).map(date => ({ _id: date, count: prodMap[date] }));
        taskLogs.sort((a, b) => a._id.localeCompare(b._id));

        // 2. Study Hours (Total study duration per day from Schedule)
        const scheduleLogs = await Schedule.findAll({
            where: { userId, date: { [Op.gte]: oneWeekAgo } }
        });

        const studyHoursByDate = {};
        scheduleLogs.forEach(schedule => {
            const dateStr = typeof schedule.date === 'string' ? schedule.date : schedule.date.toISOString().split('T')[0];
            let studyMins = 0;
            const blocks = Array.isArray(schedule.blocks) ? schedule.blocks : JSON.parse(schedule.blocks || "[]");
            blocks.forEach(block => {
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

        // 3. Health Statistics
        const healthLogs = await HealthLog.findAll({
            where: { userId, date: { [Op.gte]: oneWeekAgo } }
        });

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
