const Activity = require('../models/Activity');
const Customer = require('../models/Customer');
const Task = require('../models/Task');
const Subtask = require('../models/Subtask');
const User = require('../models/User');
const mongoose = require('mongoose');

// Helper function to handle validation errors
const handleValidationErrors = (req, res) => {
  const errors = Object.values(req.validationErrors || {});
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }
  return null;
};

// Helper function to create activity
const createActivity = async (activityData) => {
  try {
    const activity = await Activity.createActivity(activityData);
    return activity;
  } catch (error) {
    console.error('Error creating activity:', error);
    throw error;
  }
};

// @desc    Get activities for current user based on their role
// @route   GET /api/activities
// @access  Private
const getActivities = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, customerId, timeRange = '7d' } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    const result = await Activity.getActivitiesForUser(userId, userRole, {
      page: parseInt(page),
      limit: parseInt(limit),
      type,
      customerId
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activities',
      error: error.message
    });
  }
};

// @desc    Get project-specific activities
// @route   GET /api/activities/project/:projectId
// @access  Private
const getProjectActivities = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { page = 1, limit = 20, type } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if user has access to this customer
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Check permissions based on role
    let hasAccess = false;
    if (userRole === 'pm') {
      hasAccess = true;
    } else if (userRole === 'employee') {
      hasAccess = customer.assignedTeam.some(teamMember => teamMember.toString() === userId);
    } else if (userRole === 'customer') {
      hasAccess = customer.customer.toString() === userId;
    }

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this customer'
      });
    }

    const result = await Activity.getProjectActivities(customerId, {
      page: parseInt(page),
      limit: parseInt(limit),
      type
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error fetching project activities:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching project activities',
      error: error.message
    });
  }
};

// @desc    Get activity statistics
// @route   GET /api/activities/stats
// @access  Private
const getActivityStats = async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    const stats = await Activity.getActivityStats(userId, userRole, timeRange);

    res.json({
      success: true,
      data: {
        stats,
        timeRange
      }
    });

  } catch (error) {
    console.error('Error fetching activity stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activity statistics',
      error: error.message
    });
  }
};

// @desc    Create a new activity (internal use)
// @route   POST /api/activities
// @access  Private (PM only for manual creation)
const createNewActivity = async (req, res) => {
  try {
    // Only PMs can manually create activities
    if (req.user.role !== 'pm') {
      return res.status(403).json({
        success: false,
        message: 'Only project managers can manually create activities'
      });
    }

    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const {
      type,
      title,
      description,
      target,
      targetModel,
      project,
      metadata,
      priority
    } = req.body;

    const activityData = {
      type,
      title,
      description,
      actor: req.user.id,
      target,
      targetModel,
      project,
      metadata: metadata || {},
      priority: priority || 'normal'
    };

    const activity = await createActivity(activityData);

    // Populate the activity for response
    const populatedActivity = await Activity.findById(activity._id)
      .populate('actor', 'fullName email avatar role')
      .populate('project', 'name')
      .populate('target', 'title name');

    res.status(201).json({
      success: true,
      message: 'Activity created successfully',
      data: populatedActivity
    });

  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating activity',
      error: error.message
    });
  }
};

// @desc    Get activity by ID
// @route   GET /api/activities/:id
// @access  Private
const getActivityById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const activity = await Activity.findById(id)
      .populate('actor', 'fullName email avatar role')
      .populate('project', 'name')
      .populate('target', 'title name');

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    // Check if user has access to this activity
    let hasAccess = false;
    if (userRole === 'pm') {
      hasAccess = true;
    } else if (activity.project) {
      const project = await Project.findById(activity.project._id);
      if (userRole === 'employee') {
        hasAccess = project.assignedTeam.includes(userId);
      } else if (userRole === 'customer') {
        hasAccess = project.customer.toString() === userId;
      }
    } else {
      hasAccess = activity.actor._id.toString() === userId;
    }

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this activity'
      });
    }

    res.json({
      success: true,
      data: activity
    });

  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activity',
      error: error.message
    });
  }
};

// Activity creation helper functions for different types

// Note: Project activities removed - replaced with Customer activities

// Task activities
const createTaskActivity = async (taskId, type, actorId, metadata = {}) => {
  const task = await Task.findById(taskId).populate('customer', 'name');
  
  let title, description;
  
  switch (type) {
    case 'task_created':
      title = 'Task Created';
      description = `Task "${task.title}" was created`;
      break;
    case 'task_updated':
      title = 'Task Updated';
      description = `Task "${task.title}" was updated`;
      break;
    case 'task_status_changed':
      title = 'Task Status Changed';
      description = `Task "${task.title}" status changed to ${metadata.newStatus}`;
      break;
    case 'task_assigned':
      title = 'Task Assigned';
      description = `Task "${task.title}" was assigned`;
      break;
    case 'task_unassigned':
      title = 'Task Unassigned';
      description = `Task "${task.title}" was unassigned`;
      break;
    case 'task_completed':
      title = 'Task Completed';
      description = `Task "${task.title}" has been completed`;
      break;
    case 'task_cancelled':
      title = 'Task Cancelled';
      description = `Task "${task.title}" has been cancelled`;
      break;
    default:
      title = 'Task Activity';
      description = `Activity on task "${task.title}"`;
  }

  return createActivity({
    type,
    title,
    description,
    actor: actorId,
    target: taskId,
    targetModel: 'Task',
    customer: task.customer._id,
    metadata
  });
};

// Note: Milestone activities removed - replaced with Task activities

// Note: Team activities removed - replaced with Customer team activities

// Comment activities
const createCommentActivity = async (targetId, targetModel, projectId, type, actorId, metadata = {}) => {
  let title, description;
  
  switch (type) {
    case 'comment_added':
      title = 'Comment Added';
      description = `A comment was added`;
      break;
    case 'comment_updated':
      title = 'Comment Updated';
      description = `A comment was updated`;
      break;
    case 'comment_deleted':
      title = 'Comment Deleted';
      description = `A comment was deleted`;
      break;
    default:
      title = 'Comment Activity';
      description = `Comment activity`;
  }

  return createActivity({
    type,
    title,
    description,
    actor: actorId,
    target: targetId,
    targetModel,
    project: projectId,
    metadata
  });
};

// File activities
const createFileActivity = async (projectId, type, actorId, metadata = {}) => {
  let title, description;
  
  switch (type) {
    case 'file_uploaded':
      title = 'File Uploaded';
      description = `File "${metadata.filename}" was uploaded`;
      break;
    case 'file_deleted':
      title = 'File Deleted';
      description = `File "${metadata.filename}" was deleted`;
      break;
    default:
      title = 'File Activity';
      description = `File activity`;
  }

  return createActivity({
    type,
    title,
    description,
    actor: actorId,
    project: projectId,
    metadata
  });
};

// Customer activities
const createCustomerActivity = async (customerId, type, actorId, metadata = {}) => {
  const customer = await Customer.findById(customerId).populate('customer projectManager', 'fullName');
  
  let title, description;
  
  switch (type) {
    case 'customer_created':
      title = 'Customer Created';
      description = `Customer "${customer.name}" was created`;
      break;
    case 'customer_updated':
      title = 'Customer Updated';
      description = `Customer "${customer.name}" was updated`;
      break;
    case 'customer_status_changed':
      title = 'Customer Status Changed';
      description = `Customer "${customer.name}" status changed to ${metadata.newStatus}`;
      break;
    case 'customer_completed':
      title = 'Customer Completed';
      description = `Customer "${customer.name}" has been completed`;
      break;
    case 'customer_cancelled':
      title = 'Customer Cancelled';
      description = `Customer "${customer.name}" has been cancelled`;
      break;
    default:
      title = 'Customer Activity';
      description = `Activity on customer "${customer.name}"`;
  }

  return createActivity({
    type,
    title,
    description,
    actor: actorId,
    target: customerId,
    targetModel: 'Customer',
    customer: customerId,
    metadata
  });
};

// Subtask activities
const createSubtaskActivity = async (subtaskId, type, actorId, metadata = {}) => {
  const subtask = await Subtask.findById(subtaskId).populate('task customer', 'title name');
  
  let title, description;
  
  switch (type) {
    case 'subtask_created':
      title = 'Subtask Created';
      description = `Subtask "${subtask.title}" was created`;
      break;
    case 'subtask_updated':
      title = 'Subtask Updated';
      description = `Subtask "${subtask.title}" was updated`;
      break;
    case 'subtask_status_changed':
      title = 'Subtask Status Changed';
      description = `Subtask "${subtask.title}" status changed to ${metadata.newStatus}`;
      break;
    case 'subtask_assigned':
      title = 'Subtask Assigned';
      description = `Subtask "${subtask.title}" was assigned`;
      break;
    case 'subtask_unassigned':
      title = 'Subtask Unassigned';
      description = `Subtask "${subtask.title}" was unassigned`;
      break;
    case 'subtask_completed':
      title = 'Subtask Completed';
      description = `Subtask "${subtask.title}" has been completed`;
      break;
    case 'subtask_cancelled':
      title = 'Subtask Cancelled';
      description = `Subtask "${subtask.title}" has been cancelled`;
      break;
    default:
      title = 'Subtask Activity';
      description = `Activity on subtask "${subtask.title}"`;
  }

  return createActivity({
    type,
    title,
    description,
    actor: actorId,
    target: subtaskId,
    targetModel: 'Subtask',
    customer: subtask.customer._id,
    metadata
  });
};

module.exports = {
  getActivities,
  getProjectActivities,
  getActivityStats,
  createNewActivity,
  getActivityById,
  // Helper functions for creating activities
  createTaskActivity,
  createCustomerActivity,
  createSubtaskActivity,
  createCommentActivity,
  createFileActivity
};
