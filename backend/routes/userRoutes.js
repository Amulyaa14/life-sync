const express = require('express');
const router = express.Router();
const { getUserProfile, uploadAvatar } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/profile', protect, getUserProfile);
router.post('/upload-avatar', protect, upload.single('avatar'), uploadAvatar);

module.exports = router;
