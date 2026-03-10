const HealthLog = require('../models/HealthLog');
const { Op } = require('sequelize');

// Get today's health log for user
exports.getTodayHealthLog = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let log = await HealthLog.findOne({
            where: {
                userId: req.user.id,
                date: { [Op.gte]: today }
            }
        });

        if (!log) {
            log = await HealthLog.create({ userId: req.user.id, date: new Date() });
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
            where: {
                userId: req.user.id,
                date: { [Op.gte]: today }
            }
        });

        if (!log) {
            log = await HealthLog.create({ userId: req.user.id, date: new Date(), ...req.body });
        } else {
            await log.update(req.body);
        }

        res.json(log);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
