const express = require('express');
const router = express.Router();
const {
  createCustomer,
  getCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerStats,
  getUsersForCustomer,
  getCustomerTasks
} = require('../controllers/customerController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/enhancedFileUpload');
const {
  validateCustomerCreation,
  validateCustomerUpdate,
  validateCustomerId,
  validateCustomerQuery
} = require('../middlewares/customerValidation');

// Apply authentication to all routes
router.use(protect);

// @route   POST /api/customers
// @desc    Create a new customer
// @access  Private (PM only)
router.post('/', 
  authorize('pm'),
  validateCustomerCreation,
  createCustomer
);

// @route   GET /api/customers
// @desc    Get all customers (with filtering and pagination)
// @access  Private
router.get('/', 
  validateCustomerQuery,
  getCustomers
);

// @route   GET /api/customers/stats
// @desc    Get customer statistics
// @access  Private
router.get('/stats', getCustomerStats);

// @route   GET /api/customers/users
// @desc    Get users for customer assignment
// @access  Private (PM only)
router.get('/users', 
  authorize('pm'),
  validateCustomerQuery,
  getUsersForCustomer
);

// @route   GET /api/customers/:id
// @desc    Get single customer
// @access  Private
router.get('/:id', 
  validateCustomerId,
  getCustomer
);

// @route   PUT /api/customers/:id
// @desc    Update customer
// @access  Private (PM only)
router.put('/:id', 
  authorize('pm'),
  validateCustomerUpdate,
  updateCustomer
);

// @route   GET /api/customers/:id/tasks
// @desc    Get all tasks for a customer
// @access  Private
router.get('/:id/tasks', 
  validateCustomerId,
  getCustomerTasks
);

// @route   DELETE /api/customers/:id
// @desc    Delete customer
// @access  Private (PM only)
router.delete('/:id', 
  authorize('pm'),
  validateCustomerId,
  deleteCustomer
);

module.exports = router;