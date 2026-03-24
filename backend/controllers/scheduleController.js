const Routine = require('../models/Routine');
const Schedule = require('../models/Schedule');
const Task = require('../models/Task');
const { generateSchedule } = require('../utils/scheduleGenerator');
const { rescheduleScheduleReminders } = require('../utils/reminderScheduler');

const normalizeReminderMinutes = (value) => {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed < 0) return 10;
    return parsed;
};

const withReminderDefaults = (blocks) => {
    if (!Array.isArray(blocks)) return [];

    return blocks.map((block) => {
        const reminder = block && block.reminder ? block.reminder : {};

        return {
            ...block,
            reminder: {
                enabled: reminder.enabled !== false,
                minutesBefore: normalizeReminderMinutes(reminder.minutesBefore),
            },
        };
    });
};

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
        const blocks = withReminderDefaults(generateSchedule(rawText, pendingTasks));

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

        await rescheduleScheduleReminders(schedule);

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

exports.updateScheduleReminder = async (req, res) => {
    try {
        const { blockIndex, enabled, minutesBefore, date } = req.body;

        const targetDate = date ? new Date(date) : new Date();
        targetDate.setHours(0, 0, 0, 0);

        const schedule = await Schedule.findOne({ where: { userId: req.user.id, date: targetDate } });
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found for selected date.' });
        }

        const blocks = withReminderDefaults(schedule.blocks);

        if (
            Number.isInteger(blockIndex) === false ||
            blockIndex < 0 ||
            blockIndex >= blocks.length
        ) {
            return res.status(400).json({ message: 'Invalid block index.' });
        }

        const nextEnabled = enabled !== false;
        const nextMinutesBefore = normalizeReminderMinutes(minutesBefore);

        blocks[blockIndex] = {
            ...blocks[blockIndex],
            reminder: {
                enabled: nextEnabled,
                minutesBefore: nextMinutesBefore,
            },
        };

        schedule.blocks = blocks;
        await schedule.save();
        await rescheduleScheduleReminders(schedule);

        return res.json({ schedule });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
