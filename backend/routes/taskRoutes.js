const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { uploadMultiple } = require('../middlewares/uploadMiddleware');
const {
  createTask,
  getTasksByMilestone,
  getTask,
  updateTask,
  deleteTask,
  getTeamMembersForTask,
  getAllTasks,
  getTaskStats
} = require('../controllers/taskController');

const router = express.Router();

// Validation middleware for task creation/update
const validateTask = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Task title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Task description cannot exceed 1000 characters'),
  body('milestone')
    .isMongoId()
    .withMessage('Valid milestone ID is required'),
  body('project')
    .isMongoId()
    .withMessage('Valid project ID is required'),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Status must be pending, in-progress, completed, or cancelled'),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Priority must be low, normal, high, or urgent'),
  body('assignedTo')
    .optional()
    .isArray()
    .withMessage('Assigned users must be an array'),
  body('assignedTo.*')
    .optional()
    .isMongoId()
    .withMessage('Each assigned user must be a valid user ID'),
  body('dueDate')
    .isISO8601()
    .withMessage('Valid due date is required')
];

// All routes are protected
router.use(protect);

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private (PM only)
router.post('/', authorize('pm'), uploadMultiple('attachments', 10), validateTask, createTask);

// @route   GET /api/tasks
// @desc    Get all tasks with filtering and pagination
// @access  Private
router.get('/', getAllTasks);

// @route   GET /api/tasks/stats
// @desc    Get task statistics
// @access  Private
router.get('/stats', getTaskStats);

// @route   GET /api/tasks/milestone/:milestoneId/project/:projectId
// @desc    Get tasks for a milestone
// @access  Private
router.get('/milestone/:milestoneId/project/:projectId', getTasksByMilestone);

// @route   GET /api/tasks/:taskId/project/:projectId
// @desc    Get single task
// @access  Private
router.get('/:taskId/project/:projectId', getTask);

// @route   PUT /api/tasks/:taskId/project/:projectId
// @desc    Update task
// @access  Private (PM only)
router.put('/:taskId/project/:projectId', authorize('pm'), uploadMultiple('attachments', 10), validateTask, updateTask);

// @route   DELETE /api/tasks/:taskId/project/:projectId
// @desc    Delete task
// @access  Private (PM only)
router.delete('/:taskId/project/:projectId', authorize('pm'), deleteTask);

// @route   GET /api/tasks/team/:projectId
// @desc    Get team members for task assignment
// @access  Private
router.get('/team/:projectId', getTeamMembersForTask);

module.exports = router;
