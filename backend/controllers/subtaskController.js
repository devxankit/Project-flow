const mongoose = require('mongoose');
const Subtask = require('../models/Subtask');
const Task = require('../models/Task');
const Customer = require('../models/Customer');
const User = require('../models/User');
const { formatFileData, validateFileSize } = require('../middlewares/enhancedFileUpload');
const { validationResult } = require('express-validator');
const { createSubtaskActivity } = require('./activityController');

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

// Helper function to check if user has permission to access customer
const checkCustomerPermission = async (customerId, userId, userRole) => {
  // Validate customerId before querying
  if (!customerId || customerId === 'undefined' || customerId === 'null' || !mongoose.Types.ObjectId.isValid(customerId)) {
    return { hasPermission: false, error: 'Invalid customer ID' };
  }

  const customer = await Customer.findById(customerId);
  if (!customer) {
    return { hasPermission: false, error: 'Customer not found' };
  }

  // PM can access all customers
  if (userRole === 'pm') {
    return { hasPermission: true, customer };
  }

  // Customer can only access their own records
  if (userRole === 'customer') {
    if (customer.customer.toString() === userId) {
      return { hasPermission: true, customer };
    }
    return { hasPermission: false, error: 'Access denied' };
  }

  // Employee can access customers they're assigned to
  if (userRole === 'employee') {
    const isAssigned = customer.assignedTeam.some(teamMember => 
      teamMember.toString() === userId
    );
    if (isAssigned) {
      return { hasPermission: true, customer };
    }
    return { hasPermission: false, error: 'Access denied' };
  }

  return { hasPermission: false, error: 'Invalid role' };
};

// @desc    Create a new subtask
// @route   POST /api/subtasks
// @access  Private (PM only)
const createSubtask = async (req, res) => {
  try {
    // Handle both JSON and FormData requests
    let subtaskData;
    if (req.body.subtaskData) {
      // FormData request with subtaskData as JSON string
      subtaskData = JSON.parse(req.body.subtaskData);
    } else {
      // Regular JSON request
      subtaskData = req.body;
    }

    const { title, description, task, customer, status, priority, assignedTo, dueDate, sequence } = subtaskData;

    // Check if user has permission to access the customer
    const permissionCheck = await checkCustomerPermission(customer, req.user.id, req.user.role);
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({
        success: false,
        message: permissionCheck.error
      });
    }

    // Verify task exists and belongs to the customer
    const taskExists = await Task.findOne({ _id: task, customer: customer });
    if (!taskExists) {
      return res.status(400).json({
        success: false,
        message: 'Task not found or does not belong to the specified customer'
      });
    }

    // Validate assigned users (if any)
    if (assignedTo && assignedTo.length > 0) {
      const assignedUsers = await User.find({ 
        _id: { $in: assignedTo },
        role: { $in: ['employee', 'pm'] }
      });
      
      if (assignedUsers.length !== assignedTo.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more assigned users are invalid or not employees/PMs'
        });
      }
    }

    // Process file attachments if any
    let attachments = [];
    
    if (req.files && req.files.length > 0) {
      attachments = req.files
        .filter(file => file && file.originalname && file.mimetype)
        .filter(file => validateFileSize(file)) // Validate file size by category
        .map(file => formatFileData(file, req.user.id)) // Use enhanced file formatting
        .filter(attachment => attachment && attachment.url);
    }

    // Create subtask
    const subtask = new Subtask({
      title,
      description: description || '',
      task,
      customer,
      status: status || 'pending',
      priority: priority || 'normal',
      assignedTo: assignedTo || [],
      dueDate,
      sequence: sequence || 1,
      attachments,
      createdBy: req.user.id
    });

    await subtask.save();

    // Create activity for subtask creation
    try {
      await createSubtaskActivity(subtask._id, 'subtask_created', req.user.id, {
        subtaskTitle: subtask.title,
        task: task,
        customer: customer,
        assignedTo: assignedTo || []
      });
    } catch (activityError) {
      console.error('Error creating subtask activity:', activityError);
      // Don't fail the subtask creation if activity creation fails
    }

    // Create activity for file uploads if any
    if (attachments.length > 0) {
      try {
        const { createFileActivity } = require('./activityController');
        for (const attachment of attachments) {
          await createFileActivity(customer, 'file_uploaded', req.user.id, {
            filename: attachment.originalName,
            fileSize: attachment.size,
            fileType: attachment.mimetype,
            subtaskId: subtask._id
          });
        }
      } catch (activityError) {
        console.error('Error creating file upload activity:', activityError);
        // Don't fail the subtask creation if activity creation fails
      }
    }

    // Populate the created subtask with user data
    await subtask.populate([
      { path: 'assignedTo', select: 'fullName email avatar' },
      { path: 'createdBy', select: 'fullName email avatar' },
      { path: 'task', select: 'title' },
      { path: 'customer', select: 'name' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Subtask created successfully',
      data: { subtask }
    });

  } catch (error) {
    console.error('Error creating subtask:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get subtasks for a task
// @route   GET /api/subtasks/task/:taskId/customer/:customerId
// @access  Private
const getSubtasksByTask = async (req, res) => {
  try {
    const { taskId, customerId } = req.params;

    // Validate taskId
    if (!taskId || taskId === 'undefined' || taskId === 'null' || !mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID'
      });
    }

    // Check if user has permission to access the customer
    const permissionCheck = await checkCustomerPermission(customerId, req.user.id, req.user.role);
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({
        success: false,
        message: permissionCheck.error
      });
    }

    // Verify task exists and belongs to the customer
    const task = await Task.findOne({ _id: taskId, customer: customerId });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Get subtasks for the task
    const subtasks = await Subtask.getByTask(taskId);

    res.json({
      success: true,
      data: { subtasks, task: { _id: task._id, title: task.title, progress: task.progress } }
    });

  } catch (error) {
    console.error('Error fetching subtasks:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get single subtask
// @route   GET /api/subtasks/:subtaskId/customer/:customerId
// @access  Private
const getSubtask = async (req, res) => {
  try {
    const { subtaskId, customerId } = req.params;

    // Validate subtaskId
    if (!subtaskId || subtaskId === 'undefined' || subtaskId === 'null' || !mongoose.Types.ObjectId.isValid(subtaskId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subtask ID'
      });
    }

    // Check if user has permission to access the customer
    const permissionCheck = await checkCustomerPermission(customerId, req.user.id, req.user.role);
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({
        success: false,
        message: permissionCheck.error
      });
    }

    // Get subtask with populated data
    const subtask = await Subtask.findOne({ _id: subtaskId, customer: customerId })
      .populate('assignedTo', 'fullName email avatar')
      .populate('createdBy', 'fullName email avatar')
      .populate('completedBy', 'fullName email avatar')
      .populate('task', 'title')
      .populate('customer', 'name')
      .populate('comments.user', 'fullName email');

    if (!subtask) {
      return res.status(404).json({
        success: false,
        message: 'Subtask not found'
      });
    }

    res.json({
      success: true,
      data: { subtask }
    });

  } catch (error) {
    console.error('Error fetching subtask:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Update subtask
// @route   PUT /api/subtasks/:subtaskId/customer/:customerId
// @access  Private (PM only)
const updateSubtask = async (req, res) => {
  try {
    const { subtaskId, customerId } = req.params;
    
    // Handle both JSON and FormData requests
    let subtaskData;
    if (req.body.subtaskData) {
      // FormData request with subtaskData as JSON string
      subtaskData = JSON.parse(req.body.subtaskData);
    } else {
      // Regular JSON request
      subtaskData = req.body;
    }
    
    const { title, description, status, priority, assignedTo, dueDate, sequence } = subtaskData;

    // Check if user has permission to access the customer
    const permissionCheck = await checkCustomerPermission(customerId, req.user.id, req.user.role);
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({
        success: false,
        message: permissionCheck.error
      });
    }

    // Find the subtask
    const subtask = await Subtask.findOne({ _id: subtaskId, customer: customerId });
    if (!subtask) {
      return res.status(404).json({
        success: false,
        message: 'Subtask not found'
      });
    }

    // Process new file attachments if any
    if (req.files && req.files.length > 0) {
      const newAttachments = req.files
        .filter(file => file && file.originalname && file.mimetype)
        .filter(file => validateFileSize(file)) // Validate file size by category
        .map(file => formatFileData(file, req.user.id)) // Use enhanced file formatting
        .filter(attachment => attachment && attachment.url);
      
      // Add new attachments to existing ones
      subtask.attachments = [...(subtask.attachments || []), ...newAttachments];
    }

    // Update subtask fields
    if (title !== undefined) subtask.title = title;
    if (description !== undefined) subtask.description = description;
    if (status !== undefined) subtask.status = status;
    if (priority !== undefined) subtask.priority = priority;
    if (assignedTo !== undefined) subtask.assignedTo = assignedTo;
    if (dueDate !== undefined) subtask.dueDate = dueDate;
    if (sequence !== undefined) subtask.sequence = sequence;

    // Handle completion status
    if (status === 'completed' && subtask.status !== 'completed') {
      subtask.completedAt = new Date();
      subtask.completedBy = req.user.id;
    } else if (status !== 'completed' && subtask.status === 'completed') {
      subtask.completedAt = null;
      subtask.completedBy = null;
    }

    // Save the subtask
    await subtask.save();

    // Create activity for subtask update
    try {
      let activityType = 'subtask_updated';
      let metadata = {};

      // Check if status changed
      if (status !== undefined && status !== subtask.status) {
        activityType = 'subtask_status_changed';
        metadata.newStatus = status;
        metadata.oldStatus = subtask.status;
      }

      // Check if assignment changed
      if (assignedTo !== undefined) {
        const oldAssignedIds = subtask.assignedTo.map(id => id.toString());
        const newAssignedIds = assignedTo.map(id => id.toString());
        
        if (JSON.stringify(oldAssignedIds.sort()) !== JSON.stringify(newAssignedIds.sort())) {
          activityType = 'subtask_assigned';
          metadata.assignedTo = assignedTo;
        }
      }

      await createSubtaskActivity(subtask._id, activityType, req.user.id, {
        subtaskTitle: subtask.title,
        ...metadata
      });
    } catch (activityError) {
      console.error('Error creating subtask update activity:', activityError);
      // Don't fail the subtask update if activity creation fails
    }

    // Create activity for new file uploads if any
    if (req.files && req.files.length > 0) {
      try {
        const { createFileActivity } = require('./activityController');
        for (const file of req.files) {
          await createFileActivity(customerId, 'file_uploaded', req.user.id, {
            filename: file.originalname,
            fileSize: file.size,
            fileType: file.mimetype,
            subtaskId: subtask._id
          });
        }
      } catch (activityError) {
        console.error('Error creating file upload activity:', activityError);
        // Don't fail the subtask update if activity creation fails
      }
    }

    // Populate the updated subtask
    await subtask.populate([
      { path: 'assignedTo', select: 'fullName email avatar' },
      { path: 'createdBy', select: 'fullName email avatar' },
      { path: 'completedBy', select: 'fullName email avatar' },
      { path: 'task', select: 'title' },
      { path: 'customer', select: 'name' }
    ]);

    res.json({
      success: true,
      message: 'Subtask updated successfully',
      data: { subtask }
    });

  } catch (error) {
    console.error('Error updating subtask:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Delete subtask
// @route   DELETE /api/subtasks/:subtaskId/customer/:customerId
// @access  Private (PM only)
const deleteSubtask = async (req, res) => {
  try {
    const { subtaskId, customerId } = req.params;

    // Check if user has permission to access the customer
    const permissionCheck = await checkCustomerPermission(customerId, req.user.id, req.user.role);
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({
        success: false,
        message: permissionCheck.error
      });
    }

    // Find and delete the subtask
    const subtask = await Subtask.findOneAndDelete({ _id: subtaskId, customer: customerId });
    if (!subtask) {
      return res.status(404).json({
        success: false,
        message: 'Subtask not found'
      });
    }

    res.json({
      success: true,
      message: 'Subtask deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting subtask:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get subtask statistics
// @route   GET /api/subtasks/stats
// @access  Private
const getSubtaskStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Build base filter based on user role
    let baseFilter = {};
    
    if (userRole === 'customer') {
      // For customers, get subtasks from their customer records
      const userCustomers = await Customer.find({ customer: userId }).select('_id');
      const customerIds = userCustomers.map(c => c._id);
      baseFilter.customer = { $in: customerIds };
    } else if (userRole === 'employee') {
      // For employees, get subtasks assigned to them
      baseFilter.assignedTo = userId;
    }
    // PM can see all subtasks (no additional filter)

    const stats = await Subtask.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
          urgent: { $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] } },
          high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
          normal: { $sum: { $cond: [{ $eq: ['$priority', 'normal'] }, 1, 0] } },
          low: { $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] } }
        }
      }
    ]);

    const result = stats[0] || {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
      urgent: 0,
      high: 0,
      normal: 0,
      low: 0
    };

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error fetching subtask stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subtask statistics',
      error: error.message
    });
  }
};

module.exports = {
  createSubtask,
  getSubtasksByTask,
  getSubtask,
  updateSubtask,
  deleteSubtask,
  getSubtaskStats
};
