const mongoose = require('mongoose');

// File attachment schema for embedded documents
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
  cloudinaryId: {
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

// Note: Milestone schema is now in separate Milestone model

// Task schema for embedded documents
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Task title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Task description cannot exceed 1000 characters']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Task must be assigned to someone']
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
  status: {
    type: String,
    required: true,
    enum: {
      values: ['pending', 'in-progress', 'completed', 'cancelled'],
      message: 'Status must be pending, in-progress, completed, or cancelled'
    },
    default: 'pending'
  },
  dueDate: {
    type: Date,
    required: [true, 'Task due date is required']
  },
  completedAt: {
    type: Date,
    default: null
  },
  attachments: [attachmentSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Main Project schema
const projectSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [200, 'Project name cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Project description cannot exceed 2000 characters']
  },
  
  // Project Details
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
    required: [true, 'Project due date is required']
  },
  completedAt: {
    type: Date,
    default: null
  },
  
  // Relationships
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Project must have a customer'],
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
    required: [true, 'Project must have a project manager'],
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
  
  // Project Structure
  tasks: [taskSchema],
  attachments: [attachmentSchema],
  
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
  
  // Project visibility and access
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

// Virtual for project duration in days
projectSchema.virtual('duration').get(function() {
  if (this.completedAt) {
    return Math.ceil((this.completedAt - this.startDate) / (1000 * 60 * 60 * 24));
  } else if (this.dueDate) {
    return Math.ceil((this.dueDate - this.startDate) / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Virtual for days remaining
projectSchema.virtual('daysRemaining').get(function() {
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
projectSchema.virtual('isOverdue').get(function() {
  if (this.status === 'completed' || this.status === 'cancelled') {
    return false;
  }
  return this.dueDate && new Date() > this.dueDate;
});

// Virtual for team size
projectSchema.virtual('teamSize').get(function() {
  return this.assignedTeam ? this.assignedTeam.length : 0;
});

// Virtual for completed tasks count
projectSchema.virtual('completedTasksCount').get(function() {
  return this.tasks ? this.tasks.filter(task => task.status === 'completed').length : 0;
});

// Virtual for total tasks count
projectSchema.virtual('totalTasksCount').get(function() {
  return this.tasks ? this.tasks.length : 0;
});

// Note: Milestone counts are now calculated via the Milestone model

// Indexes for better query performance
projectSchema.index({ name: 'text', description: 'text' }); // Text search
projectSchema.index({ status: 1 });
projectSchema.index({ priority: 1 });
projectSchema.index({ customer: 1 });
projectSchema.index({ projectManager: 1 });
projectSchema.index({ 'assignedTeam': 1 });
projectSchema.index({ dueDate: 1 });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ tags: 1 });

// Note: Progress calculation is now handled by the Milestone model's post-save middleware

// Pre-save middleware to update lastModifiedBy
projectSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    // This will be set by the controller when updating
    // this.lastModifiedBy = req.user.id;
  }
  next();
});

// Instance method to add team member
projectSchema.methods.addTeamMember = function(userId) {
  if (!this.assignedTeam.includes(userId)) {
    this.assignedTeam.push(userId);
  }
  return this.save();
};

// Instance method to remove team member
projectSchema.methods.removeTeamMember = function(userId) {
  this.assignedTeam = this.assignedTeam.filter(id => !id.equals(userId));
  return this.save();
};

// Instance method to add milestone
projectSchema.methods.addMilestone = function(milestoneData) {
  this.milestones.push(milestoneData);
  return this.save();
};

// Instance method to add task
projectSchema.methods.addTask = function(taskData) {
  this.tasks.push(taskData);
  return this.save();
};

// Instance method to add attachment
projectSchema.methods.addAttachment = function(attachmentData) {
  this.attachments.push(attachmentData);
  return this.save();
};

// Static method to find projects by customer
projectSchema.statics.findByCustomer = function(customerId) {
  return this.find({ customer: customerId }).populate('projectManager', 'fullName email avatar');
};

// Static method to find projects by project manager
projectSchema.statics.findByProjectManager = function(pmId) {
  return this.find({ projectManager: pmId }).populate('customer', 'fullName email company avatar');
};

// Static method to find projects by team member
projectSchema.statics.findByTeamMember = function(memberId) {
  return this.find({ assignedTeam: memberId }).populate('projectManager customer', 'fullName email avatar company');
};

// Static method to find overdue projects
projectSchema.statics.findOverdue = function() {
  return this.find({
    dueDate: { $lt: new Date() },
    status: { $nin: ['completed', 'cancelled'] }
  });
};

// Static method to find projects by status
projectSchema.statics.findByStatus = function(status) {
  return this.find({ status }).populate('customer projectManager', 'fullName email avatar company');
};

// Static method to search projects
projectSchema.statics.searchProjects = function(searchTerm) {
  return this.find({
    $text: { $search: searchTerm }
  }).sort({ score: { $meta: 'textScore' } });
};

// Transform function to remove sensitive data when converting to JSON
projectSchema.methods.toJSON = function() {
  const projectObject = this.toObject();
  // Add any sensitive data removal here if needed
  return projectObject;
};

module.exports = mongoose.model('Project', projectSchema);
