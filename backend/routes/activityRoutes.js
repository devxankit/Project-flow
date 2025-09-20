const express = require('express');
const router = express.Router();
const {
  getActivities,
  getProjectActivities,
  getActivityStats,
  createNewActivity,
  getActivityById
} = require('../controllers/activityController');
const { protect } = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware');

// All routes are protected
router.use(protect);

// @route   GET /api/activities
// @desc    Get activities for current user based on their role
// @access  Private (All roles)
router.get('/', getActivities);

// @route   GET /api/activities/stats
// @desc    Get activity statistics for current user
// @access  Private (All roles)
router.get('/stats', getActivityStats);

// @route   GET /api/activities/project/:projectId
// @desc    Get activities for a specific project
// @access  Private (All roles with project access)
router.get('/project/:projectId', getProjectActivities);

// @route   GET /api/activities/:id
// @desc    Get a specific activity by ID
// @access  Private (All roles with activity access)
router.get('/:id', getActivityById);

// @route   POST /api/activities
// @desc    Create a new activity (manual creation)
// @access  Private (PM only)
router.post('/', requireRole(['pm']), createNewActivity);

module.exports = router;
