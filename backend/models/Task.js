const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User'); // need to establish relationships

const Task = sequelize.define('Task', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    category: {
        type: DataTypes.STRING,
        defaultValue: 'Other'
    },
    priority: {
        type: DataTypes.ENUM('Low', 'Medium', 'High'),
        defaultValue: 'Medium'
    },
    recurring: {
        type: DataTypes.ENUM('None', 'Daily', 'Weekly'),
        defaultValue: 'None'
    },
    lastRecurDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    }
}, {
    timestamps: true
});

// Relationships
User.hasMany(Task, { foreignKey: 'userId', as: 'tasks' });
Task.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = Task;
