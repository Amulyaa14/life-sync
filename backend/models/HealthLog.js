const mongoose = require('mongoose');

const HealthLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    waterIntake: {
        type: Number, // in glasses or ml
        default: 0
    },
    exerciseMinutes: {
        type: Number,
        default: 0
    },
    sleepHours: {
        type: Number,
        default: 0
    },
    mood: {
        type: String,
        enum: ['Great', 'Good', 'Okay', 'Bad', 'Terrible'],
        default: 'Okay'
    }
});

module.exports = mongoose.model('HealthLog', HealthLogSchema);
