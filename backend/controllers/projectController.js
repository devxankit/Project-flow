const mongoose = require('mongoose');
const Project = require('../models/Project');
const Milestone = require('../models/Milestone');
const Task = require('../models/Task');
const User = require('../models/User');
const { formatFileData, deleteFile } = require('../middlewares/uploadMiddleware');
const { validationResult } = require('express-validator');
const { createProjectActivity, createTeamActivity } = require('./activityController');

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

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private (PM only)
const createProject = async (req, res) => {
  try {
    // Check validation errors
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const {
      name,
      description,
      customer,
      priority,
      dueDate,
      assignedTeam,
      status,
      tags
    } = req.body;

    // Verify customer exists and is a customer
    const customerUser = await User.findById(customer);
    if (!customerUser || customerUser.role !== 'customer') {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer selected'
      });
    }

    // Verify assigned team members exist and are employees/PMs
    if (assignedTeam && assignedTeam.length > 0) {
      const teamMembers = await User.find({
        _id: { $in: assignedTeam },
        role: { $in: ['employee', 'pm'] },
        status: 'active'
      });

      if (teamMembers.length !== assignedTeam.length) {
        return res.status(400).json({
          success: false,
          message: 'Some assigned team members are invalid or inactive'
        });
      }
    }

    // Create project data
    const projectData = {
      name,
      description,
      customer,
      projectManager: req.user.id, // Current user (PM)
      priority: priority || 'normal',
      dueDate: new Date(dueDate),
      assignedTeam: assignedTeam || [],
      status: status || 'planning',
      tags: tags || [],
      createdBy: req.user.id
    };


    // Create the project
    const project = await Project.create(projectData);

    // Update user relationships
    await User.findByIdAndUpdate(customer, {
      $addToSet: { customerProjects: project._id }
    });

    if (assignedTeam && assignedTeam.length > 0) {
      await User.updateMany(
        { _id: { $in: assignedTeam } },
        { $addToSet: { assignedProjects: project._id } }
      );
    }

    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { managedProjects: project._id }
    });

    // Create activity for project creation
    try {
      await createProjectActivity(project._id, 'project_created', req.user.id, {
        projectName: project.name,
        customer: customer,
        assignedTeam: assignedTeam || []
      });
    } catch (activityError) {
      console.error('Error creating project activity:', activityError);
      // Don't fail the project creation if activity creation fails
    }

    // Populate the project with user details
    const populatedProject = await Project.findById(project._id)
      .populate('customer', 'fullName email avatar company')
      .populate('projectManager', 'fullName email avatar department jobTitle')
      .populate('assignedTeam', 'fullName email avatar department jobTitle workTitle')
      .populate('createdBy', 'fullName email avatar');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: populatedProject
    });

  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating project',
      error: error.message
    });
  }
};

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      customer,
      projectManager,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query based on user role
    let query = {};
    
    if (req.user.role === 'customer') {
      query.customer = req.user.id;
    } else if (req.user.role === 'employee') {
      query.assignedTeam = req.user.id;
    }
    // PM can see all projects (no additional query filter)

    // Add filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (customer) query.customer = customer;
    if (projectManager) query.projectManager = projectManager;

    // Add search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const projects = await Project.find(query)
      .populate('customer', 'fullName email avatar company')
      .populate('projectManager', 'fullName email avatar department jobTitle')
      .populate('assignedTeam', 'fullName email avatar department jobTitle workTitle')
      .populate('createdBy', 'fullName email avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Project.countDocuments(query);

    res.json({
      success: true,
      data: projects,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching projects',
      error: error.message
    });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProject = async (req, res) => {
  try {
    const { id } = req.params;

    // Check permissions
    const { hasPermission, project, error } = await checkProjectPermission(
      id,
      req.user.id,
      req.user.role
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: error
      });
    }

    // Populate the project with all related data
    const populatedProject = await Project.findById(id)
      .populate('customer', 'fullName email avatar company address phone')
      .populate('projectManager', 'fullName email avatar department jobTitle workTitle phone')
      .populate('assignedTeam', 'fullName email avatar department jobTitle workTitle skills')
      .populate('tasks.assignedTo', 'fullName email avatar department jobTitle')
      .populate('tasks.createdBy', 'fullName email avatar')
      .populate('attachments.uploadedBy', 'fullName email avatar')
      .populate('createdBy', 'fullName email avatar')
      .populate('lastModifiedBy', 'fullName email avatar');

    res.json({
      success: true,
      data: populatedProject
    });

  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching project',
      error: error.message
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (PM only)
const updateProject = async (req, res) => {
  try {
    // Check validation errors
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { id } = req.params;

    // Check permissions (only PM can update)
    if (req.user.role !== 'pm') {
      return res.status(403).json({
        success: false,
        message: 'Only project managers can update projects'
      });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const {
      name,
      description,
      customer,
      priority,
      dueDate,
      assignedTeam,
      status,
      tags
    } = req.body;

    // Update project data
    const updateData = {
      lastModifiedBy: req.user.id
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (customer !== undefined) {
      // Verify customer exists
      const customerUser = await User.findById(customer);
      if (!customerUser || customerUser.role !== 'customer') {
        return res.status(400).json({
          success: false,
          message: 'Invalid customer selected'
        });
      }
      updateData.customer = customer;
    }
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);
    if (assignedTeam !== undefined) {
      // Verify team members
      if (assignedTeam.length > 0) {
        const teamMembers = await User.find({
          _id: { $in: assignedTeam },
          role: { $in: ['employee', 'pm'] },
          status: 'active'
        });

        if (teamMembers.length !== assignedTeam.length) {
          return res.status(400).json({
            success: false,
            message: 'Some assigned team members are invalid or inactive'
          });
        }
      }
      updateData.assignedTeam = assignedTeam;
    }
    if (status !== undefined) updateData.status = status;
    if (tags !== undefined) updateData.tags = tags;


    // Update the project
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    // Update user relationships if team changed
    if (assignedTeam !== undefined) {
      // Remove project from old team members
      await User.updateMany(
        { assignedProjects: id },
        { $pull: { assignedProjects: id } }
      );

      // Add project to new team members
      if (assignedTeam.length > 0) {
        await User.updateMany(
          { _id: { $in: assignedTeam } },
          { $addToSet: { assignedProjects: id } }
        );
      }
    }

    // Create activity for project update
    try {
      let activityType = 'project_updated';
      let metadata = {};

      // Check if status changed
      if (status !== undefined && status !== project.status) {
        activityType = 'project_status_changed';
        metadata.newStatus = status;
        metadata.oldStatus = project.status;
      }

      // Check if team changed
      if (assignedTeam !== undefined) {
        const oldTeamIds = project.assignedTeam.map(id => id.toString());
        const newTeamIds = assignedTeam.map(id => id.toString());
        
        if (JSON.stringify(oldTeamIds.sort()) !== JSON.stringify(newTeamIds.sort())) {
          activityType = 'team_member_added';
          metadata.assignedTeam = assignedTeam;
        }
      }

      await createProjectActivity(updatedProject._id, activityType, req.user.id, {
        projectName: updatedProject.name,
        ...metadata
      });
    } catch (activityError) {
      console.error('Error creating project update activity:', activityError);
      // Don't fail the project update if activity creation fails
    }

    // Populate the updated project
    const populatedProject = await Project.findById(updatedProject._id)
      .populate('customer', 'fullName email avatar company')
      .populate('projectManager', 'fullName email avatar department jobTitle')
      .populate('assignedTeam', 'fullName email avatar department jobTitle workTitle')
      .populate('lastModifiedBy', 'fullName email avatar');

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: populatedProject
    });

  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating project',
      error: error.message
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (PM only)
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    // Check permissions (only PM can delete)
    if (req.user.role !== 'pm') {
      return res.status(403).json({
        success: false,
        message: 'Only project managers can delete projects'
      });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Delete all attachments from Cloudinary
    if (project.attachments && project.attachments.length > 0) {
      for (const attachment of project.attachments) {
        try {
          await deleteFile(attachment.cloudinaryId, attachment.fileType === 'video' ? 'video' : 'auto');
        } catch (error) {
          console.error(`Error deleting attachment ${attachment.cloudinaryId}:`, error);
        }
      }
    }

    // Delete milestones and their attachments
    const Milestone = require('../models/Milestone');
    const milestones = await Milestone.find({ project: id });
    
    for (const milestone of milestones) {
      // Delete milestone attachments
      if (milestone.attachments && milestone.attachments.length > 0) {
        for (const attachment of milestone.attachments) {
          try {
            await deleteFile(attachment.cloudinaryId);
          } catch (error) {
            console.error(`Error deleting milestone attachment ${attachment.cloudinaryId}:`, error);
          }
        }
      }
    }
    
    // Delete all milestones for this project
    await Milestone.deleteMany({ project: id });

    // Delete task attachments
    const allAttachments = [
      ...(project.tasks?.flatMap(t => t.attachments) || [])
    ];

    for (const attachment of allAttachments) {
      try {
        await deleteFile(attachment.cloudinaryId, attachment.fileType === 'video' ? 'video' : 'auto');
      } catch (error) {
        console.error(`Error deleting attachment ${attachment.cloudinaryId}:`, error);
      }
    }

    // Remove project from user relationships
    await User.updateMany(
      { $or: [
        { managedProjects: id },
        { assignedProjects: id },
        { customerProjects: id }
      ]},
      { $pull: { 
        managedProjects: id,
        assignedProjects: id,
        customerProjects: id
      }}
    );

    // Delete the project
    await Project.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting project',
      error: error.message
    });
  }
};

// @desc    Get project statistics
// @route   GET /api/projects/stats
// @access  Private
const getProjectStats = async (req, res) => {
  try {
    let query = {};
    
    // Filter by user role
    if (req.user.role === 'customer') {
      query.customer = req.user.id;
    } else if (req.user.role === 'employee') {
      query.assignedTeam = req.user.id;
    }

    const stats = await Project.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          onHold: { $sum: { $cond: [{ $eq: ['$status', 'on-hold'] }, 1, 0] } },
          planning: { $sum: { $cond: [{ $eq: ['$status', 'planning'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
          urgent: { $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] } },
          high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
          normal: { $sum: { $cond: [{ $eq: ['$priority', 'normal'] }, 1, 0] } },
          low: { $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] } },
          avgProgress: { $avg: '$progress' }
        }
      }
    ]);

    const result = stats[0] || {
      total: 0,
      active: 0,
      completed: 0,
      onHold: 0,
      planning: 0,
      cancelled: 0,
      urgent: 0,
      high: 0,
      normal: 0,
      low: 0,
      avgProgress: 0
    };

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error fetching project stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching project statistics',
      error: error.message
    });
  }
};

// @desc    Get users for project assignment
// @route   GET /api/projects/users
// @access  Private (PM only)
const getUsersForProject = async (req, res) => {
  try {
    if (req.user.role !== 'pm') {
      return res.status(403).json({
        success: false,
        message: 'Only project managers can access this endpoint'
      });
    }

    const { type } = req.query; // 'customers', 'team', 'pms'

    let users = [];

    switch (type) {
      case 'customers':
        users = await User.findCustomersForProject();
        break;
      case 'team':
        users = await User.findForProjectAssignment();
        break;
      case 'pms':
        users = await User.findProjectManagers();
        break;
      default:
        // Return all types
        const [customers, teamMembers, pms] = await Promise.all([
          User.findCustomersForProject(),
          User.findForProjectAssignment(),
          User.findProjectManagers()
        ]);
        
        users = {
          customers,
          teamMembers,
          projectManagers: pms
        };
    }

    res.json({
      success: true,
      data: users
    });

  } catch (error) {
    console.error('Error fetching users for project:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// Add comment to task
const addTaskComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { comment } = req.body;
    const pmId = new mongoose.Types.ObjectId(req.user.id);

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment is required'
      });
    }

    // Check if PM has access to this task's project
    const task = await Task.findById(taskId).populate('project', 'projectManager');
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if PM is the project manager of this task's project
    if (task.project.projectManager.toString() !== pmId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this task'
      });
    }

    // Add comment to task
    const newComment = {
      user: pmId,
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

// Add comment to milestone
const addMilestoneComment = async (req, res) => {
  try {
    const { milestoneId } = req.params;
    const { comment } = req.body;
    const pmId = new mongoose.Types.ObjectId(req.user.id);

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment is required'
      });
    }

    // Check if PM has access to this milestone's project
    const milestone = await Milestone.findById(milestoneId).populate('project', 'projectManager');
    
    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found'
      });
    }

    // Check if PM is the project manager of this milestone's project
    if (milestone.project.projectManager.toString() !== pmId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this milestone'
      });
    }

    // Add comment to milestone
    const newComment = {
      user: pmId,
      message: comment.trim(),
      timestamp: new Date()
    };

    milestone.comments.push(newComment);
    await milestone.save();

    // Populate the comment with user details
    await milestone.populate('comments.user', 'fullName email');

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: milestone.comments[milestone.comments.length - 1]
    });

  } catch (error) {
    console.error('Error adding milestone comment:', error);
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
    const pmId = new mongoose.Types.ObjectId(req.user.id);

    // Check if PM has access to this task's project
    const task = await Task.findById(taskId).populate('project', 'projectManager');
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if PM is the project manager of this task's project
    if (task.project.projectManager.toString() !== pmId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this task'
      });
    }

    // Find the comment
    const commentIndex = task.comments.findIndex(
      comment => comment._id.toString() === commentId && comment.user.toString() === pmId.toString()
    );

    if (commentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found or access denied'
      });
    }

    // Remove comment
    task.comments.splice(commentIndex, 1);
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

// Delete comment from milestone
const deleteMilestoneComment = async (req, res) => {
  try {
    const { milestoneId, commentId } = req.params;
    const pmId = new mongoose.Types.ObjectId(req.user.id);

    // Check if PM has access to this milestone's project
    const milestone = await Milestone.findById(milestoneId).populate('project', 'projectManager');
    
    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found'
      });
    }

    // Check if PM is the project manager of this milestone's project
    if (milestone.project.projectManager.toString() !== pmId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this milestone'
      });
    }

    // Find the comment
    const commentIndex = milestone.comments.findIndex(
      comment => comment._id.toString() === commentId && comment.user.toString() === pmId.toString()
    );

    if (commentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found or access denied'
      });
    }

    // Remove comment
    milestone.comments.splice(commentIndex, 1);
    await milestone.save();

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting milestone comment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  getProjectStats,
  getUsersForProject,
  addTaskComment,
  addMilestoneComment,
  deleteTaskComment,
  deleteMilestoneComment
};
