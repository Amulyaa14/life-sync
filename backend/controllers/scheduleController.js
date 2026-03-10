const Routine = require('../models/Routine');
const Schedule = require('../models/Schedule');
const Task = require('../models/Task');
const { generateSchedule } = require('../utils/scheduleGenerator');

exports.createRoutineAndSchedule = async (req, res) => {
    try {
        const { rawText, date } = req.body;

        // 1. Save or update routine
        let routine = await Routine.findOne({ where: { userId: req.user.id } });
        if (routine) {
            routine.rawText = rawText;
            await routine.save();
        } else {
            routine = await Routine.create({ userId: req.user.id, rawText });
        }

        // 2. Fetch unfinished tasks to pass to the Generator
        const pendingTasks = await Task.findAll({
            where: { userId: req.user.id, completed: false }
        });

        // 3. Parse text and generate schedule blocks with suggestions
        const blocks = generateSchedule(rawText, pendingTasks);

        // 4. Save Schedule for the given date (or today)
        const targetDate = date ? new Date(date) : new Date();
        targetDate.setHours(0, 0, 0, 0);

        let schedule = await Schedule.findOne({ where: { userId: req.user.id, date: targetDate } });
        if (schedule) {
            schedule.blocks = blocks;
            await schedule.save();
        } else {
            schedule = await Schedule.create({
                userId: req.user.id,
                date: targetDate,
                blocks
            });
        }

        res.status(201).json({ routine, schedule });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getSchedule = async (req, res) => {
    try {
        const targetDate = req.query.date ? new Date(req.query.date) : new Date();
        targetDate.setHours(0, 0, 0, 0);

        const schedule = await Schedule.findOne({ where: { userId: req.user.id, date: targetDate } });
        res.json(schedule || { blocks: [] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
