const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  exportUserCredentials,
  resetUserPassword
} = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Apply PM role middleware to all routes
router.use(roleMiddleware('pm'));

// @route   GET /api/users
// @desc    Get all users with filtering and pagination
// @access  Private (PM only)
router.get('/', getAllUsers);

// @route   GET /api/users/export/credentials
// @desc    Export user credentials
// @access  Private (PM only)
router.get('/export/credentials', exportUserCredentials);

// @route   GET /api/users/:id
// @desc    Get single user by ID
// @access  Private (PM only)
router.get('/:id', getUserById);

// @route   POST /api/users
// @desc    Create new user
// @access  Private (PM only)
router.post('/', createUser);

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (PM only)
router.put('/:id', updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private (PM only)
router.delete('/:id', deleteUser);

// @route   POST /api/users/:id/reset-password
// @desc    Reset user password
// @access  Private (PM only)
router.post('/:id/reset-password', resetUserPassword);

module.exports = router;
