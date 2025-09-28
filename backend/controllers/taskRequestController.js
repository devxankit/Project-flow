const TaskRequest = require('../models/TaskRequest');
const Customer = require('../models/Customer');
const Task = require('../models/Task');
const Subtask = require('../models/Subtask');
const User = require('../models/User');
const mongoose = require('mongoose');
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

// Create a new task request
const createTaskRequest = async (req, res) => {
  try {
    // Handle validation errors
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const {
      title,
      description,
      customer,
      task,
      priority,
      dueDate,
      reason
    } = req.body;

    const customerId = new mongoose.Types.ObjectId(req.user.id);

    // Verify customer has access to the customer record
    const customerExists = await Customer.findOne({
      _id: customer,
      customer: customerId
    });

    if (!customerExists) {
      return res.status(404).json({
        success: false,
        message: 'Customer record not found or access denied'
      });
    }

    // Verify task belongs to the customer
    const taskExists = await Task.findOne({
      _id: task,
      customer: customer
    });

    if (!taskExists) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or does not belong to this customer'
      });
    }

    // Create task request
    const taskRequest = new TaskRequest({
      title,
      description,
      customer,
      task,
      priority,
      dueDate: new Date(dueDate),
      reason,
      requestedBy: customerId
    });

    await taskRequest.save();

    // Populate the response
    await taskRequest.populate([
      { path: 'customer', select: 'name' },
      { path: 'task', select: 'title' },
      { path: 'requestedBy', select: 'fullName email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Task request submitted successfully',
      data: taskRequest
    });

  } catch (error) {
    console.error('Error creating task request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get task requests for a customer
const getCustomerTaskRequests = async (req, res) => {
  try {
    const customerId = new mongoose.Types.ObjectId(req.user.id);
    const { status, customer } = req.query;

    // Build query
    const query = { requestedBy: customerId };
    
    if (status) {
      query.status = status;
    }
    
    if (customer) {
      query.customer = new mongoose.Types.ObjectId(customer);
    }

    const taskRequests = await TaskRequest.find(query)
      .populate('customer', 'name')
      .populate('task', 'title')
      .populate('requestedBy', 'fullName email')
      .populate('reviewedBy', 'fullName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: taskRequests
    });

  } catch (error) {
    console.error('Error fetching customer task requests:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get task request details
const getTaskRequestDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = new mongoose.Types.ObjectId(req.user.id);

    const taskRequest = await TaskRequest.findOne({
      _id: id,
      requestedBy: customerId
    })
      .populate('customer', 'name description')
      .populate('task', 'title description')
      .populate('requestedBy', 'fullName email')
      .populate('reviewedBy', 'fullName email')
      .populate('createdSubtask', 'title status');

    if (!taskRequest) {
      return res.status(404).json({
        success: false,
        message: 'Task request not found or access denied'
      });
    }

    res.json({
      success: true,
      data: taskRequest
    });

  } catch (error) {
    console.error('Error fetching task request details:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update task request (only if status is Pending)
const updateTaskRequest = async (req, res) => {
  try {
    // Handle validation errors
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { id } = req.params;
    const customerId = new mongoose.Types.ObjectId(req.user.id);
    const { title, description, priority, dueDate, reason } = req.body;

    const taskRequest = await TaskRequest.findOne({
      _id: id,
      requestedBy: customerId,
      status: 'Pending'
    });

    if (!taskRequest) {
      return res.status(404).json({
        success: false,
        message: 'Task request not found, access denied, or cannot be modified'
      });
    }

    // Update fields
    if (title) taskRequest.title = title;
    if (description) taskRequest.description = description;
    if (priority) taskRequest.priority = priority;
    if (dueDate) taskRequest.dueDate = new Date(dueDate);
    if (reason) taskRequest.reason = reason;

    await taskRequest.save();

    // Populate the response
    await taskRequest.populate([
      { path: 'customer', select: 'name' },
      { path: 'task', select: 'title' },
      { path: 'requestedBy', select: 'fullName email' }
    ]);

    res.json({
      success: true,
      message: 'Task request updated successfully',
      data: taskRequest
    });

  } catch (error) {
    console.error('Error updating task request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Cancel task request (only if status is Pending)
const cancelTaskRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = new mongoose.Types.ObjectId(req.user.id);

    const taskRequest = await TaskRequest.findOne({
      _id: id,
      requestedBy: customerId,
      status: 'Pending'
    });

    if (!taskRequest) {
      return res.status(404).json({
        success: false,
        message: 'Task request not found, access denied, or cannot be cancelled'
      });
    }

    taskRequest.status = 'Cancelled';
    await taskRequest.save();

    res.json({
      success: true,
      message: 'Task request cancelled successfully',
      data: taskRequest
    });

  } catch (error) {
    console.error('Error cancelling task request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get task requests for PM (all requests for their customers)
const getPMTaskRequests = async (req, res) => {
  try {
    const pmId = new mongoose.Types.ObjectId(req.user.id);
    const { status, customer } = req.query;

    // Get customers managed by this PM
    const customers = await Customer.find({ projectManager: pmId }).select('_id');
    const customerIds = customers.map(c => c._id);

    if (customerIds.length === 0) {
      return res.json({
        success: true,
        data: []
      });
    }

    // Build query
    const query = { customer: { $in: customerIds } };
    
    if (status) {
      query.status = status;
    }
    
    if (customer) {
      query.customer = new mongoose.Types.ObjectId(customer);
    }

    const taskRequests = await TaskRequest.find(query)
      .populate('customer', 'name')
      .populate('task', 'title')
      .populate('requestedBy', 'fullName email')
      .populate('reviewedBy', 'fullName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: taskRequests
    });

  } catch (error) {
    console.error('Error fetching PM task requests:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Review task request (PM only)
const reviewTaskRequest = async (req, res) => {
  try {
    // Handle validation errors
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { id } = req.params;
    const pmId = new mongoose.Types.ObjectId(req.user.id);
    const { action, reviewComments } = req.body; // action: 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be "approve" or "reject"'
      });
    }

    const taskRequest = await TaskRequest.findById(id)
      .populate('customer', 'projectManager');

    if (!taskRequest) {
      return res.status(404).json({
        success: false,
        message: 'Task request not found'
      });
    }

    // Check if PM has access to this customer
    if (taskRequest.customer.projectManager.toString() !== pmId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only review requests for your customers'
      });
    }

    // Check if request is still pending
    if (taskRequest.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Task request has already been reviewed'
      });
    }

    // Update task request
    taskRequest.status = action === 'approve' ? 'Approved' : 'Rejected';
    taskRequest.reviewedBy = pmId;
    taskRequest.reviewedAt = new Date();
    taskRequest.reviewComments = reviewComments;

    // If approved, create a subtask
    if (action === 'approve') {
      // Map TaskRequest priority to Subtask priority
      const priorityMap = {
        'Low': 'low',
        'Medium': 'normal',
        'High': 'high',
        'Urgent': 'urgent'
      };

      // Get the next sequence number for this task
      const lastSubtask = await Subtask.findOne({ task: taskRequest.task })
        .sort({ sequence: -1 })
        .select('sequence');
      
      const nextSequence = lastSubtask ? lastSubtask.sequence + 1 : 1;

      const newSubtask = new Subtask({
        title: taskRequest.title,
        description: taskRequest.description,
        task: taskRequest.task,
        customer: taskRequest.customer,
        priority: priorityMap[taskRequest.priority] || 'normal',
        dueDate: taskRequest.dueDate,
        status: 'pending',
        sequence: nextSequence,
        createdBy: taskRequest.requestedBy
      });

      await newSubtask.save();
      taskRequest.createdSubtask = newSubtask._id;
    }

    await taskRequest.save();

    // Populate the response
    await taskRequest.populate([
      { path: 'customer', select: 'name' },
      { path: 'task', select: 'title' },
      { path: 'requestedBy', select: 'fullName email' },
      { path: 'reviewedBy', select: 'fullName email' },
      { path: 'createdSubtask', select: 'title status' }
    ]);

    res.json({
      success: true,
      message: `Task request ${action}d successfully`,
      data: taskRequest
    });

  } catch (error) {
    console.error('Error reviewing task request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  createTaskRequest,
  getCustomerTaskRequests,
  getTaskRequestDetails,
  updateTaskRequest,
  cancelTaskRequest,
  getPMTaskRequests,
  reviewTaskRequest
};