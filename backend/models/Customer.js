const mongoose = require('mongoose');

// File attachment schema for embedded documents (for tasks and subtasks)
const attachmentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true,
    trim: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true,
    min: [0, 'File size cannot be negative']
  },
  url: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true,
    enum: {
      values: ['image', 'video', 'document', 'other'],
      message: 'File type must be image, video, document, or other'
    }
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Main Customer schema
const customerSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [200, 'Customer name cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Customer description cannot exceed 2000 characters']
  },
  
  // Customer Details
  status: {
    type: String,
    required: true,
    enum: {
      values: ['planning', 'active', 'on-hold', 'completed', 'cancelled'],
      message: 'Status must be planning, active, on-hold, completed, or cancelled'
    },
    default: 'planning'
  },
  priority: {
    type: String,
    required: true,
    enum: {
      values: ['low', 'normal', 'high', 'urgent'],
      message: 'Priority must be low, normal, high, or urgent'
    },
    default: 'normal'
  },
  
  // Dates
  startDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: [true, 'Customer due date is required']
  },
  completedAt: {
    type: Date,
    default: null
  },
  
  // Relationships
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer must have a customer user'],
    validate: {
      validator: async function(customerId) {
        const customer = await mongoose.model('User').findById(customerId);
        return customer && customer.role === 'customer';
      },
      message: 'Customer must be a valid customer user'
    }
  },
  projectManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer must have a project manager'],
    validate: {
      validator: async function(pmId) {
        const pm = await mongoose.model('User').findById(pmId);
        return pm && pm.role === 'pm';
      },
      message: 'Project manager must be a valid PM user'
    }
  },
  assignedTeam: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    validate: {
      validator: async function(teamMemberId) {
        const member = await mongoose.model('User').findById(teamMemberId);
        return member && (member.role === 'employee' || member.role === 'pm');
      },
      message: 'Team members must be valid employee or PM users'
    }
  }],
  
  // Customer Structure
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  
  // Progress Tracking
  progress: {
    type: Number,
    default: 0,
    min: [0, 'Progress cannot be negative'],
    max: [100, 'Progress cannot exceed 100%']
  },
  
  // System Fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Tags for categorization
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  
  // Customer visibility and access
  visibility: {
    type: String,
    enum: {
      values: ['private', 'team', 'public'],
      message: 'Visibility must be private, team, or public'
    },
    default: 'team'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for customer duration in days
customerSchema.virtual('duration').get(function() {
  if (this.completedAt) {
    return Math.ceil((this.completedAt - this.startDate) / (1000 * 60 * 60 * 24));
  } else if (this.dueDate) {
    return Math.ceil((this.dueDate - this.startDate) / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Virtual for days remaining
customerSchema.virtual('daysRemaining').get(function() {
  if (this.status === 'completed' || this.status === 'cancelled') {
    return 0;
  }
  if (this.dueDate) {
    const now = new Date();
    const remaining = Math.ceil((this.dueDate - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, remaining);
  }
  return null;
});

// Virtual for overdue status
customerSchema.virtual('isOverdue').get(function() {
  if (this.status === 'completed' || this.status === 'cancelled') {
    return false;
  }
  return this.dueDate && new Date() > this.dueDate;
});

// Virtual for team size
customerSchema.virtual('teamSize').get(function() {
  return this.assignedTeam ? this.assignedTeam.length : 0;
});

// Virtual for completed tasks count
customerSchema.virtual('completedTasksCount').get(function() {
  return this.tasks ? this.tasks.filter(task => task.status === 'completed').length : 0;
});

// Virtual for total tasks count
customerSchema.virtual('totalTasksCount').get(function() {
  return this.tasks ? this.tasks.length : 0;
});

// Indexes for better query performance
customerSchema.index({ name: 'text', description: 'text' }); // Text search
customerSchema.index({ status: 1 });
customerSchema.index({ priority: 1 });
customerSchema.index({ customer: 1 });
customerSchema.index({ projectManager: 1 });
customerSchema.index({ 'assignedTeam': 1 });
customerSchema.index({ dueDate: 1 });
customerSchema.index({ createdAt: -1 });
customerSchema.index({ tags: 1 });

// Pre-save middleware to update lastModifiedBy
customerSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    // This will be set by the controller when updating
    // this.lastModifiedBy = req.user.id;
  }
  next();
});

// Instance method to add team member
customerSchema.methods.addTeamMember = function(userId) {
  if (!this.assignedTeam.includes(userId)) {
    this.assignedTeam.push(userId);
  }
  return this.save();
};

// Instance method to remove team member
customerSchema.methods.removeTeamMember = function(userId) {
  this.assignedTeam = this.assignedTeam.filter(id => !id.equals(userId));
  return this.save();
};

// Instance method to add task
customerSchema.methods.addTask = function(taskId) {
  if (!this.tasks.includes(taskId)) {
    this.tasks.push(taskId);
  }
  return this.save();
};

// Instance method to remove task
customerSchema.methods.removeTask = function(taskId) {
  this.tasks = this.tasks.filter(id => !id.equals(taskId));
  return this.save();
};

// Static method to find customers by customer user
customerSchema.statics.findByCustomer = function(customerId) {
  return this.find({ customer: customerId }).populate('projectManager', 'fullName email avatar');
};

// Static method to find customers by project manager
customerSchema.statics.findByProjectManager = function(pmId) {
  return this.find({ projectManager: pmId }).populate('customer', 'fullName email company avatar');
};

// Static method to find customers by team member
customerSchema.statics.findByTeamMember = function(memberId) {
  return this.find({ assignedTeam: memberId }).populate('projectManager customer', 'fullName email avatar company');
};

// Static method to find overdue customers
customerSchema.statics.findOverdue = function() {
  return this.find({
    dueDate: { $lt: new Date() },
    status: { $nin: ['completed', 'cancelled'] }
  });
};

// Static method to find customers by status
customerSchema.statics.findByStatus = function(status) {
  return this.find({ status }).populate('customer projectManager', 'fullName email avatar company');
};

// Static method to search customers
customerSchema.statics.searchCustomers = function(searchTerm) {
  return this.find({
    $text: { $search: searchTerm }
  }).sort({ score: { $meta: 'textScore' } });
};

// Transform function to remove sensitive data when converting to JSON
customerSchema.methods.toJSON = function() {
  const customerObject = this.toObject();
  // Add any sensitive data removal here if needed
  return customerObject;
};

module.exports = mongoose.model('Customer', customerSchema);
