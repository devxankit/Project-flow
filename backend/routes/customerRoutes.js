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
  getCustomerTasks,
  getCustomerDashboard,
  getCustomerProjectDetails,
  getCustomerActivity,
  getCustomerFiles
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

// @route   GET /api/customers/dashboard
// @desc    Get customer dashboard data
// @access  Private
router.get('/dashboard', getCustomerDashboard);

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

// @route   GET /api/customers/activity
// @desc    Get customer activity
// @access  Private (Customer only)
router.get('/activity', 
  protect,
  authorize('customer'),
  getCustomerActivity
);

// @route   GET /api/customers/files
// @desc    Get customer files
// @access  Private (Customer only)
router.get('/files', 
  protect,
  authorize('customer'),
  getCustomerFiles
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
  protect,
  validateCustomerId,
  getCustomerTasks
);

// @route   GET /api/customers/:id/project-details
// @desc    Get customer project details with tasks and subtasks
// @access  Private
router.get('/:id/project-details', 
  validateCustomerId,
  getCustomerProjectDetails
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