require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, sequelize } = require('./config/db');
const { initializeTodayReminders } = require('./utils/reminderScheduler');

// Connect to Database
connectDB();

// Initialize Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const { protect } = require('./middleware/authMiddleware');

// Mount Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/tasks', protect, require('./routes/taskRoutes'));
app.use('/api/health', protect, require('./routes/healthRoutes'));
app.use('/api/schedule', protect, require('./routes/scheduleRoutes'));
app.use('/api/analytics', protect, require('./routes/analyticsRoutes'));
app.use('/api/notifications', protect, require('./routes/notificationRoutes'));

// Basic Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Start Server after syncing models
const PORT = process.env.PORT || 5000;
sequelize.sync().then(() => {
    initializeTodayReminders().catch((error) => {
        console.error('Failed to initialize reminders: ' + error.message);
    });
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to sync db: ' + err.message);
});
