const mongoose = require('mongoose');

const taskRequestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    minlength: [5, 'Task title must be at least 5 characters long'],
    maxlength: [100, 'Task title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Task description is required'],
    trim: true,
    minlength: [20, 'Description must be at least 20 characters long'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project is required']
  },
  milestone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Milestone',
    required: [true, 'Milestone is required']
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Due date must be in the future'
    }
  },
  reason: {
    type: String,
    required: [true, 'Reason for request is required'],
    enum: ['bug-fix', 'feature-request', 'improvement', 'change-request', 'additional-work', 'other']
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'In Progress', 'Completed'],
    default: 'Pending'
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Requested by is required']
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  reviewComments: {
    type: String,
    maxlength: [500, 'Review comments cannot exceed 500 characters']
  },
  attachments: [{
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }
}, {
  timestamps: true
});

// Index for better query performance
taskRequestSchema.index({ project: 1, status: 1 });
taskRequestSchema.index({ requestedBy: 1, status: 1 });
taskRequestSchema.index({ milestone: 1 });

// Virtual for formatted due date
taskRequestSchema.virtual('formattedDueDate').get(function() {
  return this.dueDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
});

// Virtual for time left
taskRequestSchema.virtual('timeLeft').get(function() {
  const now = new Date();
  const dueDate = new Date(this.dueDate);
  const difference = dueDate.getTime() - now.getTime();
  
  if (difference > 0) {
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    } else {
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      return `${minutes}m left`;
    }
  } else {
    const overdueDays = Math.floor(Math.abs(difference) / (1000 * 60 * 60 * 24));
    return `${overdueDays}d overdue`;
  }
});

// Ensure virtual fields are serialized
taskRequestSchema.set('toJSON', { virtuals: true });
taskRequestSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('TaskRequest', taskRequestSchema);
