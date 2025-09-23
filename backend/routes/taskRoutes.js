const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/enhancedFileUpload');
const {
  createTask,
  getTasksByCustomer,
  getTask,
  updateTask,
  copyTask,
  deleteTask,
  getTeamMembersForTask,
  getAllTasks,
  getTaskStats,
  addTaskComment,
  deleteTaskComment
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
  body('customer')
    .isMongoId()
    .withMessage('Valid customer ID is required'),
  body('sequence')
    .isInt({ min: 1 })
    .withMessage('Sequence must be a positive integer'),
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
router.post('/', authorize('pm'), upload.array('attachments', 10), validateTask, createTask);

// @route   POST /api/tasks/:taskId/copy
// @desc    Copy an existing task
// @access  Private (PM only)
router.post('/:taskId/copy', authorize('pm'), copyTask);

// @route   GET /api/tasks
// @desc    Get all tasks with filtering and pagination
// @access  Private
router.get('/', getAllTasks);

// @route   GET /api/tasks/stats
// @desc    Get task statistics
// @access  Private
router.get('/stats', getTaskStats);

// @route   GET /api/tasks/customer/:customerId
// @desc    Get tasks for a customer
// @access  Private
router.get('/customer/:customerId', getTasksByCustomer);

// @route   GET /api/tasks/team/:customerId
// @desc    Get team members for task assignment
// @access  Private
router.get('/team/:customerId', getTeamMembersForTask);

// @route   POST /api/tasks/:taskId/comments
// @desc    Add comment to task
// @access  Private
router.post('/:taskId/comments', addTaskComment);

// @route   DELETE /api/tasks/:taskId/comments/:commentId
// @desc    Delete comment from task
// @access  Private
router.delete('/:taskId/comments/:commentId', deleteTaskComment);

// @route   GET /api/tasks/:taskId/customer/:customerId
// @desc    Get single task
// @access  Private
router.get('/:taskId/customer/:customerId', getTask);

// @route   PUT /api/tasks/:taskId/customer/:customerId
// @desc    Update task
// @access  Private (PM only)
router.put('/:taskId/customer/:customerId', authorize('pm'), upload.array('attachments', 10), validateTask, updateTask);

// @route   DELETE /api/tasks/:taskId/customer/:customerId
// @desc    Delete task
// @access  Private (PM only)
router.delete('/:taskId/customer/:customerId', authorize('pm'), deleteTask);

module.exports = router;
