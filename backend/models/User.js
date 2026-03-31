const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    avatarUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
    }
}, {
    timestamps: true
});

module.exports = User;
