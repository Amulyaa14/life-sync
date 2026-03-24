const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const PushSubscription = sequelize.define('PushSubscription', {
    endpoint: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    subscription: {
        type: DataTypes.JSON,
        allowNull: false,
    },
}, {
    timestamps: true,
});

User.hasMany(PushSubscription, { foreignKey: 'userId', as: 'pushSubscriptions' });
PushSubscription.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = PushSubscription;
