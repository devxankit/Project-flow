const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const Task = require('../models/Task');
const Subtask = require('../models/Subtask');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { formatFileData, deleteFile } = require('../middlewares/enhancedFileUpload');
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

// Helper function to check if user has permission to access customer
const checkCustomerPermission = async (customerId, userId, userRole) => {
  try {
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return { hasPermission: false, error: 'Customer not found' };
    }

    // Employees can access customers they're assigned to
    if (userRole === 'employee') {
      const isAssigned = customer.assignedTeam.includes(userId);
      return { hasPermission: isAssigned, customer };
    }

    return { hasPermission: false, error: 'Invalid user role' };
  } catch (error) {
    return { hasPermission: false, error: error.message };
  }
};

// @desc    Get employee dashboard data
// @route   GET /api/employee/dashboard
// @access  Private (Employee only)
const getEmployeeDashboard = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Get customers assigned to this employee (include all except cancelled)
    const assignedCustomers = await Customer.find({ 
      assignedTeam: userId,
      status: { $ne: 'cancelled' }
    }).select('_id name status priority dueDate progress');

    const customerIds = assignedCustomers.map(c => c._id);

    // If no customers assigned, return empty stats
    if (customerIds.length === 0) {
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
          assignedCustomers: []
        }
      });
    }

    // Get task statistics for assigned customers
    const taskStats = await Task.aggregate([
      { 
        $match: { 
          customer: { $in: customerIds },
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

    // Get subtask statistics for assigned customers for this employee
    const subtaskStatsAgg = await Subtask.aggregate([
      {
        $match: {
          customer: { $in: customerIds },
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
    const subtaskStats = subtaskStatsAgg[0] || {
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
      customer: { $in: customerIds },
      assignedTo: { $in: [userId] },
      dueDate: { $gte: now, $lte: threeDaysFromNow },
      status: { $nin: ['completed', 'cancelled'] }
    });

    const overdueTasks = await Task.countDocuments({
      customer: { $in: customerIds },
      assignedTo: { $in: [userId] },
      dueDate: { $lt: now },
      status: { $nin: ['completed', 'cancelled'] }
    });

    // Subtask due soon / overdue
    const dueSoonSubtasks = await Subtask.countDocuments({
      customer: { $in: customerIds },
      assignedTo: { $in: [userId] },
      dueDate: { $gte: now, $lte: threeDaysFromNow },
      status: { $nin: ['completed', 'cancelled'] }
    });

    const overdueSubtasks = await Subtask.countDocuments({
      customer: { $in: customerIds },
      assignedTo: { $in: [userId] },
      dueDate: { $lt: now },
      status: { $nin: ['completed', 'cancelled'] }
    });

    // Get recent tasks
    const recentTasks = await Task.find({
      customer: { $in: customerIds },
      assignedTo: { $in: [userId] }
    })
      .populate('customer', 'name')
      .sort({ updatedAt: -1 })
      .limit(6);

    // Get recent subtasks
    const recentSubtasks = await Subtask.find({
      customer: { $in: customerIds },
      assignedTo: { $in: [userId] }
    })
      .populate('customer', 'name')
      .populate('task', 'title')
      .sort({ updatedAt: -1 })
      .limit(6);

    // Calculate overall progress
    const overallProgress = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
    const subtaskOverallProgress = subtaskStats.total > 0 ? Math.round((subtaskStats.completed / subtaskStats.total) * 100) : 0;

    res.json({
      success: true,
      data: {
        stats: {
          ...stats,
          dueSoon: dueSoonTasks,
          overdue: overdueTasks,
          overallProgress
        },
        subtaskStats: {
          ...subtaskStats,
          dueSoon: dueSoonSubtasks,
          overdue: overdueSubtasks,
          overallProgress: subtaskOverallProgress
        },
        recentTasks,
        recentSubtasks,
        assignedCustomers
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

// @desc    Get employee assigned customers
// @route   GET /api/employee/customers
// @access  Private (Employee only)
const getEmployeeCustomers = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status, priority, search } = req.query;

    let query = { assignedTeam: userId };

    // Apply filters
    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const customers = await Customer.find(query)
      .populate('customer', 'fullName email avatar')
      .populate('projectManager', 'fullName email avatar')
      .populate('assignedTeam', 'fullName email avatar role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Customer.countDocuments(query);

    res.json({
      success: true,
      data: {
        customers,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Error fetching employee customers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customers',
      error: error.message
    });
  }
};

// @desc    Get employee customer details
// @route   GET /api/employee/customers/:id
// @access  Private (Employee only)
const getEmployeeCustomerDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check permissions
    const permissionCheck = await checkCustomerPermission(id, userId, userRole);
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({
        success: false,
        message: permissionCheck.error || 'Access denied'
      });
    }

    const customer = await Customer.findById(id)
      .populate('customer', 'fullName email avatar')
      .populate('projectManager', 'fullName email avatar')
      .populate('assignedTeam', 'fullName email avatar role');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Get tasks for this customer
    const tasks = await Task.find({ customer: id })
      .populate('assignedTo', 'fullName email avatar')
      .populate('createdBy', 'fullName email avatar')
      .populate('completedBy', 'fullName email avatar')
      .sort({ sequence: 1 });

    res.json({
      success: true,
      data: {
        customer,
        tasks
      }
    });

  } catch (error) {
    console.error('Error fetching customer details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer details',
      error: error.message
    });
  }
};

// @desc    Get employee tasks
// @route   GET /api/employee/tasks
// @access  Private (Employee only)
const getEmployeeTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status, priority, customerId } = req.query;

    let query = { assignedTo: userId };

    // Apply filters
    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }
    if (customerId) {
      query.customer = customerId;
    }

    const skip = (page - 1) * limit;

    const tasks = await Task.find(query)
      .populate('customer', 'name status priority')
      .populate('assignedTo', 'fullName email avatar')
      .populate('createdBy', 'fullName email avatar')
      .sort({ dueDate: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Task.countDocuments(query);

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
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

// @desc    Get employee task details
// @route   GET /api/employee/tasks/:id
// @access  Private (Employee only)
const getEmployeeTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const task = await Task.findOne({ _id: id, assignedTo: userId })
      .populate('customer', 'name status priority')
      .populate('assignedTo', 'fullName email avatar')
      .populate('createdBy', 'fullName email avatar')
      .populate('completedBy', 'fullName email avatar')
      .populate('comments.user', 'fullName email avatar');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or access denied'
      });
    }

    // Get subtasks for this task
    const subtasks = await Subtask.find({ task: id })
      .populate('assignedTo', 'fullName email avatar')
      .populate('createdBy', 'fullName email avatar')
      .populate('completedBy', 'fullName email avatar')
      .sort({ sequence: 1 });

    res.json({
      success: true,
      data: {
        task,
        subtasks
      }
    });

  } catch (error) {
    console.error('Error fetching task details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching task details',
      error: error.message
    });
  }
};

// @desc    Update task status
// @route   PUT /api/employee/tasks/:id/status
// @access  Private (Employee only)
const updateTaskStatus = async (req, res) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const task = await Task.findOne({ _id: id, assignedTo: userId });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or access denied'
      });
    }

    const oldStatus = task.status;
    task.status = status;

    // Set completion data if status changed to completed
    if (status === 'completed' && oldStatus !== 'completed') {
      task.completedAt = new Date();
      task.completedBy = userId;
    } else if (status !== 'completed' && oldStatus === 'completed') {
      task.completedAt = null;
      task.completedBy = null;
    }

    await task.save();

    res.json({
      success: true,
      message: 'Task status updated successfully',
      data: task
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

// @desc    Get employee activity
// @route   GET /api/employee/activity
// @access  Private (Employee only)
const getEmployeeActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, type } = req.query;

    // Get customers assigned to this employee
    const assignedCustomers = await Customer.find({ assignedTeam: userId }).select('_id');
    const customerIds = assignedCustomers.map(c => c._id);

    let query = {
      $or: [
        { actor: userId },
        { customer: { $in: customerIds } }
      ]
    };

    if (type) {
      query.type = type;
    }

    const skip = (page - 1) * limit;

    const activities = await Activity.find(query)
      .populate('actor', 'fullName email avatar')
      .populate('customer', 'name')
      .populate('target', 'title name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Activity.countDocuments(query);

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
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

// @desc    Get employee files
// @route   GET /api/employee/files
// @access  Private (Employee only)
const getEmployeeFiles = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, customerId, taskId } = req.query;

    // Get customers assigned to this employee
    const assignedCustomers = await Customer.find({ assignedTeam: userId }).select('_id');
    const customerIds = assignedCustomers.map(c => c._id);

    // Get tasks assigned to this employee
    const assignedTasks = await Task.find({ assignedTo: userId }).select('_id');
    const taskIds = assignedTasks.map(t => t._id);

    // Get subtasks assigned to this employee
    const assignedSubtasks = await Subtask.find({ assignedTo: userId }).select('_id');
    const subtaskIds = assignedSubtasks.map(s => s._id);

    let query = {
      $or: [
        { 'attachments.uploadedBy': userId },
        { customer: { $in: customerIds } },
        { task: { $in: taskIds } },
        { subtask: { $in: subtaskIds } }
      ]
    };

    if (customerId) {
      query.customer = customerId;
    }
    if (taskId) {
      query.task = taskId;
    }

    const skip = (page - 1) * limit;

    // Get files from tasks
    const taskFiles = await Task.find(query)
      .select('title attachments customer')
      .populate('customer', 'name')
      .skip(skip)
      .limit(parseInt(limit));

    // Get files from subtasks
    const subtaskFiles = await Subtask.find(query)
      .select('title attachments customer task')
      .populate('customer', 'name')
      .populate('task', 'title')
      .skip(skip)
      .limit(parseInt(limit));

    // Combine and format files
    const allFiles = [];
    
    taskFiles.forEach(task => {
      task.attachments.forEach(attachment => {
        allFiles.push({
          ...attachment.toObject(),
          entityType: 'task',
          entityId: task._id,
          entityTitle: task.title,
          customer: task.customer
        });
      });
    });

    subtaskFiles.forEach(subtask => {
      subtask.attachments.forEach(attachment => {
        allFiles.push({
          ...attachment.toObject(),
          entityType: 'subtask',
          entityId: subtask._id,
          entityTitle: subtask.title,
          customer: subtask.customer,
          task: subtask.task
        });
      });
    });

    // Sort by upload date
    allFiles.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    res.json({
      success: true,
      data: {
        files: allFiles,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(allFiles.length / limit),
          total: allFiles.length
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

// @desc    Add comment to task
// @route   POST /api/employee/tasks/:id/comments
// @access  Private (Employee only)
const addTaskComment = async (req, res) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user.id;

    const task = await Task.findOne({ _id: id, assignedTo: userId });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or access denied'
      });
    }

    task.comments.push({
      message,
      user: userId,
      timestamp: new Date()
    });

    await task.save();

    // Populate the comment for response
    const updatedTask = await Task.findById(id)
      .populate('comments.user', 'fullName email avatar');

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: updatedTask.comments[updatedTask.comments.length - 1]
    });

  } catch (error) {
    console.error('Error adding task comment:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding comment',
      error: error.message
    });
  }
};

// @desc    Delete task comment
// @route   DELETE /api/employee/tasks/:id/comments/:commentId
// @access  Private (Employee only)
const deleteTaskComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const userId = req.user.id;

    const task = await Task.findOne({ _id: id, assignedTo: userId });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or access denied'
      });
    }

    const comment = task.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Only allow deleting own comments
    if (comment.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own comments'
      });
    }

    comment.remove();
    await task.save();

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting task comment:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting comment',
      error: error.message
    });
  }
};

// @desc    Add comment to subtask
// @route   POST /api/employee/subtasks/:id/comments
// @access  Private (Employee only)
const addSubtaskComment = async (req, res) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user.id;

    const subtask = await Subtask.findOne({ _id: id, assignedTo: userId });
    if (!subtask) {
      return res.status(404).json({
        success: false,
        message: 'Subtask not found or access denied'
      });
    }

    subtask.comments.push({
      message,
      user: userId,
      timestamp: new Date()
    });

    await subtask.save();

    // Populate the comment for response
    const updatedSubtask = await Subtask.findById(id)
      .populate('comments.user', 'fullName email avatar');

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: { subtask: updatedSubtask }
    });

  } catch (error) {
    console.error('Error adding subtask comment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Delete subtask comment
// @route   DELETE /api/employee/subtasks/:id/comments/:commentId
// @access  Private (Employee only)
const deleteSubtaskComment = async (req, res) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { id, commentId } = req.params;
    const userId = req.user.id;

    const subtask = await Subtask.findOne({ _id: id, assignedTo: userId });
    if (!subtask) {
      return res.status(404).json({
        success: false,
        message: 'Subtask not found or access denied'
      });
    }

    const commentIndex = subtask.comments.findIndex(
      comment => comment._id.toString() === commentId && comment.user.toString() === userId
    );

    if (commentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found or access denied'
      });
    }

    subtask.comments.splice(commentIndex, 1);
    await subtask.save();

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting subtask comment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getEmployeeDashboard,
  getEmployeeCustomers,
  getEmployeeCustomerDetails,
  getEmployeeTasks,
  getEmployeeTask,
  updateTaskStatus,
  getEmployeeActivity,
  getEmployeeFiles,
  addTaskComment,
  deleteTaskComment,
  addSubtaskComment,
  deleteSubtaskComment
};