const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const HealthLog = sequelize.define('HealthLog', {
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    waterIntake: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    sleepHours: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    exerciseMinutes: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    mood: {
        type: DataTypes.ENUM('Great', 'Good', 'Okay', 'Bad', 'Terrible'),
        defaultValue: 'Good'
    },
    journalEntry: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ''
    }
}, {
    timestamps: true
});

User.hasMany(HealthLog, { foreignKey: 'userId', as: 'healthLogs' });
HealthLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = HealthLog;
