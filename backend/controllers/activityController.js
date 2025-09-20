const Activity = require('../models/Activity');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Milestone = require('../models/Milestone');
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
    const { page = 1, limit = 20, type, projectId, timeRange = '7d' } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    const result = await Activity.getActivitiesForUser(userId, userRole, {
      page: parseInt(page),
      limit: parseInt(limit),
      type,
      projectId
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
    const { projectId } = req.params;
    const { page = 1, limit = 20, type } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if user has access to this project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permissions based on role
    let hasAccess = false;
    if (userRole === 'pm') {
      hasAccess = true;
    } else if (userRole === 'employee') {
      hasAccess = project.assignedTeam.includes(userId);
    } else if (userRole === 'customer') {
      hasAccess = project.customer.toString() === userId;
    }

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this project'
      });
    }

    const result = await Activity.getProjectActivities(projectId, {
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

// Project activities
const createProjectActivity = async (projectId, type, actorId, metadata = {}) => {
  const project = await Project.findById(projectId).populate('customer projectManager', 'fullName');
  
  let title, description;
  
  switch (type) {
    case 'project_created':
      title = 'Project Created';
      description = `Project "${project.name}" was created`;
      break;
    case 'project_updated':
      title = 'Project Updated';
      description = `Project "${project.name}" was updated`;
      break;
    case 'project_status_changed':
      title = 'Project Status Changed';
      description = `Project "${project.name}" status changed to ${metadata.newStatus}`;
      break;
    case 'project_completed':
      title = 'Project Completed';
      description = `Project "${project.name}" has been completed`;
      break;
    case 'project_cancelled':
      title = 'Project Cancelled';
      description = `Project "${project.name}" has been cancelled`;
      break;
    default:
      title = 'Project Activity';
      description = `Activity on project "${project.name}"`;
  }

  return createActivity({
    type,
    title,
    description,
    actor: actorId,
    target: projectId,
    targetModel: 'Project',
    project: projectId,
    metadata
  });
};

// Task activities
const createTaskActivity = async (taskId, type, actorId, metadata = {}) => {
  const task = await Task.findById(taskId).populate('project milestone', 'name title');
  
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
    project: task.project._id,
    metadata
  });
};

// Milestone activities
const createMilestoneActivity = async (milestoneId, type, actorId, metadata = {}) => {
  const milestone = await Milestone.findById(milestoneId).populate('project', 'name');
  
  let title, description;
  
  switch (type) {
    case 'milestone_created':
      title = 'Milestone Created';
      description = `Milestone "${milestone.title}" was created`;
      break;
    case 'milestone_updated':
      title = 'Milestone Updated';
      description = `Milestone "${milestone.title}" was updated`;
      break;
    case 'milestone_status_changed':
      title = 'Milestone Status Changed';
      description = `Milestone "${milestone.title}" status changed to ${metadata.newStatus}`;
      break;
    case 'milestone_completed':
      title = 'Milestone Completed';
      description = `Milestone "${milestone.title}" has been completed`;
      break;
    case 'milestone_cancelled':
      title = 'Milestone Cancelled';
      description = `Milestone "${milestone.title}" has been cancelled`;
      break;
    default:
      title = 'Milestone Activity';
      description = `Activity on milestone "${milestone.title}"`;
  }

  return createActivity({
    type,
    title,
    description,
    actor: actorId,
    target: milestoneId,
    targetModel: 'Milestone',
    project: milestone.project._id,
    metadata
  });
};

// Team activities
const createTeamActivity = async (projectId, type, actorId, metadata = {}) => {
  const project = await Project.findById(projectId).populate('assignedTeam', 'fullName');
  
  let title, description;
  
  switch (type) {
    case 'team_member_added':
      title = 'Team Member Added';
      description = `${metadata.memberName} was added to the project team`;
      break;
    case 'team_member_removed':
      title = 'Team Member Removed';
      description = `${metadata.memberName} was removed from the project team`;
      break;
    default:
      title = 'Team Activity';
      description = `Team activity on project "${project.name}"`;
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

module.exports = {
  getActivities,
  getProjectActivities,
  getActivityStats,
  createNewActivity,
  getActivityById,
  // Helper functions for creating activities
  createProjectActivity,
  createTaskActivity,
  createMilestoneActivity,
  createTeamActivity,
  createCommentActivity,
  createFileActivity
};
