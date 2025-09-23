const Customer = require('../models/Customer');
const Task = require('../models/Task');
const Subtask = require('../models/Subtask');
const User = require('../models/User');
const { formatFileData, validateFileSize } = require('../middlewares/enhancedFileUpload');
const { validationResult } = require('express-validator');
const { createTaskActivity } = require('./activityController');

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

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private (PM only)
const createTask = async (req, res) => {
  try {
    // Handle both JSON and FormData requests
    let taskData;
    if (req.body.taskData) {
      // FormData request with taskData as JSON string
      taskData = JSON.parse(req.body.taskData);
    } else {
      // Regular JSON request
      taskData = req.body;
    }

    const { title, description, customer, status, priority, assignedTo, dueDate, sequence } = taskData;

    // Check if user has permission to access the customer
    const permissionCheck = await checkCustomerPermission(customer, req.user.id, req.user.role);
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({
        success: false,
        message: permissionCheck.error
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
        .filter(file => file && file.originalname && file.mimetype) // Only process valid files
        .filter(file => validateFileSize(file)) // Validate file size by category
        .map(file => formatFileData(file, req.user.id)) // Use enhanced file formatting
        .filter(attachment => attachment && attachment.url); // Only include valid attachments
    }

    // Create task
    const task = new Task({
      title,
      description: description || '',
      customer,
      status: status || 'pending',
      priority: priority || 'normal',
      assignedTo: assignedTo || [],
      dueDate,
      sequence: sequence || 1,
      attachments,
      createdBy: req.user.id
    });

    await task.save();

    // Create activity for task creation
    try {
      await createTaskActivity(task._id, 'task_created', req.user.id, {
        taskTitle: task.title,
        customer: customer,
        assignedTo: assignedTo || []
      });
    } catch (activityError) {
      console.error('Error creating task activity:', activityError);
      // Don't fail the task creation if activity creation fails
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
            taskId: task._id
          });
        }
      } catch (activityError) {
        console.error('Error creating file upload activity:', activityError);
        // Don't fail the task creation if activity creation fails
      }
    }

    // Populate the created task with user data
    await task.populate([
      { path: 'assignedTo', select: 'fullName email avatar' },
      { path: 'createdBy', select: 'fullName email avatar' },
      { path: 'customer', select: 'name' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task }
    });

  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get tasks for a customer
// @route   GET /api/tasks/customer/:customerId
// @access  Private
const getTasksByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    // Check if user has permission to access the customer
    const permissionCheck = await checkCustomerPermission(customerId, req.user.id, req.user.role);
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({
        success: false,
        message: permissionCheck.error
      });
    }

    const customer = permissionCheck.customer;

    // Get tasks for the customer
    const tasks = await Task.getByCustomer(customerId);

    res.json({
      success: true,
      data: { tasks, customer: { _id: customer._id, name: customer.name, progress: customer.progress } }
    });

  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:taskId/customer/:customerId
// @access  Private
const getTask = async (req, res) => {
  try {
    const { taskId, customerId } = req.params;

    // Check if user has permission to access the customer
    const permissionCheck = await checkCustomerPermission(customerId, req.user.id, req.user.role);
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({
        success: false,
        message: permissionCheck.error
      });
    }

    // Get task with populated data
    const task = await Task.findOne({ _id: taskId, customer: customerId })
      .populate('assignedTo', 'fullName email avatar')
      .populate('createdBy', 'fullName email avatar')
      .populate('completedBy', 'fullName email avatar')
      .populate('customer', 'name')
      .populate('comments.user', 'fullName email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Include customer object in response for frontend convenience
    // Prefer the customer object from the permission check to avoid extra queries
    const customer = permissionCheck.customer
      ? { _id: permissionCheck.customer._id, name: permissionCheck.customer.name, progress: permissionCheck.customer.progress }
      : (task.customer && task.customer._id
          ? { _id: task.customer._id, name: task.customer.name }
          : { _id: customerId });

    res.json({
      success: true,
      data: { task, customer }
    });

  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:taskId/customer/:customerId
// @access  Private (PM only)
const updateTask = async (req, res) => {
  try {
    const { taskId, customerId } = req.params;
    
    // Handle both JSON and FormData requests
    let taskData;
    if (req.body.taskData) {
      // FormData request with taskData as JSON string
      taskData = JSON.parse(req.body.taskData);
    } else {
      // Regular JSON request
      taskData = req.body;
    }
    
    const { title, description, status, priority, assignedTo, dueDate, sequence } = taskData;

    // Check if user has permission to access the customer
    const permissionCheck = await checkCustomerPermission(customerId, req.user.id, req.user.role);
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({
        success: false,
        message: permissionCheck.error
      });
    }

    // Find the task
    const task = await Task.findOne({ _id: taskId, customer: customerId });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
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
      task.attachments = [...(task.attachments || []), ...newAttachments];
    }

    // Update task fields
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (sequence !== undefined) task.sequence = sequence;

    // Handle completion status
    if (status === 'completed' && task.status !== 'completed') {
      task.completedAt = new Date();
      task.completedBy = req.user.id;
    } else if (status !== 'completed' && task.status === 'completed') {
      task.completedAt = null;
      task.completedBy = null;
    }

    // Save the task
    await task.save();

    // Create activity for task update
    try {
      let activityType = 'task_updated';
      let metadata = {};

      // Check if status changed
      if (status !== undefined && status !== task.status) {
        activityType = 'task_status_changed';
        metadata.newStatus = status;
        metadata.oldStatus = task.status;
      }

      // Check if assignment changed
      if (assignedTo !== undefined) {
        const oldAssignedIds = task.assignedTo.map(id => id.toString());
        const newAssignedIds = assignedTo.map(id => id.toString());
        
        if (JSON.stringify(oldAssignedIds.sort()) !== JSON.stringify(newAssignedIds.sort())) {
          activityType = 'task_assigned';
          metadata.assignedTo = assignedTo;
        }
      }

      await createTaskActivity(task._id, activityType, req.user.id, {
        taskTitle: task.title,
        ...metadata
      });
    } catch (activityError) {
      console.error('Error creating task update activity:', activityError);
      // Don't fail the task update if activity creation fails
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
            taskId: task._id
          });
        }
      } catch (activityError) {
        console.error('Error creating file upload activity:', activityError);
        // Don't fail the task update if activity creation fails
      }
    }

    // Populate the updated task
    await task.populate([
      { path: 'assignedTo', select: 'fullName email avatar' },
      { path: 'createdBy', select: 'fullName email avatar' },
      { path: 'completedBy', select: 'fullName email avatar' },
      { path: 'customer', select: 'name' }
    ]);

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: { task }
    });

  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Copy an existing task
// @route   POST /api/tasks/:taskId/copy
// @access  Private (PM only)
const copyTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { customerId } = req.body;

    // Check if user has permission to access the customer
    const permissionCheck = await checkCustomerPermission(customerId, req.user.id, req.user.role);
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({
        success: false,
        message: permissionCheck.error
      });
    }

    // Find the original task
    const originalTask = await Task.findOne({ _id: taskId, customer: customerId });
    if (!originalTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Get the next sequence number for this customer
    const lastTask = await Task.findOne({ customer: customerId })
      .sort({ sequence: -1 })
      .select('sequence');
    const nextSequence = lastTask ? lastTask.sequence + 1 : 1;

    // Create the copied task with inherited properties
    const copiedTask = new Task({
      title: originalTask.title,
      description: originalTask.description,
      customer: customerId,
      status: 'pending', // Reset status to pending
      priority: originalTask.priority,
      assignedTo: originalTask.assignedTo, // Inherit assignments
      dueDate: originalTask.dueDate,
      sequence: nextSequence,
      progress: 0, // Reset progress to 0
      createdBy: req.user.id
      // Exclude: attachments, comments, completion data
    });

    await copiedTask.save();

    // Populate the copied task with user data
    await copiedTask.populate([
      { path: 'assignedTo', select: 'fullName email avatar' },
      { path: 'createdBy', select: 'fullName email avatar' },
      { path: 'customer', select: 'name' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Task copied successfully',
      data: { task: copiedTask }
    });

  } catch (error) {
    console.error('Error copying task:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:taskId/customer/:customerId
// @access  Private (PM only)
const deleteTask = async (req, res) => {
  try {
    const { taskId, customerId } = req.params;

    // Check if user has permission to access the customer
    const permissionCheck = await checkCustomerPermission(customerId, req.user.id, req.user.role);
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({
        success: false,
        message: permissionCheck.error
      });
    }

    // Find the task first
    const task = await Task.findOne({ _id: taskId, customer: customerId });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Delete all subtasks associated with this task (cascade delete)
    await Subtask.deleteMany({ task: taskId });

    // Delete the task
    await Task.findByIdAndDelete(taskId);

    res.json({
      success: true,
      message: 'Task and all associated subtasks deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get team members for task assignment
// @route   GET /api/tasks/team/:customerId
// @access  Private
const getTeamMembersForTask = async (req, res) => {
  try {
    const { customerId } = req.params;

    // Check if user has permission to access the customer
    const permissionCheck = await checkCustomerPermission(customerId, req.user.id, req.user.role);
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({
        success: false,
        message: permissionCheck.error
      });
    }

    // Get active employees and PMs assigned to the customer
    const teamMembers = await User.find({
      _id: { $in: permissionCheck.customer.assignedTeam },
      role: { $in: ['employee', 'pm'] },
      status: 'active'
    }).select('fullName email avatar role department jobTitle workTitle');

    res.json({
      success: true,
      data: { teamMembers }
    });

  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all tasks with filtering and pagination
const getAllTasks = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority, customer, assignedTo } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Build filter object
    const filter = {};

    // Add status filter
    if (status) {
      filter.status = status;
    }

    // Add priority filter
    if (priority) {
      filter.priority = priority;
    }

    // Add customer filter
    if (customer) {
      filter.customer = customer;
    }

    // Add assigned user filter
    if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get tasks with populated fields
    const tasks = await Task.find(filter)
      .populate('customer', 'name description status priority')
      .populate('assignedTo', 'fullName email role department jobTitle workTitle')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Task.countDocuments(filter);

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting all tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get tasks',
      error: error.message
    });
  }
};

// @desc    Get task statistics
// @route   GET /api/tasks/stats
// @access  Private
const getTaskStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Build base filter based on user role
    let baseFilter = {};
    
    if (userRole === 'customer') {
      // For customers, get tasks from their customer records
      const userCustomers = await Customer.find({ customer: userId }).select('_id');
      const customerIds = userCustomers.map(c => c._id);
      baseFilter.customer = { $in: customerIds };
    } else if (userRole === 'employee') {
      // For employees, get tasks assigned to them
      baseFilter.assignedTo = userId;
    }
    // PM can see all tasks (no additional filter)

    const stats = await Task.aggregate([
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
    console.error('Error fetching task stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching task statistics',
      error: error.message
    });
  }
};

// Add comment to task
const addTaskComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { comment } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment is required'
      });
    }

    // Find the task and populate customer details
    const task = await Task.findById(taskId).populate('customer', 'projectManager assignedTeam');
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check permissions based on user role
    let hasPermission = false;
    
    if (userRole === 'pm') {
      // PM can comment on tasks they manage
      hasPermission = task.customer.projectManager.toString() === userId;
    } else if (userRole === 'employee') {
      // Employee can comment on tasks they're assigned to or in customer's team
      hasPermission = task.assignedTo.includes(userId) || 
                     task.customer.assignedTeam.includes(userId);
    } else if (userRole === 'customer') {
      // Customer can comment on their own tasks
      hasPermission = task.customer.customer.toString() === userId;
    }

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this task'
      });
    }

    // Add comment to task
    const newComment = {
      user: userId,
      message: comment.trim(),
      timestamp: new Date()
    };

    task.comments.push(newComment);
    await task.save();

    // Populate the comment with user details
    await task.populate('comments.user', 'fullName email');

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: task.comments[task.comments.length - 1]
    });

  } catch (error) {
    console.error('Error adding task comment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete comment from task
const deleteTaskComment = async (req, res) => {
  try {
    const { taskId, commentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Find the task
    const task = await Task.findById(taskId).populate('customer', 'projectManager assignedTeam');
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Find the comment
    const comment = task.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check permissions - user can delete their own comment or PM can delete any comment
    const isCommentOwner = comment.user.toString() === userId;
    const isPM = userRole === 'pm' && task.customer.projectManager.toString() === userId;

    if (!isCommentOwner && !isPM) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to delete this comment'
      });
    }

    // Remove the comment
    task.comments.pull(commentId);
    await task.save();

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting task comment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  createTask,
  getTasksByCustomer,
  getTask,
  updateTask,
  copyTask,
  deleteTask,
  getTeamMembersForTask,
  getAllTasks,
  getTaskStats,
  addTaskComment,
  deleteTaskComment
};
