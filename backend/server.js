require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const { protect } = require('./middleware/authMiddleware');

// Mount Routes
app.use('/api/tasks', protect, require('./routes/taskRoutes'));
app.use('/api/health', protect, require('./routes/healthRoutes'));
app.use('/api/schedule', protect, require('./routes/scheduleRoutes'));
app.use('/api/analytics', protect, require('./routes/analyticsRoutes'));

// Basic Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));
