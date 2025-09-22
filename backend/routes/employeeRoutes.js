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