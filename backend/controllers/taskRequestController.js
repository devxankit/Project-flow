const TaskRequest = require('../models/TaskRequest');
const User = require('../models/User');
const Customer = require('../models/Customer');
const { validationResult } = require('express-validator');

// Helper function to handle validation errors
const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  return null;
};

// @desc    Create a new task request
// @route   POST /api/task-requests
// @access  Private (Customer only)
const createTaskRequest = async (req, res) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const {
      title,
      description,
      priority = 'normal',
      dueDate,
      estimatedHours,
      customer,
      customerName
    } = req.body;

    const userId = req.user.id;
    const userRole = req.user.role;

    // Only customers can create task requests
    if (userRole !== 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Only customers can create task requests'
      });
    }

    // Verify customer exists and user has access
    const customerRecord = await Customer.findById(customer);
    if (!customerRecord) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Check if customer belongs to the user
    if (customerRecord.customer.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only create task requests for your own projects'
      });
    }

    const taskRequest = new TaskRequest({
      title,
      description,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      estimatedHours: estimatedHours ? parseInt(estimatedHours) : undefined,
      customer,
      customerName,
      requestedBy: userId,
      status: 'pending'
    });

    await taskRequest.save();

    // Populate the response
    await taskRequest.populate('requestedBy', 'fullName email avatar');
    await taskRequest.populate('customer', 'name');

    res.status(201).json({
      success: true,
      message: 'Task request created successfully',
      data: taskRequest
    });

  } catch (error) {
    console.error('Error creating task request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create task request',
      error: error.message
    });
  }
};

// @desc    Get all task requests for current customer user
// @route   GET /api/task-requests/customer
// @access  Private (Customer only)
const getCustomerTaskRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Only customers can view their own task requests
    if (userRole !== 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Only customers can view task requests'
      });
    }

    // Get all customers belonging to this user
    const customers = await Customer.find({ customer: userId });
    const customerIds = customers.map(c => c._id);

    // Get all task requests for these customers
    const taskRequests = await TaskRequest.find({ customer: { $in: customerIds } })
      .populate('requestedBy', 'fullName email avatar')
      .populate('customer', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: taskRequests
    });

  } catch (error) {
    console.error('Error fetching customer task requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch task requests',
      error: error.message
    });
  }
};

// @desc    Get task requests for a specific customer
// @route   GET /api/task-requests/customer/:customerId
// @access  Private (Customer only)
const getCustomerTaskRequestsById = async (req, res) => {
  try {
    const { customerId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Only customers can view their own task requests
    if (userRole !== 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Only customers can view task requests'
      });
    }

    // Verify customer belongs to the user
    const customer = await Customer.findById(customerId);
    if (!customer || customer.customer.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const taskRequests = await TaskRequest.find({ customer: customerId })
      .populate('requestedBy', 'fullName email avatar')
      .populate('customer', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: taskRequests
    });

  } catch (error) {
    console.error('Error fetching customer task requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch task requests',
      error: error.message
    });
  }
};

// @desc    Get all task requests (for PM)
// @route   GET /api/task-requests
// @access  Private (PM only)
const getAllTaskRequests = async (req, res) => {
  try {
    const userRole = req.user.role;

    // Only PMs can view all task requests
    if (userRole !== 'pm') {
      return res.status(403).json({
        success: false,
        message: 'Only project managers can view all task requests'
      });
    }

    const { status, priority, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;

    const skip = (page - 1) * limit;

    const taskRequests = await TaskRequest.find(query)
      .populate('requestedBy', 'fullName email avatar')
      .populate('customer', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await TaskRequest.countDocuments(query);

    res.json({
      success: true,
      data: taskRequests,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Error fetching all task requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch task requests',
      error: error.message
    });
  }
};

// @desc    Update task request status (for PM)
// @route   PUT /api/task-requests/:id/status
// @access  Private (PM only)
const updateTaskRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, response } = req.body;
    const userRole = req.user.role;

    // Only PMs can update task request status
    if (userRole !== 'pm') {
      return res.status(403).json({
        success: false,
        message: 'Only project managers can update task request status'
      });
    }

    const validStatuses = ['pending', 'approved', 'rejected', 'in-progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: pending, approved, rejected, in-progress, completed'
      });
    }

    const taskRequest = await TaskRequest.findById(id);
    if (!taskRequest) {
      return res.status(404).json({
        success: false,
        message: 'Task request not found'
      });
    }

    taskRequest.status = status;
    if (response) taskRequest.response = response;
    taskRequest.reviewedBy = req.user.id;
    taskRequest.reviewedAt = new Date();

    await taskRequest.save();

    await taskRequest.populate('requestedBy', 'fullName email avatar');
    await taskRequest.populate('customer', 'name');
    await taskRequest.populate('reviewedBy', 'fullName email avatar');

    res.json({
      success: true,
      message: 'Task request status updated successfully',
      data: taskRequest
    });

  } catch (error) {
    console.error('Error updating task request status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task request status',
      error: error.message
    });
  }
};

// @desc    Delete task request
// @route   DELETE /api/task-requests/:id
// @access  Private (Customer or PM)
const deleteTaskRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const taskRequest = await TaskRequest.findById(id);
    if (!taskRequest) {
      return res.status(404).json({
        success: false,
        message: 'Task request not found'
      });
    }

    // Customers can only delete their own pending requests
    // PMs can delete any request
    if (userRole === 'customer') {
      if (taskRequest.requestedBy.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own task requests'
        });
      }
      if (taskRequest.status !== 'pending') {
        return res.status(403).json({
          success: false,
          message: 'You can only delete pending task requests'
        });
      }
    }

    await TaskRequest.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Task request deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting task request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task request',
      error: error.message
    });
  }
};

module.exports = {
  createTaskRequest,
  getCustomerTaskRequests,
  getCustomerTaskRequestsById,
  getAllTaskRequests,
  updateTaskRequestStatus,
  deleteTaskRequest
};