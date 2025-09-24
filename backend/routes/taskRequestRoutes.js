const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middlewares/authMiddleware');
const {
  createTaskRequest,
  getCustomerTaskRequests,
  getCustomerTaskRequestsById,
  getAllTaskRequests,
  updateTaskRequestStatus,
  deleteTaskRequest
} = require('../controllers/taskRequestController');

// Validation rules
const createTaskRequestValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description must be between 1 and 1000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, normal, high, urgent'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('estimatedHours')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Estimated hours must be between 1 and 1000'),
  body('customer')
    .isMongoId()
    .withMessage('Customer must be a valid ID'),
  body('customerName')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Customer name must be between 1 and 200 characters')
];

const updateStatusValidation = [
  body('status')
    .isIn(['pending', 'approved', 'rejected', 'in-progress', 'completed'])
    .withMessage('Status must be one of: pending, approved, rejected, in-progress, completed'),
  body('response')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Response must be less than 1000 characters')
];

// Routes
router.post('/', protect, authorize('customer'), createTaskRequestValidation, createTaskRequest);
router.get('/customer', protect, authorize('customer'), getCustomerTaskRequests);
router.get('/customer/:customerId', protect, authorize('customer'), getCustomerTaskRequestsById);
router.get('/', protect, authorize('pm'), getAllTaskRequests);
router.put('/:id/status', protect, authorize('pm'), updateStatusValidation, updateTaskRequestStatus);
router.delete('/:id', protect, deleteTaskRequest);

module.exports = router;