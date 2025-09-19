const express = require('express');
const router = express.Router();
const {
  getCurrentProfile,
  updateProfile,
  uploadProfileImage,
  deleteProfileImage,
  changePassword,
  getUserProfileById,
  updateUserProfileById
} = require('../controllers/profileController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { uploadProfileImage: uploadProfileImageMiddleware } = require('../middlewares/profileUploadMiddleware');

// Apply authentication middleware to all routes
router.use(protect);

// ==================== CURRENT USER PROFILE ROUTES ====================
// These routes are for users to manage their own profiles

// @route   GET /api/profile
// @desc    Get current user's profile
// @access  Private (All authenticated users)
router.get('/', getCurrentProfile);

// @route   PUT /api/profile
// @desc    Update current user's profile
// @access  Private (All authenticated users)
router.put('/', updateProfile);

// @route   POST /api/profile/image
// @desc    Upload profile image
// @access  Private (All authenticated users)
router.post('/image', uploadProfileImageMiddleware, uploadProfileImage);

// @route   DELETE /api/profile/image
// @desc    Delete profile image
// @access  Private (All authenticated users)
router.delete('/image', deleteProfileImage);

// @route   PUT /api/profile/password
// @desc    Change password
// @access  Private (All authenticated users)
router.put('/password', changePassword);

// ==================== PM-ONLY USER MANAGEMENT ROUTES ====================
// These routes are for PMs to manage other users' profiles

// @route   GET /api/profile/:id
// @desc    Get user profile by ID
// @access  Private (PM only)
router.get('/:id', roleMiddleware('pm'), getUserProfileById);

// @route   PUT /api/profile/:id
// @desc    Update user profile by ID
// @access  Private (PM only)
router.put('/:id', roleMiddleware('pm'), updateUserProfileById);

module.exports = router;
