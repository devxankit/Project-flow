const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  
  // Role and Status
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: {
      values: ['pm', 'employee', 'customer'],
      message: 'Role must be either pm, employee, or customer'
    },
    default: 'employee'
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: ['active', 'inactive'],
      message: 'Status must be either active or inactive'
    },
    default: 'active'
  },
  
  // Profile Information
  avatar: {
    type: String,
    default: function() {
      // Generate avatar initials from full name
      const nameParts = this.fullName.trim().split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase();
      } else {
        return nameParts[0].charAt(0).toUpperCase();
      }
    }
  },
  profileImage: {
    url: {
      type: String,
      default: null
    },
    cloudinaryId: {
      type: String,
      default: null
    },
    uploadedAt: {
      type: Date,
      default: null
    }
  },
  
  // Employee-specific fields
  department: {
    type: String,
    required: function() {
      return this.role === 'employee' || this.role === 'pm';
    },
    trim: true,
    maxlength: [100, 'Department name cannot exceed 100 characters']
  },
  jobTitle: {
    type: String,
    required: function() {
      return this.role === 'employee' || this.role === 'pm';
    },
    trim: true,
    maxlength: [100, 'Job title cannot exceed 100 characters']
  },
  workTitle: {
    type: String,
    required: function() {
      return this.role === 'employee' || this.role === 'pm';
    },
    trim: true,
    maxlength: [100, 'Work title cannot exceed 100 characters']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  skills: [{
    type: String,
    trim: true,
    maxlength: [50, 'Each skill cannot exceed 50 characters']
  }],
  projects: {
    type: Number,
    default: 0,
    min: [0, 'Projects count cannot be negative']
  },
  
  // Customer-specific fields
  company: {
    type: String,
    required: function() {
      return this.role === 'customer';
    },
    trim: true,
    maxlength: [200, 'Company name cannot exceed 200 characters']
  },
  address: {
    type: String,
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  
  // System fields
  joinDate: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: null
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  
  // User Management fields
  createdBy: {
    type: String,
    trim: true,
    maxlength: [100, 'Created by name cannot exceed 100 characters']
  },
  createdById: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Customer relationships
  managedCustomers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  }],
  assignedCustomers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  }],
  customerProjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  }],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for display name (used in UI) - alias for fullName
userSchema.virtual('name').get(function() {
  return this.fullName;
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ department: 1 });
userSchema.index({ workTitle: 1 });
userSchema.index({ company: 1 });
userSchema.index({ createdById: 1 });
userSchema.index({ fullName: 'text', email: 'text' }); // Text search index

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to update avatar if name changes
userSchema.pre('save', function(next) {
  if (this.isModified('fullName')) {
    const nameParts = this.fullName.trim().split(' ');
    if (nameParts.length >= 2) {
      this.avatar = `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase();
    } else {
      this.avatar = nameParts[0].charAt(0).toUpperCase();
    }
  }
  next();
});

// Pre-save middleware to update updatedAt
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save({ validateBeforeSave: false });
};

// Static method to find active users
userSchema.statics.findActiveUsers = function() {
  return this.find({ status: 'active' });
};

// Static method to find users by role
userSchema.statics.findByRole = function(role) {
  return this.find({ role, status: 'active' });
};

// Static method to find users by department (for employees and PMs)
userSchema.statics.findByDepartment = function(department) {
  return this.find({ 
    department, 
    role: { $in: ['employee', 'pm'] },
    status: 'active' 
  });
};

// Static method to find users by work title
userSchema.statics.findByWorkTitle = function(workTitle) {
  return this.find({ 
    workTitle, 
    role: { $in: ['employee', 'pm'] },
    status: 'active' 
  });
};

// Static method to find users by company (for customers)
userSchema.statics.findByCompany = function(company) {
  return this.find({ 
    company, 
    role: 'customer',
    status: 'active' 
  });
};

// Static method to find users created by a specific user
userSchema.statics.findByCreator = function(createdById) {
  return this.find({ createdById });
};

// Static method to search users by text
userSchema.statics.searchUsers = function(searchTerm) {
  return this.find({
    $text: { $search: searchTerm },
    status: 'active'
  }).sort({ score: { $meta: 'textScore' } });
};

// Static method to find users for customer assignment (employees and PMs)
userSchema.statics.findForCustomerAssignment = function() {
  return this.find({ 
    role: { $in: ['employee', 'pm'] },
    status: 'active' 
  }).select('fullName email avatar department jobTitle workTitle skills');
};

// Static method to find customers for customer assignment
userSchema.statics.findCustomersForCustomer = function() {
  return this.find({ 
    role: 'customer',
    status: 'active' 
  }).select('fullName email avatar company address');
};

// Static method to find project managers
userSchema.statics.findProjectManagers = function() {
  return this.find({ 
    role: 'pm',
    status: 'active' 
  }).select('fullName email avatar department jobTitle');
};

// Transform function to remove sensitive data when converting to JSON
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.emailVerificationToken;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
