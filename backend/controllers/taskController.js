const Task = require('../models/Task');

// Get all tasks for user
exports.getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a task
exports.createTask = async (req, res) => {
    try {
        const task = new Task({
            ...req.body,
            user: req.user._id
        });
        const createdTask = await task.save();
        res.status(201).json(createdTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a task (e.g. mark complete)
exports.updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        if (task.user.toString() !== req.user._id.toString()) return res.status(401).json({ message: 'Not authorized' });

        const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a task
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        if (task.user.toString() !== req.user._id.toString()) return res.status(401).json({ message: 'Not authorized' });

        await task.deleteOne();
        res.json({ message: 'Task removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
