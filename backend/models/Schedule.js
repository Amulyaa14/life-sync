const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const Schedule = sequelize.define('Schedule', {
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    blocks: {
        type: DataTypes.JSON, // stores array of objects
        allowNull: false,
        defaultValue: []
    }
}, {
    timestamps: true
});

User.hasMany(Schedule, { foreignKey: 'userId', as: 'schedules' });
Schedule.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = Schedule;
