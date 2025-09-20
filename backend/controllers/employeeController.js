const mongoose = require('mongoose');
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

// @desc    Get employee dashboard data
// @route   GET /api/employee/dashboard
// @access  Private (Employee only)
const getEmployeeDashboard = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Get projects assigned to this employee
    const assignedProjects = await Project.find({ 
      assignedTeam: userId,
      status: { $in: ['planning', 'active'] }
    }).select('_id name status priority dueDate');

    const projectIds = assignedProjects.map(p => p._id);

    // If no projects assigned, return empty stats
    if (projectIds.length === 0) {
      return res.json({
        success: true,
        data: {
          stats: {
            total: 0,
            pending: 0,
            inProgress: 0,
            completed: 0,
            cancelled: 0,
            urgent: 0,
            high: 0,
            normal: 0,
            low: 0,
            dueSoon: 0,
            overdue: 0,
            overallProgress: 0
          },
          recentTasks: [],
          assignedProjects: 0
        }
      });
    }

    // Get task statistics for assigned projects
    const taskStats = await Task.aggregate([
      { 
        $match: { 
          project: { $in: projectIds },
          assignedTo: { $in: [userId] }
        } 
      },
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

    const stats = taskStats[0] || {
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

    // Calculate due soon and overdue tasks
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));

    const dueSoonTasks = await Task.countDocuments({
      project: { $in: projectIds },
      assignedTo: { $in: [userId] },
      dueDate: { $gte: now, $lte: threeDaysFromNow },
      status: { $nin: ['completed', 'cancelled'] }
    });

    const overdueTasks = await Task.countDocuments({
      project: { $in: projectIds },
      assignedTo: { $in: [userId] },
      dueDate: { $lt: now },
      status: { $nin: ['completed', 'cancelled'] }
    });

    // Get recent tasks
    const recentTasks = await Task.find({
      project: { $in: projectIds },
      assignedTo: { $in: [userId] }
    })
      .populate('project', 'name')
      .populate('milestone', 'title')
      .sort({ updatedAt: -1 })
      .limit(6);

    // Calculate overall progress
    const overallProgress = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

    res.json({
      success: true,
      data: {
        stats: {
          ...stats,
          dueSoon: dueSoonTasks,
          overdue: overdueTasks,
          overallProgress
        },
        recentTasks,
        assignedProjects: assignedProjects.length
      }
    });

  } catch (error) {
    console.error('Error fetching employee dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
};

// @desc    Get employee assigned projects
// @route   GET /api/employee/projects
// @access  Private (Employee only)
const getEmployeeProjects = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { page = 1, limit = 10, status, priority } = req.query;

    // Build query
    let query = { assignedTeam: userId };
    
    if (status) query.status = status;
    if (priority) query.priority = priority;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get projects with populated data
    const projects = await Project.find(query)
      .populate('customer', 'fullName email company')
      .populate('projectManager', 'fullName email')
      .populate('assignedTeam', 'fullName email avatar')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get task counts for each project
    const projectsWithTaskCounts = await Promise.all(
      projects.map(async (project) => {
        const taskCounts = await Task.aggregate([
          { 
            $match: { 
              project: project._id,
              assignedTo: { $in: [userId] }
            } 
          },
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
          ...project.toObject(),
          myTasks: counts.total,
          myCompletedTasks: counts.completed,
          myInProgressTasks: counts.inProgress,
          myPendingTasks: counts.pending
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
    console.error('Error fetching employee projects:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching projects',
      error: error.message
    });
  }
};

// @desc    Get employee assigned tasks
// @route   GET /api/employee/tasks
// @access  Private (Employee only)
const getEmployeeTasks = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { page = 1, limit = 10, status, priority, project, milestone } = req.query;

    // Build filter
    const filter = { assignedTo: { $in: [userId] } };
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (project) filter.project = project;
    if (milestone) filter.milestone = milestone;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get tasks with populated data
    const tasks = await Task.find(filter)
      .populate('project', 'name description status priority')
      .populate('milestone', 'title description status')
      .populate('assignedTo', 'fullName email avatar')
      .populate('createdBy', 'fullName email avatar')
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
    console.error('Error fetching employee tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks',
      error: error.message
    });
  }
};

// @desc    Get single task for employee
// @route   GET /api/employee/tasks/:id
// @access  Private (Employee only)
const getEmployeeTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Get task with populated data
    const task = await Task.findOne({ 
      _id: id, 
      assignedTo: { $in: [userId] }
    })
      .populate('project', 'name description status priority')
      .populate('milestone', 'title description status')
      .populate('assignedTo', 'fullName email avatar')
      .populate('createdBy', 'fullName email avatar')
      .populate('completedBy', 'fullName email avatar')
      .populate('comments.user', 'fullName email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or access denied'
      });
    }

    res.json({
      success: true,
      data: { task }
    });

  } catch (error) {
    console.error('Error fetching employee task:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching task',
      error: error.message
    });
  }
};

// @desc    Update task status (Employee only)
// @route   PUT /api/employee/tasks/:id/status
// @access  Private (Employee only)
const updateTaskStatus = async (req, res) => {
  try {
    // Check for validation errors
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { id } = req.params;
    const { status } = req.body;
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Validate status
    const validStatuses = ['pending', 'in-progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: pending, in-progress, completed, cancelled'
      });
    }

    // Find task
    const task = await Task.findOne({ 
      _id: id, 
      assignedTo: { $in: [userId] }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or access denied'
      });
    }

    // Update task status
    const updateData = { status };

    // Handle completion status
    if (status === 'completed' && task.status !== 'completed') {
      updateData.completedAt = new Date();
      updateData.completedBy = userId;
    } else if (status !== 'completed' && task.status === 'completed') {
      updateData.completedAt = null;
      updateData.completedBy = null;
    }

    // Update the task using save() to trigger middleware
    Object.assign(task, updateData);
    const updatedTask = await task.save();
    
    // Populate the updated task
    await updatedTask.populate([
      { path: 'project', select: 'name' },
      { path: 'milestone', select: 'title' },
      { path: 'assignedTo', select: 'fullName email avatar' },
      { path: 'createdBy', select: 'fullName email avatar' },
      { path: 'completedBy', select: 'fullName email avatar' }
    ]);

    res.json({
      success: true,
      message: 'Task status updated successfully',
      data: { task: updatedTask }
    });

  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating task status',
      error: error.message
    });
  }
};

// @desc    Get employee activity feed
// @route   GET /api/employee/activity
// @access  Private (Employee only)
const getEmployeeActivity = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, projectId } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Use the new Activity system
    const Activity = require('../models/Activity');
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
    console.error('Error fetching employee activity:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activity',
      error: error.message
    });
  }
};

// @desc    Get single project details for employee
// @route   GET /api/employee/projects/:id
// @access  Private (Employee only)
const getEmployeeProjectDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Get project with populated data
    const project = await Project.findOne({ 
      _id: id, 
      assignedTeam: userId 
    })
      .populate('customer', 'fullName email company')
      .populate('projectManager', 'fullName email avatar')
      .populate('assignedTeam', 'fullName email avatar role');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or access denied'
      });
    }

    // Get milestones for this project with progress field
    const milestones = await Milestone.find({ project: id })
      .select('title description status progress dueDate assignedTo createdAt sequence')
      .sort({ createdAt: 1 });

    // Get task counts for each milestone
    const milestonesWithTaskCounts = await Promise.all(
      milestones.map(async (milestone) => {
        const taskCounts = await Task.aggregate([
          { 
            $match: { 
              milestone: milestone._id,
              assignedTo: { $in: [userId] }
            } 
          },
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
          myTasks: counts.total,
          myCompletedTasks: counts.completed,
          myInProgressTasks: counts.inProgress,
          myPendingTasks: counts.pending
        };
      })
    );

    // Get overall task statistics for this project
    const projectTaskStats = await Task.aggregate([
      { 
        $match: { 
          project: id,
          assignedTo: { $in: [userId] }
        } 
      },
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

    const taskStats = projectTaskStats[0] || { total: 0, completed: 0, inProgress: 0, pending: 0 };

    res.json({
      success: true,
      data: {
        project: {
          ...project.toObject(),
          myTasks: taskStats.total,
          myCompletedTasks: taskStats.completed,
          myInProgressTasks: taskStats.inProgress,
          myPendingTasks: taskStats.pending
        },
        milestones: milestonesWithTaskCounts
      }
    });

  } catch (error) {
    console.error('Error fetching employee project details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching project details',
      error: error.message
    });
  }
};

// @desc    Get employee files
// @route   GET /api/employee/files
// @access  Private (Employee only)
const getEmployeeFiles = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { page = 1, limit = 20, type, status } = req.query;

    // Get projects assigned to this employee
    const assignedProjects = await Project.find({ 
      assignedTeam: userId 
    }).select('_id name');

    const projectIds = assignedProjects.map(p => p._id);

    // If no projects assigned, return empty files
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

    // Get tasks assigned to this employee
    const assignedTasks = await Task.find({ 
      assignedTo: { $in: [userId] }
    }).select('_id title project milestone');

    // Collect all files from assigned tasks
    const allFiles = [];
    
    for (const task of assignedTasks) {
      if (task.attachments && task.attachments.length > 0) {
        for (const attachment of task.attachments) {
          const project = assignedProjects.find(p => p._id.toString() === task.project.toString());
          const milestone = await Milestone.findById(task.milestone).select('title');
          
          allFiles.push({
            id: attachment._id,
            name: attachment.originalName,
            type: getFileType(attachment.mimetype),
            size: formatFileSize(attachment.size),
            uploadedBy: 'System', // You might want to track this
            uploadedDate: attachment.uploadedAt,
            task: task.title,
            project: project ? project.name : 'Unknown Project',
            milestone: milestone ? milestone.title : 'Unknown Milestone',
            status: 'active',
            description: `File attached to task: ${task.title}`,
            downloadCount: 0, // You might want to track this
            lastAccessed: attachment.uploadedAt,
            url: attachment.url,
            cloudinaryId: attachment.cloudinaryId
          });
        }
      }
    }

    // Apply filters
    let filteredFiles = allFiles;
    
    if (type && type !== 'all') {
      filteredFiles = filteredFiles.filter(file => file.type === type);
    }
    
    if (status && status !== 'all') {
      filteredFiles = filteredFiles.filter(file => file.status === status);
    }

    // Paginate results
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedFiles = filteredFiles.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: {
        files: paginatedFiles,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(filteredFiles.length / parseInt(limit)),
          total: filteredFiles.length,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching employee files:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching files',
      error: error.message
    });
  }
};

// Helper function to determine file type from mimetype
const getFileType = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.includes('pdf')) return 'document';
  if (mimetype.includes('word') || mimetype.includes('document')) return 'document';
  if (mimetype.includes('spreadsheet') || mimetype.includes('excel')) return 'spreadsheet';
  if (mimetype.includes('zip') || mimetype.includes('rar')) return 'archive';
  if (mimetype.includes('text/') || mimetype.includes('javascript') || mimetype.includes('json')) return 'code';
  return 'document';
};

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Add comment to task
const addTaskComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { comment } = req.body;
    const employeeId = new mongoose.Types.ObjectId(req.user.id);

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment is required'
      });
    }

    // Check if employee has access to this task
    const task = await Task.findOne({
      _id: taskId,
      $or: [
        { assignedTo: employeeId },
        { project: { $in: await Project.find({ assignedTeam: employeeId }).select('_id') } }
      ]
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or access denied'
      });
    }

    // Add comment to task
    const newComment = {
      user: employeeId,
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
    const employeeId = new mongoose.Types.ObjectId(req.user.id);

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment is required'
      });
    }

    // Check if employee has access to this milestone
    const milestone = await Milestone.findOne({
      _id: milestoneId,
      $or: [
        { assignedTo: employeeId },
        { project: { $in: await Project.find({ assignedTeam: employeeId }).select('_id') } }
      ]
    });

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found or access denied'
      });
    }

    // Add comment to milestone
    const newComment = {
      user: employeeId,
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
    const employeeId = new mongoose.Types.ObjectId(req.user.id);

    // Check if employee has access to this task
    const task = await Task.findOne({
      _id: taskId,
      $or: [
        { assignedTo: employeeId },
        { project: { $in: await Project.find({ assignedTeam: employeeId }).select('_id') } }
      ]
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or access denied'
      });
    }

    // Find the comment
    const commentIndex = task.comments.findIndex(
      comment => comment._id.toString() === commentId && comment.user.toString() === employeeId.toString()
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
    const employeeId = new mongoose.Types.ObjectId(req.user.id);

    // Check if employee has access to this milestone
    const milestone = await Milestone.findOne({
      _id: milestoneId,
      $or: [
        { assignedTo: employeeId },
        { project: { $in: await Project.find({ assignedTeam: employeeId }).select('_id') } }
      ]
    });

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found or access denied'
      });
    }

    // Find the comment
    const commentIndex = milestone.comments.findIndex(
      comment => comment._id.toString() === commentId && comment.user.toString() === employeeId.toString()
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

// @desc    Get single milestone for employee
// @route   GET /api/employee/milestones/:milestoneId/project/:projectId
// @access  Private (Employee only)
const getEmployeeMilestone = async (req, res) => {
  try {
    const { milestoneId, projectId } = req.params;
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Check if employee has access to this project
    const project = await Project.findOne({
      _id: projectId,
      assignedTeam: { $in: [userId] }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or access denied'
      });
    }

    // Get milestone with populated data
    const milestone = await Milestone.findOne({ 
      _id: milestoneId, 
      project: projectId 
    })
      .populate('assignedTo', 'fullName email avatar')
      .populate('createdBy', 'fullName email avatar')
      .populate('completedBy', 'fullName email avatar')
      .populate('comments.user', 'fullName email');

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found or access denied'
      });
    }

    res.json({
      success: true,
      data: { 
        milestone,
        project: {
          _id: project._id,
          name: project.name,
          description: project.description
        }
      }
    });

  } catch (error) {
    console.error('Error fetching employee milestone:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// @desc    Get tasks by milestone for employee
// @route   GET /api/employee/tasks/milestone/:milestoneId/project/:projectId
// @access  Private (Employee only)
const getEmployeeTasksByMilestone = async (req, res) => {
  try {
    const { milestoneId, projectId } = req.params;
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Verify employee has access to this project
    const project = await Project.findOne({
      _id: projectId,
      assignedTeam: { $in: [userId] }
    });

    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found or access denied' 
      });
    }

    // Verify milestone belongs to this project
    const milestone = await Milestone.findOne({
      _id: milestoneId,
      project: projectId
    });

    if (!milestone) {
      return res.status(404).json({ 
        success: false, 
        message: 'Milestone not found or access denied' 
      });
    }

    // Get tasks for this milestone
    const tasks = await Task.find({ 
      milestone: milestoneId,
      project: projectId
    })
      .populate('assignedTo', 'fullName email avatar')
      .populate('createdBy', 'fullName email avatar')
      .populate('completedBy', 'fullName email avatar')
      .populate('comments.user', 'fullName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        tasks,
        milestone: {
          _id: milestone._id,
          title: milestone.title,
          description: milestone.description,
          status: milestone.status,
          progress: milestone.progress
        },
        project: {
          _id: project._id,
          name: project.name,
          description: project.description
        }
      }
    });

  } catch (error) {
    console.error('Error fetching employee tasks by milestone:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// @desc    Recalculate milestone progress
// @route   POST /api/employee/milestones/:milestoneId/recalculate-progress
// @access  Private (Employee only)
const recalculateMilestoneProgress = async (req, res) => {
  try {
    const { milestoneId } = req.params;
    
    // Basic validation
    if (!milestoneId || !mongoose.Types.ObjectId.isValid(milestoneId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid milestone ID is required'
      });
    }
    
    const userId = new mongoose.Types.ObjectId(req.user.id);

    console.log(`Recalculating progress for milestone: ${milestoneId}, user: ${userId}`);

    // Get the milestone
    const milestone = await Milestone.findById(milestoneId);
    if (!milestone) {
      console.log(`Milestone not found: ${milestoneId}`);
      return res.status(404).json({ 
        success: false, 
        message: 'Milestone not found' 
      });
    }

    // Verify employee has access to this project
    const project = await Project.findOne({
      _id: milestone.project,
      assignedTeam: { $in: [userId] }
    });

    if (!project) {
      console.log(`Access denied for user ${userId} to project ${milestone.project}`);
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied to this milestone' 
      });
    }

    console.log(`Recalculating progress for milestone: ${milestone.title}`);

    // Recalculate progress
    const newProgress = await milestone.calculateProgress();

    console.log(`Progress recalculated: ${newProgress}%`);

    res.json({
      success: true,
      message: 'Milestone progress recalculated successfully',
      data: {
        milestoneId: milestone._id,
        title: milestone.title,
        progress: newProgress
      }
    });

  } catch (error) {
    console.error('Error recalculating milestone progress:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getEmployeeDashboard,
  getEmployeeProjects,
  getEmployeeProjectDetails,
  getEmployeeTasks,
  getEmployeeTask,
  getEmployeeMilestone,
  getEmployeeTasksByMilestone,
  recalculateMilestoneProgress,
  updateTaskStatus,
  getEmployeeActivity,
  getEmployeeFiles,
  addTaskComment,
  addMilestoneComment,
  deleteTaskComment,
  deleteMilestoneComment
};
