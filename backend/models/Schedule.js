const mongoose = require('mongoose');

const ScheduleBlockSchema = new mongoose.Schema({
    title: String,
    startTime: String, // e.g. '06:00'
    endTime: String,   // e.g. '08:00'
    type: {
        type: String,
        enum: ['study', 'health', 'rest', 'personal', 'work', 'other'],
        default: 'other'
    }
});

const ScheduleSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    blocks: [ScheduleBlockSchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Schedule', ScheduleSchema);
