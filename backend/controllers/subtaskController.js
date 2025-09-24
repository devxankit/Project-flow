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

    // Validate assigned user (if any) - Single assignee only
    if (assignedTo) {
      const assignedUser = await User.findOne({ 
        _id: assignedTo,
        role: { $in: ['employee', 'pm'] }
      });
      
      if (!assignedUser) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user is invalid or not an employee/PM'
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

    // Auto-generate sequence number if not provided
    let sequenceNumber = sequence;
    if (!sequenceNumber) {
      // Find the highest sequence number for this task and add 1
      const lastSubtask = await Subtask.findOne({ task })
        .sort({ sequence: -1 })
        .select('sequence');
      sequenceNumber = lastSubtask ? lastSubtask.sequence + 1 : 1;
    }

    // Create subtask
    const subtask = new Subtask({
      title,
      description: description || '',
      task,
      customer,
      status: status || 'pending',
      priority: priority || 'normal',
      assignedTo: assignedTo || null,
      dueDate,
      sequence: sequenceNumber,
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
        assignedTo: assignedTo || null
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

    // Include customer object explicitly
    const customer = permissionCheck.customer
      ? { _id: permissionCheck.customer._id, name: permissionCheck.customer.name, progress: permissionCheck.customer.progress }
      : (subtask.customer && subtask.customer._id
          ? { _id: subtask.customer._id, name: subtask.customer.name }
          : { _id: customerId });

    res.json({
      success: true,
      data: { subtask, customer }
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
        const oldAssignedId = subtask.assignedTo ? subtask.assignedTo.toString() : null;
        const newAssignedId = assignedTo ? assignedTo.toString() : null;
        
        if (oldAssignedId !== newAssignedId) {
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

    // Update parent task status based on subtask completions
    try {
      const { updateTaskStatusFromSubtasks } = require('./taskController');
      await updateTaskStatusFromSubtasks(subtask.task);
    } catch (taskStatusError) {
      console.error('Error updating task status from subtasks:', taskStatusError);
      // Don't fail the subtask update if task status update fails
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

// @desc    Copy an existing subtask
// @route   POST /api/subtasks/:subtaskId/copy
// @access  Private (PM only)
const copySubtask = async (req, res) => {
  try {
    const { subtaskId } = req.params;
    const { taskId, customerId } = req.body;

    // Check if user has permission to access the customer
    const permissionCheck = await checkCustomerPermission(customerId, req.user.id, req.user.role);
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({
        success: false,
        message: permissionCheck.error
      });
    }

    // Find the original subtask
    const originalSubtask = await Subtask.findOne({ _id: subtaskId, customer: customerId });
    if (!originalSubtask) {
      return res.status(404).json({
        success: false,
        message: 'Subtask not found'
      });
    }

    // Verify task exists and belongs to the customer
    const taskExists = await Task.findOne({ _id: taskId, customer: customerId });
    if (!taskExists) {
      return res.status(400).json({
        success: false,
        message: 'Task not found or does not belong to the specified customer'
      });
    }

    // Get the next sequence number for this task
    const lastSubtask = await Subtask.findOne({ task: taskId })
      .sort({ sequence: -1 })
      .select('sequence');
    const nextSequence = lastSubtask ? lastSubtask.sequence + 1 : 1;

    // Create the copied subtask with inherited properties
    const copiedSubtask = new Subtask({
      title: originalSubtask.title,
      description: originalSubtask.description,
      task: taskId,
      customer: customerId,
      status: 'pending', // Reset status to pending
      priority: originalSubtask.priority,
      assignedTo: originalSubtask.assignedTo, // Inherit assignments
      dueDate: originalSubtask.dueDate,
      sequence: nextSequence,
      createdBy: req.user.id
      // Exclude: attachments, comments, completion data
    });

    await copiedSubtask.save();

    // Populate the copied subtask with user data
    await copiedSubtask.populate([
      { path: 'assignedTo', select: 'fullName email avatar' },
      { path: 'createdBy', select: 'fullName email avatar' },
      { path: 'task', select: 'title' },
      { path: 'customer', select: 'name' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Subtask copied successfully',
      data: { subtask: copiedSubtask }
    });

  } catch (error) {
    console.error('Error copying subtask:', error);
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

// Add comment to subtask
const addSubtaskComment = async (req, res) => {
  try {
    const { subtaskId } = req.params;
    const { comment } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment is required'
      });
    }

    // Find the subtask and populate task and customer details
    const subtask = await Subtask.findById(subtaskId)
      .populate('task', 'customer assignedTo')
      .populate('customer', 'projectManager assignedTeam customer');
    
    if (!subtask) {
      return res.status(404).json({
        success: false,
        message: 'Subtask not found'
      });
    }

    // Check permissions based on user role
    let hasPermission = false;
    
    if (userRole === 'pm') {
      // PM can comment on subtasks they manage
      hasPermission = subtask.customer.projectManager.toString() === userId;
    } else if (userRole === 'employee') {
      // Employee can comment on subtasks they're assigned to or in customer's team
      hasPermission = (subtask.assignedTo && subtask.assignedTo.toString() === userId) || 
                     subtask.customer.assignedTeam.includes(userId) ||
                     subtask.task.assignedTo.includes(userId);
    } else if (userRole === 'customer') {
      // Customer can comment on their own subtasks
      hasPermission = subtask.customer.customer.toString() === userId;
    }

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this subtask'
      });
    }

    // Add comment to subtask
    const newComment = {
      user: userId,
      message: comment.trim(),
      timestamp: new Date()
    };

    subtask.comments.push(newComment);
    await subtask.save();

    // Populate the comment with user details
    await subtask.populate('comments.user', 'fullName email');

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: subtask.comments[subtask.comments.length - 1]
    });

  } catch (error) {
    console.error('Error adding subtask comment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete comment from subtask
const deleteSubtaskComment = async (req, res) => {
  try {
    const { subtaskId, commentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Find the subtask
    const subtask = await Subtask.findById(subtaskId)
      .populate('customer', 'projectManager assignedTeam');
    
    if (!subtask) {
      return res.status(404).json({
        success: false,
        message: 'Subtask not found'
      });
    }

    // Find the comment
    const comment = subtask.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check permissions - user can delete their own comment or PM can delete any comment
    const isCommentOwner = comment.user.toString() === userId;
    const isPM = userRole === 'pm' && subtask.customer.projectManager.toString() === userId;

    if (!isCommentOwner && !isPM) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to delete this comment'
      });
    }

    // Remove the comment
    subtask.comments.pull(commentId);
    await subtask.save();

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting subtask comment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update subtask status (for assigned employees)
const updateSubtaskStatus = async (req, res) => {
  try {
    const { subtaskId, customerId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Validate status
    const validStatuses = ['pending', 'in-progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
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

    // Check permissions
    let hasPermission = false;
    
    if (userRole === 'pm') {
      // PM can update any subtask
      hasPermission = true;
    } else if (userRole === 'employee') {
      // Employee can only update subtasks assigned to them
      hasPermission = subtask.assignedTo && subtask.assignedTo.toString() === userId;
    }

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this subtask'
      });
    }

    // Update status
    const oldStatus = subtask.status;
    subtask.status = status;
    
    // Set completedBy if status is completed
    if (status === 'completed') {
      subtask.completedBy = userId;
      subtask.completedAt = new Date();
    } else {
      subtask.completedBy = undefined;
      subtask.completedAt = undefined;
    }

    await subtask.save();

    // Create activity log
    try {
      await createSubtaskActivity(subtask._id, 'subtask_status_changed', userId, {
        subtaskTitle: subtask.title,
        oldStatus,
        newStatus: status
      });
    } catch (activityError) {
      console.error('Error creating subtask activity:', activityError);
      // Don't fail the update if activity creation fails
    }

    // Update parent task status based on subtask completions
    try {
      const { updateTaskStatusFromSubtasks } = require('./taskController');
      await updateTaskStatusFromSubtasks(subtask.task);
    } catch (taskStatusError) {
      console.error('Error updating task status from subtasks:', taskStatusError);
      // Don't fail the subtask update if task status update fails
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
      message: 'Subtask status updated successfully',
      data: subtask
    });

  } catch (error) {
    console.error('Error updating subtask status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating subtask status',
      error: error.message
    });
  }
};

module.exports = {
  createSubtask,
  getSubtasksByTask,
  getSubtask,
  updateSubtask,
  updateSubtaskStatus,
  copySubtask,
  deleteSubtask,
  getSubtaskStats,
  addSubtaskComment,
  deleteSubtaskComment
};
