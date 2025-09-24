const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const Task = require('../models/Task');
const Subtask = require('../models/Subtask');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { formatFileData, deleteFile } = require('../middlewares/enhancedFileUpload');
const { validationResult } = require('express-validator');
const { createCustomerActivity } = require('./activityController');

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

    // PMs can access all customers
    if (userRole === 'pm') {
      return { hasPermission: true, customer };
    }

    // Employees can access customers they're assigned to
    if (userRole === 'employee') {
      const isAssigned = customer.assignedTeam.includes(userId);
      return { hasPermission: isAssigned, customer };
    }

    // Customers can only access their own customer records
    if (userRole === 'customer') {
      const isOwner = customer.customer.toString() === userId;
      return { hasPermission: isOwner, customer };
    }

    return { hasPermission: false, error: 'Invalid user role' };
  } catch (error) {
    return { hasPermission: false, error: error.message };
  }
};

// Create a new customer
const createCustomer = async (req, res) => {
  try {
    // Check validation errors
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { name, description, status, priority, dueDate, customer, assignedTeam, tags, visibility } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Only PMs can create customers
    if (userRole !== 'pm') {
      return res.status(403).json({
        success: false,
        message: 'Only Project Managers can create customers'
      });
    }

    // Validate customer user exists and has customer role
    const customerUser = await User.findById(customer);
    if (!customerUser || customerUser.role !== 'customer') {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer user'
      });
    }

    // Validate assigned team members
    if (assignedTeam && assignedTeam.length > 0) {
      const teamMembers = await User.find({
        _id: { $in: assignedTeam },
        role: { $in: ['employee', 'pm'] }
      });
      
      if (teamMembers.length !== assignedTeam.length) {
        return res.status(400).json({
          success: false,
          message: 'Some assigned team members are invalid'
        });
      }
    }

    // Create customer
    const newCustomer = new Customer({
      name,
      description,
      status: status || 'planning',
      priority: priority || 'normal',
      dueDate,
      customer,
      projectManager: userId,
      assignedTeam: assignedTeam || [],
      tags: tags || [],
      visibility: visibility || 'team',
      createdBy: userId,
      lastModifiedBy: userId
    });

    await newCustomer.save();

    // Update customer user's customerProjects array
    await User.findByIdAndUpdate(customer, {
      $addToSet: { customerProjects: newCustomer._id }
    });

    // Update assigned team members' assignedCustomers array
    if (assignedTeam && assignedTeam.length > 0) {
      await User.updateMany(
        { _id: { $in: assignedTeam } },
        { $addToSet: { assignedCustomers: newCustomer._id } }
      );
    }

    // Update PM's managedCustomers array
    await User.findByIdAndUpdate(userId, {
      $addToSet: { managedCustomers: newCustomer._id }
    });

    // Create activity log
    await createCustomerActivity(
      newCustomer._id,
      'customer_created',
      userId,
      {
        status: newCustomer.status,
        priority: newCustomer.priority,
        teamSize: assignedTeam ? assignedTeam.length : 0
      }
    );

    // Populate the response
    const populatedCustomer = await Customer.findById(newCustomer._id)
      .populate('customer', 'fullName email avatar')
      .populate('projectManager', 'fullName email avatar')
      .populate('assignedTeam', 'fullName email avatar role')
      .populate('createdBy', 'fullName email avatar')
      .populate('lastModifiedBy', 'fullName email avatar');

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: {
        customer: populatedCustomer
      }
    });

  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating customer',
      error: error.message
    });
  }
};

// Get all customers with role-based filtering
const getCustomers = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { page = 1, limit = 10, status, priority, search } = req.query;

    let query = {};

    // Role-based filtering
    if (userRole === 'pm') {
      // PMs can see all customers
      query = {};
    } else if (userRole === 'employee') {
      // Employees can only see customers they're assigned to
      query = { assignedTeam: userId };
    } else if (userRole === 'customer') {
      // Customers can only see their own customer records
      query = { customer: userId };
    }

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
      .populate('createdBy', 'fullName email avatar')
      .populate('lastModifiedBy', 'fullName email avatar')
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
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customers',
      error: error.message
    });
  }
};

// Get single customer details
const getCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check permissions
    const permissionCheck = await checkCustomerPermission(id, userId, userRole);
    if (!permissionCheck.hasPermission) {
      const statusCode = permissionCheck.error === 'Customer not found' ? 404 : 403;
      return res.status(statusCode).json({
        success: false,
        message: permissionCheck.error || 'Access denied'
      });
    }

    const customer = await Customer.findById(id)
      .populate('customer', 'fullName email avatar')
      .populate('projectManager', 'fullName email avatar')
      .populate('assignedTeam', 'fullName email avatar role')
      .populate('createdBy', 'fullName email avatar')
      .populate('lastModifiedBy', 'fullName email avatar')
      .populate({
        path: 'tasks',
        populate: {
          path: 'assignedTo',
          select: 'fullName email avatar'
        }
      });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: customer
    });

  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer',
      error: error.message
    });
  }
};

// Update customer
const updateCustomer = async (req, res) => {
  try {
    // Check validation errors
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Only PMs can update customers
    if (userRole !== 'pm') {
      return res.status(403).json({
        success: false,
        message: 'Only Project Managers can update customers'
      });
    }

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const { name, description, status, priority, dueDate, assignedTeam, tags, visibility } = req.body;

    // Validate assigned team members if provided
    if (assignedTeam && assignedTeam.length > 0) {
      const teamMembers = await User.find({
        _id: { $in: assignedTeam },
        role: { $in: ['employee', 'pm'] }
      });
      
      if (teamMembers.length !== assignedTeam.length) {
        return res.status(400).json({
          success: false,
          message: 'Some assigned team members are invalid'
        });
      }
    }

    // Update customer
    const updateData = {
      lastModifiedBy: userId
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate;
    if (tags !== undefined) updateData.tags = tags;
    if (visibility !== undefined) updateData.visibility = visibility;

    // Handle team assignment changes
    if (assignedTeam !== undefined) {
      const oldTeam = customer.assignedTeam.map(id => id.toString());
      const newTeam = assignedTeam.map(id => id.toString());

      // Remove from old team members
      const removedMembers = oldTeam.filter(id => !newTeam.includes(id));
      if (removedMembers.length > 0) {
        await User.updateMany(
          { _id: { $in: removedMembers } },
          { $pull: { assignedCustomers: customer._id } }
        );
      }

      // Add to new team members
      const addedMembers = newTeam.filter(id => !oldTeam.includes(id));
      if (addedMembers.length > 0) {
        await User.updateMany(
          { _id: { $in: addedMembers } },
          { $addToSet: { assignedCustomers: customer._id } }
        );
      }

      updateData.assignedTeam = assignedTeam;
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('customer', 'fullName email avatar')
      .populate('projectManager', 'fullName email avatar')
      .populate('assignedTeam', 'fullName email avatar role')
      .populate('createdBy', 'fullName email avatar')
      .populate('lastModifiedBy', 'fullName email avatar');

    // Create activity log
    await createCustomerActivity(
      customer._id,
      'customer_updated',
      userId,
      {
        changes: Object.keys(updateData).filter(key => key !== 'lastModifiedBy')
      }
    );

    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: updatedCustomer
    });

  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating customer',
      error: error.message
    });
  }
};

// Delete customer
const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Only PMs can delete customers
    if (userRole !== 'pm') {
      return res.status(403).json({
        success: false,
        message: 'Only Project Managers can delete customers'
      });
    }

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Delete all tasks and subtasks associated with this customer
    const tasks = await Task.find({ customer: id });
    for (const task of tasks) {
      // Delete all subtasks for this task
      await Subtask.deleteMany({ task: task._id });
      // Delete task files
      if (task.attachments && task.attachments.length > 0) {
        for (const attachment of task.attachments) {
          await deleteFile(attachment.filePath);
        }
      }
    }
    await Task.deleteMany({ customer: id });

    // Delete customer files
    if (customer.attachments && customer.attachments.length > 0) {
      for (const attachment of customer.attachments) {
        await deleteFile(attachment.filePath);
      }
    }

    // Remove customer references from users
    await User.updateMany(
      { customerProjects: id },
      { $pull: { customerProjects: id } }
    );
    await User.updateMany(
      { assignedCustomers: id },
      { $pull: { assignedCustomers: id } }
    );
    await User.updateMany(
      { managedCustomers: id },
      { $pull: { managedCustomers: id } }
    );

    // Create activity log BEFORE deleting the customer
    await createCustomerActivity(
      customer._id,
      'customer_deleted',
      userId,
      {
        deletedTasks: tasks.length
      }
    );

    // Delete the customer
    await Customer.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting customer',
      error: error.message
    });
  }
};

// Get customer statistics
const getCustomerStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let matchQuery = {};

    // Role-based filtering
    if (userRole === 'employee') {
      matchQuery.assignedTeam = userId;
    } else if (userRole === 'customer') {
      matchQuery.customer = userId;
    }

    const stats = await Customer.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          onHold: {
            $sum: { $cond: [{ $eq: ['$status', 'on-hold'] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          planning: {
            $sum: { $cond: [{ $eq: ['$status', 'planning'] }, 1, 0] }
          },
          avgProgress: { $avg: '$progress' }
        }
      }
    ]);

    const result = stats[0] || {
      total: 0,
      active: 0,
      completed: 0,
      onHold: 0,
      cancelled: 0,
      planning: 0,
      avgProgress: 0
    };

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error fetching customer stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer statistics',
      error: error.message
    });
  }
};

// Get users available for customer assignment
const getUsersForCustomer = async (req, res) => {
  try {
    const { role } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Only PMs can get users for assignment
    if (userRole !== 'pm') {
      return res.status(403).json({
        success: false,
        message: 'Only Project Managers can access user lists'
      });
    }

    let query = {};

    if (role === 'customer') {
      query.role = 'customer';
    } else if (role === 'team') {
      query.role = { $in: ['employee', 'pm'] };
    } else {
      // If no role specified, return empty array to prevent showing all users
      return res.json({
        success: true,
        data: []
      });
    }

    const users = await User.find(query)
      .select('fullName email avatar role company jobTitle workTitle department')
      .sort({ fullName: 1 });

    res.json({
      success: true,
      data: users
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// Get all tasks for a customer
const getCustomerTasks = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check permissions
    const permissionCheck = await checkCustomerPermission(id, userId, userRole);
    if (!permissionCheck.hasPermission) {
      const statusCode = permissionCheck.error === 'Customer not found' ? 404 : 403;
      return res.status(statusCode).json({
        success: false,
        message: permissionCheck.error || 'Access denied'
      });
    }

    const tasks = await Task.find({ customer: id })
      .populate('assignedTo', 'fullName email avatar')
      .populate('createdBy', 'fullName email avatar')
      .populate('completedBy', 'fullName email avatar')
      .sort({ sequence: 1 });

    res.json({
      success: true,
      data: tasks
    });

  } catch (error) {
    console.error('Error fetching customer tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer tasks',
      error: error.message
    });
  }
};

// Get customer dashboard data
const getCustomerDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let matchQuery = {};

    // Role-based filtering
    if (userRole === 'customer') {
      matchQuery.customer = userId;
    } else if (userRole === 'employee') {
      matchQuery.assignedTeam = userId;
    } else if (userRole === 'pm') {
      // PMs can see all customers
      matchQuery = {};
    }

    // Get customer projects with stats
    const customers = await Customer.find(matchQuery)
      .populate('customer', 'fullName email avatar')
      .populate('projectManager', 'fullName email avatar')
      .populate('assignedTeam', 'fullName email avatar role')
      .sort({ createdAt: -1 })
      .limit(10);

    // Add task counts to each customer
    const customersWithTaskCounts = await Promise.all(
      customers.map(async (customer) => {
        const taskCounts = await Task.aggregate([
          { $match: { customer: customer._id } },
          {
            $group: {
              _id: null,
              totalTasks: { $sum: 1 },
              completedTasks: {
                $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
              }
            }
          }
        ]);

        const counts = taskCounts[0] || { totalTasks: 0, completedTasks: 0 };
        
        return {
          ...customer.toObject(),
          totalTasks: counts.totalTasks,
          completedTasks: counts.completedTasks
        };
      })
    );

    // Get customer statistics
    const stats = await Customer.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          onHold: {
            $sum: { $cond: [{ $eq: ['$status', 'on-hold'] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          planning: {
            $sum: { $cond: [{ $eq: ['$status', 'planning'] }, 1, 0] }
          },
          avgProgress: { $avg: '$progress' }
        }
      }
    ]);

    // Get task statistics across all customer projects
    const customerIds = customers.map(c => c._id);
    const taskStats = await Task.aggregate([
      { $match: { customer: { $in: customerIds } } },
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
          },
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
          }
        }
      }
    ]);

    const taskCounts = taskStats[0] || { total: 0, completed: 0, inProgress: 0, pending: 0, overdue: 0, dueSoon: 0 };

    // Get subtask statistics
    const subtaskStats = await Subtask.aggregate([
      { $match: { customer: { $in: customerIds } } },
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

    const subtaskCounts = subtaskStats[0] || { total: 0, completed: 0, inProgress: 0, pending: 0 };

    // Get recent tasks for the customer
    let recentTasks = [];
    if (userRole === 'customer') {
      recentTasks = await Task.find({ customer: userId })
        .populate('assignedTo', 'fullName email avatar')
        .populate('customer', 'name')
        .sort({ createdAt: -1 })
        .limit(5);
    }

    const result = stats[0] || {
      total: 0,
      active: 0,
      completed: 0,
      onHold: 0,
      cancelled: 0,
      planning: 0,
      avgProgress: 0
    };

    // Calculate overall progress
    const totalItems = taskCounts.total + subtaskCounts.total;
    const completedItems = taskCounts.completed + subtaskCounts.completed;
    const overallProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    // Structure response to match old format
    const statistics = {
      projects: {
        total: result.total,
        active: result.active,
        completed: result.completed,
        onHold: result.onHold,
        cancelled: result.cancelled,
        planning: result.planning
      },
      tasks: {
        total: taskCounts.total,
        completed: taskCounts.completed,
        inProgress: taskCounts.inProgress,
        pending: taskCounts.pending,
        overdue: taskCounts.overdue,
        dueSoon: taskCounts.dueSoon
      },
      subtasks: {
        total: subtaskCounts.total,
        completed: subtaskCounts.completed,
        inProgress: subtaskCounts.inProgress,
        pending: subtaskCounts.pending
      },
      overallProgress: overallProgress
    };

    res.json({
      success: true,
      data: {
        statistics,
        recentProjects: customersWithTaskCounts,
        recentTasks
      }
    });

  } catch (error) {
    console.error('Error fetching customer dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer dashboard',
      error: error.message
    });
  }
};

// Get customer project details with tasks and subtasks
const getCustomerProjectDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check permissions
    const permissionCheck = await checkCustomerPermission(id, userId, userRole);
    if (!permissionCheck.hasPermission) {
      const statusCode = permissionCheck.error === 'Customer not found' ? 404 : 403;
      return res.status(statusCode).json({
        success: false,
        message: permissionCheck.error || 'Access denied'
      });
    }

    // Get customer with populated data
    const customer = await Customer.findById(id)
      .populate('customer', 'fullName email avatar')
      .populate('projectManager', 'fullName email avatar')
      .populate('assignedTeam', 'fullName email avatar role')
      .populate('createdBy', 'fullName email avatar')
      .populate('lastModifiedBy', 'fullName email avatar');

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

    // Get subtasks for all tasks
    const taskIds = tasks.map(task => task._id);
    const subtasks = await Subtask.find({ task: { $in: taskIds } })
      .populate('assignedTo', 'fullName email avatar')
      .populate('task', 'title')
      .sort({ sequence: 1 });

    // Calculate progress
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Update customer progress if it's different
    if (customer.progress !== progress) {
      await Customer.findByIdAndUpdate(id, { progress });
      customer.progress = progress;
    }

    res.json({
      success: true,
      data: {
        customer,
        tasks,
        subtasks,
        progress
      }
    });

  } catch (error) {
    console.error('Error fetching customer project details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer project details',
      error: error.message
    });
  }
};

// Get customer activity
const getCustomerActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Only customers can view their own activity
    if (userRole !== 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Only customers can view their activity'
      });
    }

    // Get customer projects
    const customers = await Customer.find({ customer: userId });
    const customerIds = customers.map(c => c._id);

    // Get activities related to customer projects
    const activities = await Activity.find({
      $or: [
        { customer: { $in: customerIds } },
        { 'metadata.customer': { $in: customerIds } }
      ]
    })
    .populate('user', 'fullName email avatar')
    .populate('customer', 'name')
    .sort({ createdAt: -1 })
    .limit(50);

    res.json({
      success: true,
      data: {
        activities
      }
    });

  } catch (error) {
    console.error('Error fetching customer activity:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer activity',
      error: error.message
    });
  }
};

// Get customer files
const getCustomerFiles = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Only customers can view their own files
    if (userRole !== 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Only customers can view their files'
      });
    }

    // Get customer projects
    const customers = await Customer.find({ customer: userId });
    const customerIds = customers.map(c => c._id);

    // Get tasks for these customers
    const tasks = await Task.find({ customer: { $in: customerIds } });
    const taskIds = tasks.map(t => t._id);

    // Get subtasks for these tasks
    const subtasks = await Subtask.find({ task: { $in: taskIds } });
    const subtaskIds = subtasks.map(s => s._id);

    // Get files from tasks and subtasks
    const taskFiles = tasks.flatMap(task => 
      (task.attachments || []).map(file => ({
        ...file,
        entityType: 'task',
        entityId: task._id,
        entityTitle: task.title
      }))
    );

    const subtaskFiles = subtasks.flatMap(subtask => 
      (subtask.attachments || []).map(file => ({
        ...file,
        entityType: 'subtask',
        entityId: subtask._id,
        entityTitle: subtask.title
      }))
    );

    const allFiles = [...taskFiles, ...subtaskFiles];

    res.json({
      success: true,
      data: {
        files: allFiles,
        total: allFiles.length
      }
    });

  } catch (error) {
    console.error('Error fetching customer files:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer files',
      error: error.message
    });
  }
};

module.exports = {
  createCustomer,
  getCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerStats,
  getUsersForCustomer,
  getCustomerTasks,
  getCustomerDashboard,
  getCustomerProjectDetails,
  getCustomerActivity,
  getCustomerFiles
};