const Project = require('../models/Project');
const Milestone = require('../models/Milestone');
const Task = require('../models/Task');
const User = require('../models/User');
const { formatFileData, deleteFile } = require('../middlewares/uploadMiddleware');
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

// Helper function to check if user has permission to access project
const checkProjectPermission = async (projectId, userId, userRole) => {
  const project = await Project.findById(projectId);
  if (!project) {
    return { hasPermission: false, error: 'Project not found' };
  }

  // PM can access all projects
  if (userRole === 'pm') {
    return { hasPermission: true, project };
  }

  // Customer can only access their own projects
  if (userRole === 'customer') {
    if (project.customer.toString() === userId) {
      return { hasPermission: true, project };
    }
    return { hasPermission: false, error: 'Access denied' };
  }

  // Employee can access projects they're assigned to
  if (userRole === 'employee') {
    const isAssigned = project.assignedTeam.some(teamMember => 
      teamMember.toString() === userId
    );
    if (isAssigned) {
      return { hasPermission: true, project };
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

    const { title, description, milestone, project, status, priority, assignedTo, dueDate } = taskData;

    // Check if user has permission to access the project
    const permissionCheck = await checkProjectPermission(project, req.user.id, req.user.role);
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({
        success: false,
        message: permissionCheck.error
      });
    }

    // Verify milestone exists and belongs to the project
    const milestoneExists = await Milestone.findOne({ _id: milestone, project: project });
    if (!milestoneExists) {
      return res.status(400).json({
        success: false,
        message: 'Milestone not found or does not belong to the specified project'
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
        .map(file => {
          // Extract public_id from path if not directly available
          let cloudinaryId = file.public_id || file.cloudinaryId;
          if (!cloudinaryId && file.path) {
            // Extract public_id from Cloudinary URL
            const pathParts = file.path.split('/');
            if (pathParts.length >= 2) {
              const lastPart = pathParts[pathParts.length - 1];
              cloudinaryId = lastPart.split('.')[0]; // Remove file extension
            }
          }
          
          return {
            filename: file.filename || file.originalname,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            cloudinaryId: cloudinaryId,
            url: file.path || file.url,
            uploadedAt: new Date()
          };
        })
        .filter(attachment => attachment.url); // Only include valid attachments
    }

    // Create task
    const task = new Task({
      title,
      description: description || '',
      milestone,
      project,
      status: status || 'pending',
      priority: priority || 'normal',
      assignedTo: assignedTo || [],
      dueDate,
      attachments,
      createdBy: req.user.id
    });

    await task.save();

    // Populate the created task with user data
    await task.populate([
      { path: 'assignedTo', select: 'fullName email avatar' },
      { path: 'createdBy', select: 'fullName email avatar' },
      { path: 'milestone', select: 'title' },
      { path: 'project', select: 'name' }
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

// @desc    Get tasks for a milestone
// @route   GET /api/tasks/milestone/:milestoneId/project/:projectId
// @access  Private
const getTasksByMilestone = async (req, res) => {
  try {
    const { milestoneId, projectId } = req.params;

    // Check if user has permission to access the project
    const permissionCheck = await checkProjectPermission(projectId, req.user.id, req.user.role);
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({
        success: false,
        message: permissionCheck.error
      });
    }

    // Verify milestone exists and belongs to the project
    const milestone = await Milestone.findOne({ _id: milestoneId, project: projectId });
    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found'
      });
    }

    // Get tasks for the milestone
    const tasks = await Task.find({ milestone: milestoneId })
      .populate('assignedTo', 'fullName email avatar')
      .populate('createdBy', 'fullName email avatar')
      .populate('completedBy', 'fullName email avatar')
      .populate('comments.user', 'fullName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { tasks, milestone }
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
// @route   GET /api/tasks/:taskId/project/:projectId
// @access  Private
const getTask = async (req, res) => {
  try {
    const { taskId, projectId } = req.params;
    console.log('getTask called with taskId:', taskId, 'projectId:', projectId, 'type:', typeof projectId);

    // Check if user has permission to access the project
    const permissionCheck = await checkProjectPermission(projectId, req.user.id, req.user.role);
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({
        success: false,
        message: permissionCheck.error
      });
    }

    // Get task with populated data
    const task = await Task.findOne({ _id: taskId, project: projectId })
      .populate('assignedTo', 'fullName email avatar')
      .populate('createdBy', 'fullName email avatar')
      .populate('completedBy', 'fullName email avatar')
      .populate('milestone', 'title')
      .populate('project', 'name')
      .populate('comments.user', 'fullName email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: { task }
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
// @route   PUT /api/tasks/:taskId/project/:projectId
// @access  Private (PM only)
const updateTask = async (req, res) => {
  try {
    const { taskId, projectId } = req.params;
    
    // Handle both JSON and FormData requests
    let taskData;
    if (req.body.taskData) {
      // FormData request with taskData as JSON string
      taskData = JSON.parse(req.body.taskData);
    } else {
      // Regular JSON request
      taskData = req.body;
    }
    
    const { title, description, status, priority, assignedTo, dueDate } = taskData;

    // Check if user has permission to access the project
    const permissionCheck = await checkProjectPermission(projectId, req.user.id, req.user.role);
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({
        success: false,
        message: permissionCheck.error
      });
    }

    // Find the task
    const task = await Task.findOne({ _id: taskId, project: projectId });
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
        .map(file => {
          // Extract public_id from path if not directly available
          let cloudinaryId = file.public_id || file.cloudinaryId;
          if (!cloudinaryId && file.path) {
            const pathParts = file.path.split('/');
            if (pathParts.length >= 2) {
              const lastPart = pathParts[pathParts.length - 1];
              cloudinaryId = lastPart.split('.')[0];
            }
          }
          
          return {
            filename: file.filename || file.originalname,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            cloudinaryId: cloudinaryId,
            url: file.path || file.url,
            uploadedAt: new Date()
          };
        })
        .filter(attachment => attachment.url);
      
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

    // Populate the updated task
    await task.populate([
      { path: 'assignedTo', select: 'fullName email avatar' },
      { path: 'createdBy', select: 'fullName email avatar' },
      { path: 'completedBy', select: 'fullName email avatar' },
      { path: 'milestone', select: 'title' },
      { path: 'project', select: 'name' }
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

// @desc    Delete task
// @route   DELETE /api/tasks/:taskId/project/:projectId
// @access  Private (PM only)
const deleteTask = async (req, res) => {
  try {
    const { taskId, projectId } = req.params;

    // Check if user has permission to access the project
    const permissionCheck = await checkProjectPermission(projectId, req.user.id, req.user.role);
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({
        success: false,
        message: permissionCheck.error
      });
    }

    // Find and delete the task
    const task = await Task.findOneAndDelete({ _id: taskId, project: projectId });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
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
// @route   GET /api/tasks/team/:projectId
// @access  Private
const getTeamMembersForTask = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Check if user has permission to access the project
    const permissionCheck = await checkProjectPermission(projectId, req.user.id, req.user.role);
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({
        success: false,
        message: permissionCheck.error
      });
    }

    // Get active employees and PMs assigned to the project
    const teamMembers = await User.find({
      _id: { $in: permissionCheck.project.assignedTeam },
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
    const { page = 1, limit = 10, status, priority, project, milestone, assignedTo } = req.query;
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

    // Add project filter
    if (project) {
      filter.project = project;
    }

    // Add milestone filter
    if (milestone) {
      filter.milestone = milestone;
    }

    // Add assigned user filter
    if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get tasks with populated fields
    const tasks = await Task.find(filter)
      .populate('project', 'name description status priority')
      .populate('milestone', 'name description status')
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
      // For customers, get tasks from their projects
      const userProjects = await Project.find({ customer: userId }).select('_id');
      const projectIds = userProjects.map(p => p._id);
      baseFilter.project = { $in: projectIds };
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

module.exports = {
  createTask,
  getTasksByMilestone,
  getTask,
  updateTask,
  deleteTask,
  getTeamMembersForTask,
  getAllTasks,
  getTaskStats
};
