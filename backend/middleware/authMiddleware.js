// Mock Auth Middleware
// For development, we'll create a dummy user or pass a user ID
const User = require('../models/User');

const protect = async (req, res, next) => {
    try {
        // In a real app, verify JWT here.
        // We will just find the first user in the DB and use that, or create one if none exists.
        let user = await User.findOne();
        if (!user) {
            user = await User.create({ name: 'Test User', email: 'test@example.com', password: 'password123' });
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

module.exports = { protect };
