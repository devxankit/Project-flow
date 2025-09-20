const mongoose = require('mongoose');

// File attachment schema for tasks
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
  
  milestone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Milestone',
    required: [true, 'Task must belong to a milestone']
  },
  
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Task must belong to a project']
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
  
  comments: [{
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
  }],
  
  attachments: [attachmentSchema]
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

// Pre-save middleware to ensure milestone progress is updated
taskSchema.pre('save', async function(next) {
  // Only proceed if status is being modified
  if (this.isModified('status')) {
    try {
      const Milestone = mongoose.model('Milestone');
      const milestoneId = this.milestone;

      if (milestoneId) {
        // Count total and completed tasks for this milestone
        const totalTasks = await mongoose.model('Task').countDocuments({ milestone: milestoneId });
        const completedTasks = await mongoose.model('Task').countDocuments({ 
          milestone: milestoneId, 
          status: 'completed' 
        });

        // Calculate progress percentage
        let progress = 0;
        if (totalTasks > 0) {
          progress = Math.round((completedTasks / totalTasks) * 100);
        }

        // Update milestone progress
        await Milestone.findByIdAndUpdate(milestoneId, { progress });
        console.log(`Updated milestone ${milestoneId} progress to ${progress}% (${completedTasks}/${totalTasks} tasks completed)`);
      }
    } catch (error) {
      console.error('Error updating milestone progress in pre-save:', error);
    }
  }
  next();
});

// Post-update middleware to handle findOneAndUpdate operations
taskSchema.post(['findOneAndUpdate', 'updateOne', 'updateMany'], async function(doc) {
  try {
    const update = this.getUpdate();
    
    // Check if status was updated
    if (update && (update.status || (update.$set && update.$set.status))) {
      const milestoneId = doc?.milestone;
      
      if (milestoneId) {
        // Count total and completed tasks for this milestone
        const totalTasks = await mongoose.model('Task').countDocuments({ milestone: milestoneId });
        const completedTasks = await mongoose.model('Task').countDocuments({ 
          milestone: milestoneId, 
          status: 'completed' 
        });

        // Calculate progress percentage
        let progress = 0;
        if (totalTasks > 0) {
          progress = Math.round((completedTasks / totalTasks) * 100);
        }

        // Update milestone progress and trigger post-save middleware
        const milestone = await mongoose.model('Milestone').findById(milestoneId);
        if (milestone) {
          milestone.progress = progress;
          await milestone.save(); // This will trigger the milestone's post-save middleware
          console.log(`Updated milestone ${milestoneId} progress to ${progress}% (${completedTasks}/${totalTasks} tasks completed) via post-update`);
        }
      }
    }
  } catch (error) {
    console.error('Error updating milestone progress in post-update:', error);
  }
});

// Post-save middleware to update milestone progress
taskSchema.post('save', async function() {
  const Milestone = mongoose.model('Milestone');
  const milestoneId = this.milestone;

  if (!milestoneId) return;

  // Count total and completed tasks for this milestone
  const totalTasks = await mongoose.model('Task').countDocuments({ milestone: milestoneId });
  const completedTasks = await mongoose.model('Task').countDocuments({ 
    milestone: milestoneId, 
    status: 'completed' 
  });

  // Calculate progress percentage
  let progress = 0;
  if (totalTasks > 0) {
    progress = Math.round((completedTasks / totalTasks) * 100);
  }

  // Update milestone progress and trigger post-save middleware
  const milestone = await Milestone.findById(milestoneId);
  if (milestone) {
    milestone.progress = progress;
    await milestone.save(); // This will trigger the milestone's post-save middleware
  }
});

// Post-remove middleware to update milestone progress when task is deleted
taskSchema.post('findOneAndDelete', async function() {
  const Milestone = mongoose.model('Milestone');
  const milestoneId = this.milestone;

  if (!milestoneId) return;

  // Count total and completed tasks for this milestone
  const totalTasks = await mongoose.model('Task').countDocuments({ milestone: milestoneId });
  const completedTasks = await mongoose.model('Task').countDocuments({ 
    milestone: milestoneId, 
    status: 'completed' 
  });

  // Calculate progress percentage
  let progress = 0;
  if (totalTasks > 0) {
    progress = Math.round((completedTasks / totalTasks) * 100);
  }

  // Update milestone progress and trigger post-save middleware
  const milestone = await Milestone.findById(milestoneId);
  if (milestone) {
    milestone.progress = progress;
    await milestone.save(); // This will trigger the milestone's post-save middleware
  }
});

module.exports = mongoose.model('Task', taskSchema);
