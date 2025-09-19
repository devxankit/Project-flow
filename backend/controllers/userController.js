const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Helper function to generate avatar from full name
const generateAvatar = (fullName) => {
  const nameParts = fullName.trim().split(' ');
  if (nameParts.length >= 2) {
    return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase();
  } else {
    return nameParts[0].charAt(0).toUpperCase();
  }
};

// Helper function to generate random password
const generatePassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// @desc    Get all users (PM only)
// @route   GET /api/users
// @access  Private (PM only)
const getAllUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      role = 'all', 
      status = 'all',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    let query = {};
    
    // Search filter
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Role filter
    if (role !== 'all') {
      query.role = role;
    }
    
    // Status filter
    if (status !== 'all') {
      query.status = status;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    // For PMs, include password field; for others, exclude it
    const selectFields = req.user.role === 'pm' 
      ? '-emailVerificationToken -passwordResetToken -passwordResetExpires'
      : '-password -emailVerificationToken -passwordResetToken -passwordResetExpires';
    
    const users = await User.find(query)
      .select(selectFields)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // For PMs, manually add password field to response
    const usersWithPasswords = users.map(user => {
      const userObj = user.toObject();
      if (req.user.role === 'pm' && user.password) {
        userObj.password = user.password;
      }
      return userObj;
    });

    // Get total count for pagination
    const total = await User.countDocuments(query);

    // Get role counts
    const roleCounts = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const roleStats = roleCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res.status(200).json({
      status: 'success',
      data: {
        users: usersWithPasswords,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        },
        stats: {
          total: total,
          active: await User.countDocuments({ status: 'active' }),
          inactive: await User.countDocuments({ status: 'inactive' }),
          ...roleStats
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (PM only)
const getUserById = async (req, res) => {
  try {
    // For PMs, include password field; for others, exclude it
    const selectFields = req.user.role === 'pm' 
      ? '-emailVerificationToken -passwordResetToken -passwordResetExpires'
      : '-password -emailVerificationToken -passwordResetToken -passwordResetExpires';
    
    const user = await User.findById(req.params.id)
      .select(selectFields);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // For PMs, manually add password field to response
    const userObj = user.toObject();
    if (req.user.role === 'pm' && user.password) {
      userObj.password = user.password;
    }

    res.status(200).json({
      status: 'success',
      data: { user: userObj }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Private (PM only)
const createUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      role,
      status = 'active',
      department,
      jobTitle,
      workTitle,
      company,
      address
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this email already exists'
      });
    }

    // Generate password if not provided
    const userPassword = password || generatePassword();

    // Create user data
    const userData = {
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password: userPassword,
      role,
      status,
      createdBy: req.user.fullName,
      createdById: req.user._id
    };

    // Add role-specific fields
    if (role === 'employee' || role === 'pm') {
      userData.department = department;
      userData.jobTitle = jobTitle;
      userData.workTitle = workTitle;
    }

    if (role === 'customer') {
      userData.company = company;
      userData.address = address;
    }

    // Create user
    const user = await User.create(userData);

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      data: {
        user: userResponse,
        credentials: {
          email: user.email,
          password: userPassword
        }
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (PM only)
const updateUser = async (req, res) => {
  try {
    const {
      fullName,
      role,
      status,
      department,
      jobTitle,
      workTitle,
      company,
      address
    } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Update basic fields
    if (fullName) user.fullName = fullName.trim();
    if (role) user.role = role;
    if (status) user.status = status;

    // Update role-specific fields
    if (role === 'employee' || role === 'pm') {
      if (department) user.department = department;
      if (jobTitle) user.jobTitle = jobTitle;
      if (workTitle) user.workTitle = workTitle;
      // Clear customer fields
      user.company = undefined;
      user.address = undefined;
    }

    if (role === 'customer') {
      if (company) user.company = company;
      if (address) user.address = address;
      // Clear employee fields
      user.department = undefined;
      user.jobTitle = undefined;
      user.workTitle = undefined;
    }

    await user.save();

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      data: { user: userResponse }
    });
  } catch (error) {
    console.error('Update user error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (PM only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Prevent PM from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete your own account'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// @desc    Get user credentials (for export)
// @route   GET /api/users/export/credentials
// @access  Private (PM only)
const exportUserCredentials = async (req, res) => {
  try {
    const users = await User.find({})
      .select('fullName email role status createdAt createdBy')
      .sort({ createdAt: -1 });

    const credentials = users.map(user => ({
      'Full Name': user.fullName,
      'Email': user.email,
      'Role': user.role,
      'Status': user.status,
      'Created Date': user.createdAt.toLocaleDateString(),
      'Created By': user.createdBy
    }));

    res.status(200).json({
      status: 'success',
      data: { credentials }
    });
  } catch (error) {
    console.error('Export credentials error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// @desc    Reset user password
// @route   POST /api/users/:id/reset-password
// @access  Private (PM only)
const resetUserPassword = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const newPassword = generatePassword();
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password reset successfully',
      data: {
        email: user.email,
        newPassword
      }
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  exportUserCredentials,
  resetUserPassword
};
