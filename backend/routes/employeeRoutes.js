const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { protect, authorize } = require('../middlewares/authMiddleware');
const {
  getEmployeeDashboard,
  getEmployeeCustomers,
  getEmployeeCustomerDetails,
  getEmployeeTasks,
  getEmployeeTask,
  updateTaskStatus,
  getEmployeeActivity,
  getEmployeeFiles,
  addTaskComment,
  deleteTaskComment,
  addSubtaskComment,
  deleteSubtaskComment
} = require('../controllers/employeeController');

// Validation middleware
const validateTaskStatus = [
  body('status')
    .isIn(['pending', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Status must be pending, in-progress, completed, or cancelled')
];

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

const validateTaskId = [
  param('id')
    .isMongoId()
    .withMessage('Valid task ID is required')
];

const validateCommentId = [
  param('commentId')
    .isMongoId()
    .withMessage('Valid comment ID is required')
];

const validateComment = [
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters'),
  (req, res, next) => {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

const validateCustomerId = [
  param('id')
    .isMongoId()
    .withMessage('Valid customer ID is required')
];

const validateQueryParams = [
  query('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed', 'cancelled', 'planning', 'active', 'on-hold'])
    .withMessage('Invalid status filter'),
  
  query('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Invalid priority filter'),
  
  query('customerId')
    .optional()
    .isMongoId()
    .withMessage('Invalid customer ID'),
  
  query('taskId')
    .optional()
    .isMongoId()
    .withMessage('Invalid task ID'),
  
  query('type')
    .optional()
    .isString()
    .withMessage('Type must be a string')
];

// All routes are protected and require employee role
router.use(protect);
router.use(authorize('employee'));

// @route   GET /api/employee/dashboard
// @desc    Get employee dashboard data
// @access  Private (Employee only)
router.get('/dashboard', getEmployeeDashboard);

// @route   GET /api/employee/customers
// @desc    Get employee assigned customers
// @access  Private (Employee only)
router.get('/customers', 
  validatePagination,
  validateQueryParams,
  getEmployeeCustomers
);

// @route   GET /api/employee/customers/:id
// @desc    Get employee customer details
// @access  Private (Employee only)
router.get('/customers/:id', 
  validateCustomerId,
  getEmployeeCustomerDetails
);

// @route   GET /api/employee/tasks
// @desc    Get employee tasks
// @access  Private (Employee only)
router.get('/tasks', 
  validatePagination,
  validateQueryParams,
  getEmployeeTasks
);

// @route   GET /api/employee/tasks/:id
// @desc    Get employee task details
// @access  Private (Employee only)
router.get('/tasks/:id', 
  validateTaskId,
  getEmployeeTask
);

// @route   PUT /api/employee/tasks/:id/status
// @desc    Update task status
// @access  Private (Employee only)
router.put('/tasks/:id/status', 
  validateTaskId,
  validateTaskStatus,
  updateTaskStatus
);

// @route   GET /api/employee/activity
// @desc    Get employee activity
// @access  Private (Employee only)
router.get('/activity', 
  validatePagination,
  validateQueryParams,
  getEmployeeActivity
);

// Subtask-centric endpoints
router.get('/subtasks',
  validatePagination,
  validateQueryParams,
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10, status, priority, customerId, taskId } = req.query;

      // Build query for subtasks assigned to this employee
      const query = { assignedTo: userId };
      if (status) query.status = status;
      if (priority) query.priority = priority;
      if (customerId) query.customer = customerId;
      if (taskId) query.task = taskId;

      const skip = (page - 1) * limit;
      const Subtask = require('../models/Subtask');

      const subtasks = await Subtask.find(query)
        .populate('customer', 'name')
        .populate('task', 'title')
        .populate('assignedTo', 'fullName email avatar')
        .sort({ dueDate: 1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Subtask.countDocuments(query);

      res.json({
        success: true,
        data: {
          subtasks,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / limit),
            total
          }
        }
      });
    } catch (err) { next(err); }
  }
);

router.get('/subtasks/:id',
  validateTaskId,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const Subtask = require('../models/Subtask');

      const subtask = await Subtask.findOne({ _id: id, assignedTo: userId })
        .populate('customer', 'name')
        .populate('task', 'title')
        .populate('assignedTo', 'fullName email avatar')
        .populate('createdBy', 'fullName email avatar')
        .populate('completedBy', 'fullName email avatar');

      if (!subtask) {
        return res.status(404).json({ success: false, message: 'Subtask not found or access denied' });
      }

      res.json({ success: true, data: { subtask } });
    } catch (err) { next(err); }
  }
);

router.put('/subtasks/:id/status',
  validateTaskId,
  validateTaskStatus,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user.id;
      const Subtask = require('../models/Subtask');

      const subtask = await Subtask.findOne({ _id: id, assignedTo: userId });
      if (!subtask) {
        return res.status(404).json({ success: false, message: 'Subtask not found or access denied' });
      }

      const oldStatus = subtask.status;
      subtask.status = status;
      if (status === 'completed' && oldStatus !== 'completed') {
        subtask.completedAt = new Date();
        subtask.completedBy = userId;
      } else if (status !== 'completed' && oldStatus === 'completed') {
        subtask.completedAt = null;
        subtask.completedBy = null;
      }

      await subtask.save();
      res.json({ success: true, message: 'Subtask status updated', data: subtask });
    } catch (err) { next(err); }
  }
);

// @route   GET /api/employee/files
// @desc    Get employee files
// @access  Private (Employee only)
router.get('/files', 
  validatePagination,
  validateQueryParams,
  getEmployeeFiles
);

// @route   POST /api/employee/tasks/:id/comments
// @desc    Add comment to task
// @access  Private (Employee only)
router.post('/tasks/:id/comments', 
  validateTaskId,
  validateComment,
  addTaskComment
);

// @route   DELETE /api/employee/tasks/:id/comments/:commentId
// @desc    Delete task comment
// @access  Private (Employee only)
router.delete('/tasks/:id/comments/:commentId', 
  validateTaskId,
  validateCommentId,
  deleteTaskComment
);

// @route   POST /api/employee/subtasks/:id/comments
// @desc    Add comment to subtask
// @access  Private (Employee only)
router.post('/subtasks/:id/comments', 
  validateTaskId,
  validateComment,
  addSubtaskComment
);

// @route   DELETE /api/employee/subtasks/:id/comments/:commentId
// @desc    Delete subtask comment
// @access  Private (Employee only)
router.delete('/subtasks/:id/comments/:commentId', 
  validateTaskId,
  validateCommentId,
  deleteSubtaskComment
);

module.exports = router;