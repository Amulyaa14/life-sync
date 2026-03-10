const Task = require('../models/Task');
const { Op } = require('sequelize');

// Get all tasks for user — also auto-generates recurring tasks if needed
exports.getTasks = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const dayOfWeek = new Date().getDay(); // 0=Sun, 1=Mon, ...

        // Find recurring tasks that need to be re-created today
        const recurringTasks = await Task.findAll({
            where: {
                userId: req.user.id,
                recurring: { [Op.in]: ['Daily', 'Weekly'] },
                lastRecurDate: { [Op.or]: [{ [Op.lt]: today }, { [Op.is]: null }] }
            }
        });

        for (const task of recurringTasks) {
            const shouldRecur = task.recurring === 'Daily' ||
                (task.recurring === 'Weekly' && dayOfWeek === new Date(task.createdAt).getDay());

            if (shouldRecur) {
                // Create a fresh copy of the task for today
                await Task.create({
                    title: task.title,
                    category: task.category,
                    priority: task.priority,
                    recurring: task.recurring,
                    lastRecurDate: today,
                    userId: req.user.id,
                    completed: false
                });
                // Mark the template task as last run today
                await task.update({ lastRecurDate: today });
            }
        }

        const tasks = await Task.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a task
exports.createTask = async (req, res) => {
    try {
        const createdTask = await Task.create({
            ...req.body,
            userId: req.user.id
        });
        res.status(201).json(createdTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a task (e.g. mark complete)
exports.updateTask = async (req, res) => {
    try {
        const task = await Task.findByPk(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        if (task.userId !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

        await task.update(req.body);
        res.json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a task
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findByPk(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        if (task.userId !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

        await task.destroy();
        res.json({ message: 'Task removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
