const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const Task = require('../models/Task');
const Subtask = require('../models/Subtask');
const User = require('../models/User');
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

    // Delete the customer
    await Customer.findByIdAndDelete(id);

    // Create activity log
    await createCustomerActivity(
      customer._id,
      'customer_deleted',
      userId,
      {
        deletedTasks: tasks.length
      }
    );

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

module.exports = {
  createCustomer,
  getCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerStats,
  getUsersForCustomer,
  getCustomerTasks
};