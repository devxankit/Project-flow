const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  cloudinaryId: {
    type: String,
    required: false // Made optional since we can extract from URL
  },
  url: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const milestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Milestone title is required'],
    trim: true,
    maxlength: [200, 'Milestone title cannot exceed 200 characters']
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Milestone description cannot exceed 1000 characters'],
    default: ''
  },
  
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project reference is required']
  },
  
  sequence: {
    type: Number,
    required: [true, 'Sequence number is required'],
    min: [1, 'Sequence must be at least 1']
  },
  
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  
  status: {
    type: String,
    enum: {
      values: ['pending', 'in-progress', 'completed', 'cancelled'],
      message: 'Status must be pending, in-progress, completed, or cancelled'
    },
    default: 'pending'
  },
  
  priority: {
    type: String,
    enum: {
      values: ['low', 'normal', 'high', 'urgent'],
      message: 'Priority must be low, normal, high, or urgent'
    },
    default: 'normal'
  },
  
  progress: {
    type: Number,
    min: [0, 'Progress cannot be less than 0'],
    max: [100, 'Progress cannot be more than 100'],
    default: 0
  },
  
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  attachments: [attachmentSchema],
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  completedAt: {
    type: Date,
    default: null
  },
  
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
milestoneSchema.index({ project: 1, sequence: 1 }, { unique: true });
milestoneSchema.index({ project: 1, status: 1 });
milestoneSchema.index({ assignedTo: 1 });
milestoneSchema.index({ dueDate: 1 });

// Virtual for progress calculation
milestoneSchema.virtual('isOverdue').get(function() {
  return this.dueDate < new Date() && this.status !== 'completed';
});

// Virtual for days remaining
milestoneSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const due = new Date(this.dueDate);
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Method to calculate progress based on tasks
milestoneSchema.methods.calculateProgress = async function() {
  const Task = mongoose.model('Task');
  
  // Count total and completed tasks for this milestone
  const totalTasks = await Task.countDocuments({ milestone: this._id });
  const completedTasks = await Task.countDocuments({ 
    milestone: this._id, 
    status: 'completed' 
  });

  // Calculate progress percentage
  let progress = 0;
  if (totalTasks > 0) {
    progress = Math.round((completedTasks / totalTasks) * 100);
  }

  // Update the milestone's progress
  this.progress = progress;
  await this.save();

  return progress;
};

// Pre-save middleware to ensure sequence uniqueness within project
milestoneSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('sequence') || this.isModified('project')) {
    const existingMilestone = await this.constructor.findOne({
      project: this.project,
      sequence: this.sequence,
      _id: { $ne: this._id }
    });
    
    if (existingMilestone) {
      const error = new Error(`Milestone with sequence number ${this.sequence} already exists in this project`);
      error.name = 'ValidationError';
      return next(error);
    }
  }
  
  // Set completion data if status changed to completed
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  } else if (this.isModified('status') && this.status !== 'completed' && this.completedAt) {
    this.completedAt = null;
    this.completedBy = null;
  }
  
  next();
});

// Post-save middleware to update project progress
milestoneSchema.post('save', async function() {
  try {
    const Project = mongoose.model('Project');
    const project = await Project.findById(this.project);
    
    if (project) {
      // Get all milestones for this project
      const milestones = await this.constructor.find({ project: this.project });
      const completedMilestones = milestones.filter(m => m.status === 'completed');
      
      // Calculate progress based on milestones and tasks
      let totalItems = milestones.length;
      let completedItems = completedMilestones.length;
      
      // Add tasks count if project has tasks
      if (project.tasks && project.tasks.length > 0) {
        totalItems += project.tasks.length;
        completedItems += project.tasks.filter(task => task.status === 'completed').length;
      }
      
      // Update project progress
      if (totalItems > 0) {
        project.progress = Math.round((completedItems / totalItems) * 100);
      } else {
        project.progress = 0;
      }
      
      await project.save();
    }
  } catch (error) {
    console.error('Error updating project progress:', error);
  }
});

// Post-remove middleware to update project progress
milestoneSchema.post('remove', async function() {
  try {
    const Project = mongoose.model('Project');
    const project = await Project.findById(this.project);
    
    if (project) {
      // Get remaining milestones for this project
      const milestones = await this.constructor.find({ project: this.project });
      const completedMilestones = milestones.filter(m => m.status === 'completed');
      
      // Calculate progress based on remaining milestones and tasks
      let totalItems = milestones.length;
      let completedItems = completedMilestones.length;
      
      // Add tasks count if project has tasks
      if (project.tasks && project.tasks.length > 0) {
        totalItems += project.tasks.length;
        completedItems += project.tasks.filter(task => task.status === 'completed').length;
      }
      
      // Update project progress
      if (totalItems > 0) {
        project.progress = Math.round((completedItems / totalItems) * 100);
      } else {
        project.progress = 0;
      }
      
      await project.save();
    }
  } catch (error) {
    console.error('Error updating project progress after milestone deletion:', error);
  }
});

// Static method to get milestones by project
milestoneSchema.statics.getByProject = function(projectId, options = {}) {
  const query = this.find({ project: projectId });
  
  if (options.status) {
    query.where('status', options.status);
  }
  
  if (options.assignedTo) {
    query.where('assignedTo', options.assignedTo);
  }
  
  return query
    .populate('assignedTo', 'fullName email avatar')
    .populate('createdBy', 'fullName email avatar')
    .populate('completedBy', 'fullName email avatar')
    .sort({ sequence: 1 });
};

// Static method to get milestone statistics
milestoneSchema.statics.getStats = function(projectId) {
  return this.aggregate([
    { $match: { project: mongoose.Types.ObjectId(projectId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

module.exports = mongoose.model('Milestone', milestoneSchema);
