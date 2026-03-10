const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const Routine = sequelize.define('Routine', {
    rawText: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }
}, {
    timestamps: true
});

User.hasOne(Routine, { foreignKey: 'userId', as: 'routine' });
Routine.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = Routine;
