const TaskRequest = require('../models/TaskRequest');
const Project = require('../models/Project');
const Milestone = require('../models/Milestone');
const Task = require('../models/Task');
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
      project,
      milestone,
      priority,
      dueDate,
      reason
    } = req.body;

    const customerId = new mongoose.Types.ObjectId(req.user.id);

    // Verify customer has access to the project
    const projectExists = await Project.findOne({
      _id: project,
      customer: customerId
    });

    if (!projectExists) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or access denied'
      });
    }

    // Verify milestone belongs to the project
    const milestoneExists = await Milestone.findOne({
      _id: milestone,
      project: project
    });

    if (!milestoneExists) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found or does not belong to this project'
      });
    }

    // Create task request
    const taskRequest = new TaskRequest({
      title,
      description,
      project,
      milestone,
      priority,
      dueDate: new Date(dueDate),
      reason,
      requestedBy: customerId
    });

    await taskRequest.save();

    // Populate the response
    await taskRequest.populate([
      { path: 'project', select: 'name' },
      { path: 'milestone', select: 'title' },
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
    const { status, project } = req.query;

    // Build query
    const query = { requestedBy: customerId };
    
    if (status) {
      query.status = status;
    }
    
    if (project) {
      query.project = new mongoose.Types.ObjectId(project);
    }

    const taskRequests = await TaskRequest.find(query)
      .populate('project', 'name')
      .populate('milestone', 'title')
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
      .populate('project', 'name description')
      .populate('milestone', 'title description')
      .populate('requestedBy', 'fullName email')
      .populate('reviewedBy', 'fullName email')
      .populate('createdTask', 'title status');

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
      { path: 'project', select: 'name' },
      { path: 'milestone', select: 'title' },
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

// Get task requests for PM (all requests for their projects)
const getPMTaskRequests = async (req, res) => {
  try {
    const pmId = new mongoose.Types.ObjectId(req.user.id);
    const { status, project } = req.query;

    // Get projects managed by this PM
    const projects = await Project.find({ projectManager: pmId }).select('_id');
    const projectIds = projects.map(p => p._id);

    if (projectIds.length === 0) {
      return res.json({
        success: true,
        data: []
      });
    }

    // Build query
    const query = { project: { $in: projectIds } };
    
    if (status) {
      query.status = status;
    }
    
    if (project) {
      query.project = new mongoose.Types.ObjectId(project);
    }

    const taskRequests = await TaskRequest.find(query)
      .populate('project', 'name')
      .populate('milestone', 'title')
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
      .populate('project', 'projectManager');

    if (!taskRequest) {
      return res.status(404).json({
        success: false,
        message: 'Task request not found'
      });
    }

    // Check if PM has access to this project
    if (taskRequest.project.projectManager.toString() !== pmId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only review requests for your projects'
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

    // If approved, create a task
    if (action === 'approve') {
      const newTask = new Task({
        title: taskRequest.title,
        description: taskRequest.description,
        project: taskRequest.project._id,
        milestone: taskRequest.milestone,
        priority: taskRequest.priority,
        dueDate: taskRequest.dueDate,
        status: 'pending',
        requestedBy: taskRequest.requestedBy,
        createdFromRequest: true
      });

      await newTask.save();
      taskRequest.createdTask = newTask._id;
    }

    await taskRequest.save();

    // Populate the response
    await taskRequest.populate([
      { path: 'project', select: 'name' },
      { path: 'milestone', select: 'title' },
      { path: 'requestedBy', select: 'fullName email' },
      { path: 'reviewedBy', select: 'fullName email' },
      { path: 'createdTask', select: 'title status' }
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
