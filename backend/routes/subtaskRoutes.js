const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  createSubtask,
  getSubtasksByTask,
  getSubtask,
  updateSubtask,
  deleteSubtask,
  getSubtaskStats
} = require('../controllers/subtaskController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/enhancedFileUpload');

// Validation middleware for subtask creation/update
const validateSubtask = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Subtask title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Subtask description cannot exceed 1000 characters'),
  body('task')
    .isMongoId()
    .withMessage('Valid task ID is required'),
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

// Apply authentication to all routes
router.use(protect);

// @route   POST /api/subtasks
// @desc    Create a new subtask
// @access  Private (PM only)
router.post('/', 
  authorize('pm'),
  upload.array('attachments', 10),
  validateSubtask,
  createSubtask
);

// @route   GET /api/subtasks/stats
// @desc    Get subtask statistics
// @access  Private
router.get('/stats', getSubtaskStats);

// @route   GET /api/subtasks/task/:taskId/customer/:customerId
// @desc    Get subtasks for a task
// @access  Private
router.get('/task/:taskId/customer/:customerId', getSubtasksByTask);

// @route   GET /api/subtasks/:subtaskId/customer/:customerId
// @desc    Get single subtask
// @access  Private
router.get('/:subtaskId/customer/:customerId', getSubtask);

// @route   PUT /api/subtasks/:subtaskId/customer/:customerId
// @desc    Update subtask
// @access  Private (PM only)
router.put('/:subtaskId/customer/:customerId', 
  authorize('pm'),
  upload.array('attachments', 10),
  validateSubtask,
  updateSubtask
);

// @route   DELETE /api/subtasks/:subtaskId/customer/:customerId
// @desc    Delete subtask
// @access  Private (PM only)
router.delete('/:subtaskId/customer/:customerId', 
  authorize('pm'),
  deleteSubtask
);

module.exports = router;
