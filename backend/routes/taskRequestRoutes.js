const express = require('express');
const { body } = require('express-validator');
const {
  createTaskRequest,
  getCustomerTaskRequests,
  getTaskRequestDetails,
  updateTaskRequest,
  cancelTaskRequest,
  getPMTaskRequests,
  reviewTaskRequest
} = require('../controllers/taskRequestController');
const { protect } = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/roleMiddleware');

const router = express.Router();

// Validation middleware
const validateTaskRequest = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage('Description must be between 20 and 1000 characters'),
  body('customer')
    .isMongoId()
    .withMessage('Valid customer ID is required'),
  body('task')
    .isMongoId()
    .withMessage('Valid task ID is required'),
  body('priority')
    .isIn(['Low', 'Medium', 'High', 'Urgent'])
    .withMessage('Priority must be Low, Medium, High, or Urgent'),
  body('dueDate')
    .isISO8601()
    .withMessage('Valid due date is required')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Due date must be in the future');
      }
      return true;
    }),
  body('reason')
    .isIn(['bug-fix', 'feature-request', 'improvement', 'change-request', 'additional-work', 'other'])
    .withMessage('Valid reason is required')
];

const validateTaskRequestUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage('Description must be between 20 and 1000 characters'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Urgent'])
    .withMessage('Priority must be Low, Medium, High, or Urgent'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Valid due date is required')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Due date must be in the future');
      }
      return true;
    }),
  body('reason')
    .optional()
    .isIn(['bug-fix', 'feature-request', 'improvement', 'change-request', 'additional-work', 'other'])
    .withMessage('Valid reason is required')
];

const validateTaskRequestReview = [
  body('action')
    .isIn(['approve', 'reject'])
    .withMessage('Action must be approve or reject'),
  body('reviewComments')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Review comments cannot exceed 500 characters')
];

// Customer routes
router.post('/customer', protect, authorize('customer'), validateTaskRequest, createTaskRequest);
router.get('/customer', protect, authorize('customer'), getCustomerTaskRequests);
router.get('/customer/:id', protect, authorize('customer'), getTaskRequestDetails);
router.put('/customer/:id', protect, authorize('customer'), validateTaskRequestUpdate, updateTaskRequest);
router.delete('/customer/:id', protect, authorize('customer'), cancelTaskRequest);

// PM routes
router.get('/pm', protect, authorize('pm'), getPMTaskRequests);
router.post('/pm/:id/review', protect, authorize('pm'), validateTaskRequestReview, reviewTaskRequest);

module.exports = router;