const mongoose = require('mongoose');
const Project = require('../models/Project');
const Milestone = require('../models/Milestone');
const Task = require('../models/Task');
const User = require('../models/User');
const { formatFileData, deleteFile } = require('../middlewares/uploadMiddleware');
const { validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

// Helper function to check if customer has access to project
const checkCustomerProjectAccess = async (projectId, customerId) => {
  const project = await Project.findOne({ 
    _id: projectId, 
    customer: customerId 
  });
  return project;
};

// @desc    Get customer dashboard statistics
// @route   GET /api/customer/dashboard
// @access  Private (Customer only)
const getCustomerDashboard = async (req, res) => {
  try {
    const customerId = new mongoose.Types.ObjectId(req.user.id);

    // Get customer's projects
    const projects = await Project.find({ customer: customerId })
      .populate('projectManager', 'fullName email avatar')
      .populate('assignedTeam', 'fullName email avatar')
      .sort({ updatedAt: -1 });

    // Calculate project statistics
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const planningProjects = projects.filter(p => p.status === 'planning').length;

    // Get task statistics across all customer projects
    const projectIds = projects.map(p => p._id);
    const taskStats = await Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $lt: ['$dueDate', new Date()] },
                    { $ne: ['$status', 'completed'] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const taskCounts = taskStats[0] || { total: 0, completed: 0, inProgress: 0, pending: 0, overdue: 0 };

    // Get milestone statistics
    const milestoneStats = await Milestone.aggregate([
      { $match: { project: { $in: projectIds } } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } }
        }
      }
    ]);

    const milestoneCounts = milestoneStats[0] || { total: 0, completed: 0, inProgress: 0, pending: 0 };

    // Calculate overall progress
    const totalItems = taskCounts.total + milestoneCounts.total;
    const completedItems = taskCounts.completed + milestoneCounts.completed;
    const overallProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    // Get recent projects for dashboard
    const recentProjects = projects.slice(0, 4).map(project => ({
      _id: project._id,
      name: project.name,
      description: project.description,
      status: project.status,
      progress: project.progress,
      assignedTeam: project.assignedTeam,
      dueDate: project.dueDate,
      priority: project.priority,
      totalTasks: 0, // Will be calculated separately
      completedTasks: 0,
      dueSoonTasks: 0,
      overdueTasks: 0
    }));

    // Get task counts for recent projects
    const projectsWithTaskCounts = await Promise.all(
      recentProjects.map(async (project) => {
        const taskCounts = await Task.aggregate([
          { $match: { project: project._id } },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
              dueSoon: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $gte: ['$dueDate', new Date()] },
                        { $lte: ['$dueDate', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)] },
                        { $ne: ['$status', 'completed'] }
                      ]
                    },
                    1,
                    0
                  ]
                }
              },
              overdue: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $lt: ['$dueDate', new Date()] },
                        { $ne: ['$status', 'completed'] }
                      ]
                    },
                    1,
                    0
                  ]
                }
              }
            }
          }
        ]);

        const counts = taskCounts[0] || { total: 0, completed: 0, dueSoon: 0, overdue: 0 };
        
        return {
          ...project,
          totalTasks: counts.total,
          completedTasks: counts.completed,
          dueSoonTasks: counts.dueSoon,
          overdueTasks: counts.overdue
        };
      })
    );

    res.json({
      success: true,
      data: {
        statistics: {
          projects: {
            total: totalProjects,
            active: activeProjects,
            completed: completedProjects,
            planning: planningProjects
          },
          tasks: taskCounts,
          milestones: milestoneCounts,
          overallProgress
        },
        recentProjects: projectsWithTaskCounts
      }
    });

  } catch (error) {
    console.error('Error fetching customer dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
};

// @desc    Get customer projects
// @route   GET /api/customer/projects
// @access  Private (Customer only)
const getCustomerProjects = async (req, res) => {
  try {
    const customerId = new mongoose.Types.ObjectId(req.user.id);
    const { page = 1, limit = 10, status, priority } = req.query;

    // Build query
    let query = { customer: customerId };
    
    if (status) query.status = status;
    if (priority) query.priority = priority;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get projects with populated data
    const projects = await Project.find(query)
      .populate('projectManager', 'fullName email avatar')
      .populate('assignedTeam', 'fullName email avatar')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get task counts for each project
    const projectsWithTaskCounts = await Promise.all(
      projects.map(async (project) => {
        const taskCounts = await Task.aggregate([
          { $match: { project: project._id } },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
              inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
              pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
              dueSoon: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $gte: ['$dueDate', new Date()] },
                        { $lte: ['$dueDate', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)] },
                        { $ne: ['$status', 'completed'] }
                      ]
                    },
                    1,
                    0
                  ]
                }
              },
              overdue: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $lt: ['$dueDate', new Date()] },
                        { $ne: ['$status', 'completed'] }
                      ]
                    },
                    1,
                    0
                  ]
                }
              }
            }
          }
        ]);

        const counts = taskCounts[0] || { total: 0, completed: 0, inProgress: 0, pending: 0, dueSoon: 0, overdue: 0 };
        
        return {
          ...project.toObject(),
          totalTasks: counts.total,
          completedTasks: counts.completed,
          inProgressTasks: counts.inProgress,
          pendingTasks: counts.pending,
          dueSoonTasks: counts.dueSoon,
          overdueTasks: counts.overdue
        };
      })
    );

    // Get total count for pagination
    const total = await Project.countDocuments(query);

    res.json({
      success: true,
      data: {
        projects: projectsWithTaskCounts,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching customer projects:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching projects',
      error: error.message
    });
  }
};

// @desc    Get customer project details
// @route   GET /api/customer/projects/:id
// @access  Private (Customer only)
const getCustomerProjectDetails = async (req, res) => {
  try {
    // Handle validation errors
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { id } = req.params;
    const customerId = new mongoose.Types.ObjectId(req.user.id);

    // Check if customer has access to this project
    const project = await checkCustomerProjectAccess(id, customerId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or access denied'
      });
    }

    // Get project with populated data
    const projectDetails = await Project.findById(id)
      .populate('customer', 'fullName email company')
      .populate('projectManager', 'fullName email avatar')
      .populate('assignedTeam', 'fullName email avatar role');

    // Get milestones for this project
    const milestones = await Milestone.find({ project: id })
      .populate('assignedTo', 'fullName email avatar')
      .sort({ sequence: 1 });

    // Get tasks for this project
    const tasks = await Task.find({ project: id })
      .populate('assignedTo', 'fullName email avatar')
      .populate('milestone', 'title sequence')
      .sort({ createdAt: -1 });

    // Get task counts for each milestone
    const milestonesWithTaskCounts = await Promise.all(
      milestones.map(async (milestone) => {
        const taskCounts = await Task.aggregate([
          { $match: { milestone: milestone._id } },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
              inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
              pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } }
            }
          }
        ]);

        const counts = taskCounts[0] || { total: 0, completed: 0, inProgress: 0, pending: 0 };
        
        return {
          ...milestone.toObject(),
          totalTasks: counts.total,
          completedTasks: counts.completed,
          inProgressTasks: counts.inProgress,
          pendingTasks: counts.pending
        };
      })
    );

    // Get overall task statistics for this project
    const projectTaskStats = await Task.aggregate([
      { $match: { project: id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          dueSoon: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ['$dueDate', new Date()] },
                    { $lte: ['$dueDate', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)] },
                    { $ne: ['$status', 'completed'] }
                  ]
                },
                1,
                0
              ]
            }
          },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $lt: ['$dueDate', new Date()] },
                    { $ne: ['$status', 'completed'] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const taskStats = projectTaskStats[0] || { total: 0, completed: 0, inProgress: 0, pending: 0, dueSoon: 0, overdue: 0 };

    res.json({
      success: true,
      data: {
        project: {
          ...projectDetails.toObject(),
          totalTasks: taskStats.total,
          completedTasks: taskStats.completed,
          inProgressTasks: taskStats.inProgress,
          pendingTasks: taskStats.pending,
          dueSoonTasks: taskStats.dueSoon,
          overdueTasks: taskStats.overdue
        },
        milestones: milestonesWithTaskCounts,
        tasks: tasks
      }
    });

  } catch (error) {
    console.error('Error fetching customer project details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching project details',
      error: error.message
    });
  }
};

// @desc    Get customer task details
// @route   GET /api/customer/tasks/:id
// @access  Private (Customer only)
const getCustomerTaskDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = new mongoose.Types.ObjectId(req.user.id);

    // Get task with project information
    const task = await Task.findById(id)
      .populate('project', 'name customer')
      .populate('milestone', 'title description')
      .populate('assignedTo', 'fullName email avatar')
      .populate('createdBy', 'fullName email avatar');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if customer has access to this task's project
    if (task.project.customer.toString() !== customerId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this task'
      });
    }

    res.json({
      success: true,
      data: {
        task
      }
    });

  } catch (error) {
    console.error('Error fetching customer task details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching task details',
      error: error.message
    });
  }
};

// @desc    Get customer milestone details
// @route   GET /api/customer/milestones/:id
// @access  Private (Customer only)
const getCustomerMilestoneDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = new mongoose.Types.ObjectId(req.user.id);

    // Get milestone with project information
    const milestone = await Milestone.findById(id)
      .populate('project', 'name customer')
      .populate('assignedTo', 'fullName email avatar')
      .populate('createdBy', 'fullName email avatar');

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found'
      });
    }

    // Check if customer has access to this milestone's project
    if (milestone.project.customer.toString() !== customerId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this milestone'
      });
    }

    // Get tasks for this milestone
    const tasks = await Task.find({ milestone: id })
      .populate('assignedTo', 'fullName email avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        milestone,
        tasks
      }
    });

  } catch (error) {
    console.error('Error fetching customer milestone details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching milestone details',
      error: error.message
    });
  }
};

// @desc    Get customer files
// @route   GET /api/customer/files
// @access  Private (Customer only)
const getCustomerFiles = async (req, res) => {
  try {
    const customerId = new mongoose.Types.ObjectId(req.user.id);
    const { page = 1, limit = 20, type, project } = req.query;

    // Get customer's projects
    const customerProjects = await Project.find({ customer: customerId }).select('_id name');
    const projectIds = customerProjects.map(p => p._id);

    if (projectIds.length === 0) {
      return res.json({
        success: true,
        data: {
          files: [],
          pagination: {
            current: parseInt(page),
            pages: 0,
            total: 0,
            limit: parseInt(limit)
          }
        }
      });
    }

    // Build aggregation pipeline for files
    const pipeline = [
      {
        $match: {
          project: { $in: projectIds }
        }
      },
      {
        $unwind: '$attachments'
      },
      {
        $lookup: {
          from: 'projects',
          localField: 'project',
          foreignField: '_id',
          as: 'projectInfo'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'attachments.uploadedBy',
          foreignField: '_id',
          as: 'uploaderInfo'
        }
      },
      {
        $addFields: {
          'attachments.projectName': { $arrayElemAt: ['$projectInfo.name', 0] },
          'attachments.taskTitle': '$title',
          'attachments.uploadedByName': { $arrayElemAt: ['$uploaderInfo.fullName', 0] }
        }
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ['$attachments', { taskId: '$_id' }]
          }
        }
      }
    ];

    // Add type filter if specified
    if (type && type !== 'all') {
      pipeline.push({
        $match: {
          $or: [
            { mimetype: { $regex: type, $options: 'i' } },
            { originalName: { $regex: `\\.${type}$`, $options: 'i' } }
          ]
        }
      });
    }

    // Add project filter if specified
    if (project) {
      pipeline.push({
        $match: { projectName: { $regex: project, $options: 'i' } }
      });
    }

    // Add pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    pipeline.push(
      { $sort: { uploadedAt: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    );

    // Execute aggregation
    const files = await Task.aggregate(pipeline);

    // Get total count for pagination
    const countPipeline = [...pipeline];
    countPipeline.splice(-3); // Remove sort, skip, limit
    countPipeline.push({ $count: 'total' });
    const countResult = await Task.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    res.json({
      success: true,
      data: {
        files,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching customer files:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching files',
      error: error.message
    });
  }
};

// @desc    Get customer activity feed
// @route   GET /api/customer/activity
// @access  Private (Customer only)
const getCustomerActivity = async (req, res) => {
  try {
    const customerId = new mongoose.Types.ObjectId(req.user.id);
    const { page = 1, limit = 20, type } = req.query;

    // Get customer's projects
    const customerProjects = await Project.find({ customer: customerId }).select('_id name');
    const projectIds = customerProjects.map(p => p._id);

    if (projectIds.length === 0) {
      return res.json({
        success: true,
        data: {
          activities: [],
          pagination: {
            current: parseInt(page),
            pages: 0,
            total: 0,
            limit: parseInt(limit)
          }
        }
      });
    }

    // Get recent activities from tasks and milestones
    const activities = [];

    // Get task activities
    const taskActivities = await Task.find({ project: { $in: projectIds } })
      .populate('project', 'name')
      .populate('milestone', 'title')
      .populate('assignedTo', 'fullName email avatar')
      .populate('createdBy', 'fullName email avatar')
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit));

    // Format task activities
    taskActivities.forEach(task => {
      activities.push({
        id: `task-${task._id}`,
        type: 'task_updated',
        title: 'Task updated',
        description: `Task "${task.title}" was updated`,
        timestamp: task.updatedAt,
        user: task.assignedTo[0]?.fullName || 'Unknown',
        project: task.project.name,
        milestone: task.milestone?.title,
        icon: 'CheckSquare',
        color: 'text-green-600',
        shareable: true
      });
    });

    // Get milestone activities
    const milestoneActivities = await Milestone.find({ project: { $in: projectIds } })
      .populate('project', 'name')
      .populate('assignedTo', 'fullName email avatar')
      .populate('createdBy', 'fullName email avatar')
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit));

    // Format milestone activities
    milestoneActivities.forEach(milestone => {
      activities.push({
        id: `milestone-${milestone._id}`,
        type: 'milestone_updated',
        title: 'Milestone updated',
        description: `Milestone "${milestone.title}" was updated`,
        timestamp: milestone.updatedAt,
        user: milestone.assignedTo[0]?.fullName || 'Unknown',
        project: milestone.project.name,
        milestone: milestone.title,
        icon: 'Target',
        color: 'text-blue-600',
        shareable: true
      });
    });

    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Apply type filter if specified
    let filteredActivities = activities;
    if (type && type !== 'all') {
      filteredActivities = activities.filter(activity => activity.type === type);
    }

    // Apply pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedActivities = filteredActivities.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: {
        activities: paginatedActivities,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(filteredActivities.length / parseInt(limit)),
          total: filteredActivities.length,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching customer activity:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activity feed',
      error: error.message
    });
  }
};

// Upload file to task
const uploadTaskFile = async (req, res) => {
  try {
    const { taskId } = req.params;
    const customerId = new mongoose.Types.ObjectId(req.user.id);

    // Check if customer has access to this task
    const task = await Task.findOne({
      _id: taskId,
      project: { $in: await Project.find({ customer: customerId }).select('_id') }
    }).populate('project', 'customer');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or access denied'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Create file object
    const fileData = {
      name: req.file.originalname,
      url: req.file.path,
      size: req.file.size,
      type: req.file.mimetype,
      uploadedBy: customerId,
      uploadedAt: new Date()
    };

    // Add file to task attachments
    task.attachments.push(fileData);
    await task.save();

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: fileData
    });

  } catch (error) {
    console.error('Error uploading task file:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Upload file to milestone
const uploadMilestoneFile = async (req, res) => {
  try {
    const { milestoneId } = req.params;
    const customerId = new mongoose.Types.ObjectId(req.user.id);

    // Check if customer has access to this milestone
    const milestone = await Milestone.findOne({
      _id: milestoneId,
      project: { $in: await Project.find({ customer: customerId }).select('_id') }
    }).populate('project', 'customer');

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found or access denied'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Create file object
    const fileData = {
      name: req.file.originalname,
      url: req.file.path,
      size: req.file.size,
      type: req.file.mimetype,
      uploadedBy: customerId,
      uploadedAt: new Date()
    };

    // Add file to milestone attachments
    milestone.attachments.push(fileData);
    await milestone.save();

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: fileData
    });

  } catch (error) {
    console.error('Error uploading milestone file:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete file from task
const deleteTaskFile = async (req, res) => {
  try {
    const { taskId, fileId } = req.params;
    const customerId = new mongoose.Types.ObjectId(req.user.id);

    // Check if customer has access to this task
    const task = await Task.findOne({
      _id: taskId,
      project: { $in: await Project.find({ customer: customerId }).select('_id') }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or access denied'
      });
    }

    // Find the file
    const fileIndex = task.attachments.findIndex(
      file => file._id.toString() === fileId && file.uploadedBy.toString() === customerId.toString()
    );

    if (fileIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'File not found or access denied'
      });
    }

    const file = task.attachments[fileIndex];

    // Delete file from filesystem
    try {
      if (fs.existsSync(file.url)) {
        fs.unlinkSync(file.url);
      }
    } catch (fsError) {
      console.error('Error deleting file from filesystem:', fsError);
    }

    // Remove file from task
    task.attachments.splice(fileIndex, 1);
    await task.save();

    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting task file:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete file from milestone
const deleteMilestoneFile = async (req, res) => {
  try {
    const { milestoneId, fileId } = req.params;
    const customerId = new mongoose.Types.ObjectId(req.user.id);

    // Check if customer has access to this milestone
    const milestone = await Milestone.findOne({
      _id: milestoneId,
      project: { $in: await Project.find({ customer: customerId }).select('_id') }
    });

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found or access denied'
      });
    }

    // Find the file
    const fileIndex = milestone.attachments.findIndex(
      file => file._id.toString() === fileId && file.uploadedBy.toString() === customerId.toString()
    );

    if (fileIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'File not found or access denied'
      });
    }

    const file = milestone.attachments[fileIndex];

    // Delete file from filesystem
    try {
      if (fs.existsSync(file.url)) {
        fs.unlinkSync(file.url);
      }
    } catch (fsError) {
      console.error('Error deleting file from filesystem:', fsError);
    }

    // Remove file from milestone
    milestone.attachments.splice(fileIndex, 1);
    await milestone.save();

    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting milestone file:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Add comment to task
const addTaskComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { comment } = req.body;
    const customerId = new mongoose.Types.ObjectId(req.user.id);

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment is required'
      });
    }

    // Check if customer has access to this task
    const task = await Task.findOne({
      _id: taskId,
      project: { $in: await Project.find({ customer: customerId }).select('_id') }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or access denied'
      });
    }

    // Add comment to task
    const newComment = {
      user: customerId,
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
    const customerId = new mongoose.Types.ObjectId(req.user.id);

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment is required'
      });
    }

    // Check if customer has access to this milestone
    const milestone = await Milestone.findOne({
      _id: milestoneId,
      project: { $in: await Project.find({ customer: customerId }).select('_id') }
    });

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found or access denied'
      });
    }

    // Add comment to milestone
    const newComment = {
      user: customerId,
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
    const customerId = new mongoose.Types.ObjectId(req.user.id);

    // Check if customer has access to this task
    const task = await Task.findOne({
      _id: taskId,
      project: { $in: await Project.find({ customer: customerId }).select('_id') }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or access denied'
      });
    }

    // Find the comment
    const commentIndex = task.comments.findIndex(
      comment => comment._id.toString() === commentId && comment.user.toString() === customerId.toString()
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
    const customerId = new mongoose.Types.ObjectId(req.user.id);

    // Check if customer has access to this milestone
    const milestone = await Milestone.findOne({
      _id: milestoneId,
      project: { $in: await Project.find({ customer: customerId }).select('_id') }
    });

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found or access denied'
      });
    }

    // Find the comment
    const commentIndex = milestone.comments.findIndex(
      comment => comment._id.toString() === commentId && comment.user.toString() === customerId.toString()
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
  getCustomerDashboard,
  getCustomerProjects,
  getCustomerProjectDetails,
  getCustomerTaskDetails,
  getCustomerMilestoneDetails,
  getCustomerFiles,
  getCustomerActivity,
  uploadTaskFile,
  uploadMilestoneFile,
  deleteTaskFile,
  deleteMilestoneFile,
  addTaskComment,
  addMilestoneComment,
  deleteTaskComment,
  deleteMilestoneComment
};
