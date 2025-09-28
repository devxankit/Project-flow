const mongoose = require('mongoose');

// File attachments are now referenced via ObjectId to File model

// Comment schema for tasks
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
    maxlength: [1000, 'Task description cannot exceed 1000 characters'],
    default: ''
  },
  
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Task must belong to a customer']
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
  
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  dueDate: {
    type: Date,
    required: [true, 'Task due date is required']
  },
  
  sequence: {
    type: Number,
    required: [true, 'Sequence number is required'],
    min: [1, 'Sequence must be at least 1']
  },
  
  progress: {
    type: Number,
    min: [0, 'Progress cannot be less than 0'],
    max: [100, 'Progress cannot be more than 100'],
    default: 0
  },
  
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
  },
  
  comments: [commentSchema],
  attachments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function() {
  return this.dueDate < new Date() && this.status !== 'completed';
});

// Virtual for days remaining
taskSchema.virtual('daysRemaining').get(function() {
  if (this.status === 'completed') return 0;
  const diffTime = new Date(this.dueDate).getTime() - new Date().getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Index for efficient queries
taskSchema.index({ customer: 1, sequence: 1 }, { unique: true });
taskSchema.index({ customer: 1, status: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ createdBy: 1 });

// Pre-save middleware to ensure sequence uniqueness within customer
taskSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('sequence') || this.isModified('customer')) {
    const existingTask = await this.constructor.findOne({
      customer: this.customer,
      sequence: this.sequence,
      _id: { $ne: this._id }
    });
    
    if (existingTask) {
      const error = new Error(`Task with sequence number ${this.sequence} already exists in this customer`);
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

// Pre-save middleware to calculate task progress based on subtasks
taskSchema.pre('save', async function(next) {
  try {
    if (this.isNew || this.isModified()) {
      // Count total and completed subtasks for this task
      const Subtask = mongoose.model('Subtask');
      const totalSubtasks = await Subtask.countDocuments({ task: this._id });
      const completedSubtasks = await Subtask.countDocuments({ 
        task: this._id, 
        status: 'completed' 
      });

      // Calculate progress percentage
      let progress = 0;
      if (totalSubtasks > 0) {
        progress = Math.round((completedSubtasks / totalSubtasks) * 100);
      }

      // Update task progress
      this.progress = progress;
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Post-save middleware to update customer progress
taskSchema.post('save', async function() {
  try {
    const Customer = mongoose.model('Customer');
    const customer = await Customer.findById(this.customer);
    
    if (customer) {
      // Count total and completed tasks for this customer
      const totalTasks = await this.constructor.countDocuments({ customer: this.customer });
      const completedTasks = await this.constructor.countDocuments({ 
        customer: this.customer, 
        status: 'completed' 
      });

      // Calculate progress percentage
      let progress = 0;
      if (totalTasks > 0) {
        progress = Math.round((completedTasks / totalTasks) * 100);
      }

      // Update customer progress
      customer.progress = progress;
      await customer.save({ validateBeforeSave: false });
      
      console.log(`Updated customer ${this.customer} progress to ${progress}% (${completedTasks}/${totalTasks} tasks completed)`);
    }
  } catch (error) {
    console.error('Error updating customer progress:', error);
  }
});

// Post-remove middleware to update customer progress when task is deleted
taskSchema.post('findOneAndDelete', async function() {
  try {
    const Customer = mongoose.model('Customer');
    const customer = await Customer.findById(this.customer);
    
    if (customer) {
      // Count remaining tasks for this customer
      const totalTasks = await this.constructor.countDocuments({ customer: this.customer });
      const completedTasks = await this.constructor.countDocuments({ 
        customer: this.customer, 
        status: 'completed' 
      });

      // Calculate progress percentage
      let progress = 0;
      if (totalTasks > 0) {
        progress = Math.round((completedTasks / totalTasks) * 100);
      }

      // Update customer progress
      customer.progress = progress;
      await customer.save({ validateBeforeSave: false });
      
      console.log(`Updated customer ${this.customer} progress to ${progress}% after task deletion (${completedTasks}/${totalTasks} tasks completed)`);
    }
  } catch (error) {
    console.error('Error updating customer progress after task deletion:', error);
  }
});

// Static method to get tasks by customer
taskSchema.statics.getByCustomer = function(customerId, options = {}) {
  const query = this.find({ customer: customerId });
  
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

// Static method to get task statistics
taskSchema.statics.getStats = function(customerId) {
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

// Static method to recalculate all task progress
taskSchema.statics.recalculateAllProgress = async function() {
  const tasks = await this.find({});
  console.log(`Recalculating progress for ${tasks.length} tasks...`);
  
  for (const task of tasks) {
    // Count total and completed subtasks for this task
    const Subtask = mongoose.model('Subtask');
    const totalSubtasks = await Subtask.countDocuments({ task: task._id });
    const completedSubtasks = await Subtask.countDocuments({ 
      task: task._id, 
      status: 'completed' 
    });

    // Calculate progress percentage
    let progress = 0;
    if (totalSubtasks > 0) {
      progress = Math.round((completedSubtasks / totalSubtasks) * 100);
    }

    // Update task progress
    task.progress = progress;
    await task.save();
    
    console.log(`Updated task ${task._id} progress to ${progress}% (${completedSubtasks}/${totalSubtasks} subtasks completed)`);
  }
  
  console.log('All task progress recalculated!');
};

module.exports = mongoose.model('Task', taskSchema);
