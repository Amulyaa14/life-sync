const HealthLog = require('../models/HealthLog');

// Get today's health log for user
exports.getTodayHealthLog = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let log = await HealthLog.findOne({
            user: req.user._id,
            date: { $gte: today }
        });

        if (!log) {
            log = new HealthLog({ user: req.user._id, date: new Date() });
            await log.save();
        }

        res.json(log);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update health log
exports.updateHealthLog = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let log = await HealthLog.findOne({
            user: req.user._id,
            date: { $gte: today }
        });

        if (!log) {
            log = new HealthLog({ user: req.user._id, date: new Date(), ...req.body });
        } else {
            if (req.body.waterIntake !== undefined) log.waterIntake = req.body.waterIntake;
            if (req.body.exerciseMinutes !== undefined) log.exerciseMinutes = req.body.exerciseMinutes;
            if (req.body.sleepHours !== undefined) log.sleepHours = req.body.sleepHours;
            if (req.body.mood !== undefined) log.mood = req.body.mood;
        }

        const updatedLog = await log.save();
        res.json(updatedLog);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
