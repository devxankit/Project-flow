const mongoose = require('mongoose');

// File attachment schema for subtasks
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

// Comment schema for subtasks
const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const subtaskSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Subtask title is required'],
    trim: true,
    maxlength: [200, 'Subtask title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Subtask description cannot exceed 1000 characters'],
    default: ''
  },
  
  // Relationships
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: [true, 'Subtask must belong to a task']
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Subtask must belong to a customer']
  },
  
  // Assignment
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Status and Priority
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
  
  // Dates
  dueDate: {
    type: Date,
    required: [true, 'Subtask due date is required']
  },
  completedAt: {
    type: Date,
    default: null
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Sequence within task
  sequence: {
    type: Number,
    required: [true, 'Sequence number is required'],
    min: [1, 'Sequence must be at least 1']
  },
  
  // Content
  attachments: [attachmentSchema],
  comments: [commentSchema],
  
  // System fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for overdue status
subtaskSchema.virtual('isOverdue').get(function() {
  return this.dueDate < new Date() && this.status !== 'completed';
});

// Virtual for days remaining
subtaskSchema.virtual('daysRemaining').get(function() {
  if (this.status === 'completed') return 0;
  const diffTime = new Date(this.dueDate).getTime() - new Date().getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Index for efficient queries
subtaskSchema.index({ task: 1, sequence: 1 }, { unique: true });
subtaskSchema.index({ customer: 1, status: 1 });
subtaskSchema.index({ assignedTo: 1 });
subtaskSchema.index({ dueDate: 1 });
subtaskSchema.index({ createdBy: 1 });

// Pre-save middleware to ensure sequence uniqueness within task
subtaskSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('sequence') || this.isModified('task')) {
    const existingSubtask = await this.constructor.findOne({
      task: this.task,
      sequence: this.sequence,
      _id: { $ne: this._id }
    });
    
    if (existingSubtask) {
      const error = new Error(`Subtask with sequence number ${this.sequence} already exists in this task`);
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

// Post-save middleware to update task progress
subtaskSchema.post('save', async function() {
  try {
    const Task = mongoose.model('Task');
    const task = await Task.findById(this.task);
    
    if (task) {
      // Count total and completed subtasks for this task
      const totalSubtasks = await this.constructor.countDocuments({ task: this.task });
      const completedSubtasks = await this.constructor.countDocuments({ 
        task: this.task, 
        status: 'completed' 
      });

      // Calculate progress percentage
      let progress = 0;
      if (totalSubtasks > 0) {
        progress = Math.round((completedSubtasks / totalSubtasks) * 100);
      }

      // Update task progress
      task.progress = progress;
      await task.save(); // This will trigger the task's post-save middleware
      
      console.log(`Updated task ${this.task} progress to ${progress}% (${completedSubtasks}/${totalSubtasks} subtasks completed)`);
    }
  } catch (error) {
    console.error('Error updating task progress:', error);
  }
});

// Post-remove middleware to update task progress when subtask is deleted
subtaskSchema.post('findOneAndDelete', async function() {
  try {
    const Task = mongoose.model('Task');
    const task = await Task.findById(this.task);
    
    if (task) {
      // Count remaining subtasks for this task
      const totalSubtasks = await this.constructor.countDocuments({ task: this.task });
      const completedSubtasks = await this.constructor.countDocuments({ 
        task: this.task, 
        status: 'completed' 
      });

      // Calculate progress percentage
      let progress = 0;
      if (totalSubtasks > 0) {
        progress = Math.round((completedSubtasks / totalSubtasks) * 100);
      }

      // Update task progress
      task.progress = progress;
      await task.save(); // This will trigger the task's post-save middleware
      
      console.log(`Updated task ${this.task} progress to ${progress}% after subtask deletion (${completedSubtasks}/${totalSubtasks} subtasks completed)`);
    }
  } catch (error) {
    console.error('Error updating task progress after subtask deletion:', error);
  }
});

// Static method to get subtasks by task
subtaskSchema.statics.getByTask = function(taskId, options = {}) {
  const query = this.find({ task: taskId });
  
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
    .populate('comments.user', 'fullName email')
    .sort({ sequence: 1 });
};

// Static method to get subtasks by customer
subtaskSchema.statics.getByCustomer = function(customerId, options = {}) {
  const query = this.find({ customer: customerId });
  
  if (options.status) {
    query.where('status', options.status);
  }
  
  if (options.assignedTo) {
    query.where('assignedTo', options.assignedTo);
  }
  
  return query
    .populate('task', 'title status priority')
    .populate('assignedTo', 'fullName email avatar')
    .populate('createdBy', 'fullName email avatar')
    .populate('completedBy', 'fullName email avatar')
    .populate('comments.user', 'fullName email')
    .sort({ dueDate: 1 });
};

// Static method to get subtask statistics
subtaskSchema.statics.getStats = function(taskId) {
  return this.aggregate([
    { $match: { task: mongoose.Types.ObjectId(taskId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Static method to get customer subtask statistics
subtaskSchema.statics.getCustomerStats = function(customerId) {
  return this.aggregate([
    { $match: { customer: mongoose.Types.ObjectId(customerId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

module.exports = mongoose.model('Subtask', subtaskSchema);
