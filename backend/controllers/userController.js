const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    const user = await User.findByPk(req.user.id);
    if (user) {
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Update user profile picture
// @route   POST /api/users/upload-avatar
// @access  Private
const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }

        const user = await User.findByPk(req.user.id);
        if (user) {
            // req.file.path contains the Cloudinary URL
            user.avatarUrl = req.file.path;
            await user.save();
            res.json({
                message: 'Avatar uploaded successfully',
                avatarUrl: user.avatarUrl
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error uploading avatar', error: error.message });
    }
};

module.exports = {
    getUserProfile,
    uploadAvatar
};
