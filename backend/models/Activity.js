const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  // Activity Type and Details
  type: {
    type: String,
    required: [true, 'Activity type is required'],
    enum: {
      values: [
        // Project activities
        'project_created',
        'project_updated',
        'project_status_changed',
        'project_completed',
        'project_cancelled',
        
        // Milestone activities
        'milestone_created',
        'milestone_updated',
        'milestone_status_changed',
        'milestone_completed',
        'milestone_cancelled',
        
        // Task activities
        'task_created',
        'task_updated',
        'task_status_changed',
        'task_assigned',
        'task_unassigned',
        'task_completed',
        'task_cancelled',
        
        // Team activities
        'team_member_added',
        'team_member_removed',
        
        // Comment activities
        'comment_added',
        'comment_updated',
        'comment_deleted',
        
        // File activities
        'file_uploaded',
        'file_deleted',
        
        // User activities
        'user_joined',
        'user_left',
        'user_role_changed'
      ],
      message: 'Invalid activity type'
    }
  },
  
  title: {
    type: String,
    required: [true, 'Activity title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Activity description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  // Actor (who performed the action)
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Activity must have an actor']
  },
  
  // Target (what was affected - optional)
  target: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'targetModel',
    required: false
  },
  
  targetModel: {
    type: String,
    enum: ['Project', 'Task', 'Milestone', 'User'],
    required: false
  },
  
  // Project context (required for most activities)
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: function() {
      // Most activities require a project context except user-level activities
      return !['user_joined', 'user_left', 'user_role_changed'].includes(this.type);
    }
  },
  
  // Additional context data
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Visibility and access control
  visibility: {
    type: String,
    enum: {
      values: ['public', 'team', 'private'],
      message: 'Visibility must be public, team, or private'
    },
    default: 'team'
  },
  
  // Who can see this activity
  visibleTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Activity priority for notifications
  priority: {
    type: String,
    enum: {
      values: ['low', 'normal', 'high', 'urgent'],
      message: 'Priority must be low, normal, high, or urgent'
    },
    default: 'normal'
  },
  
  // Timestamps
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
activitySchema.index({ project: 1, timestamp: -1 });
activitySchema.index({ actor: 1, timestamp: -1 });
activitySchema.index({ type: 1, timestamp: -1 });
activitySchema.index({ target: 1, targetModel: 1 });
activitySchema.index({ visibleTo: 1, timestamp: -1 });
activitySchema.index({ timestamp: -1 });

// Virtual for time ago
activitySchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return this.timestamp.toLocaleDateString();
});

// Static method to create activity
activitySchema.statics.createActivity = async function(activityData) {
  try {
    const activity = new this(activityData);
    await activity.save();
    return activity;
  } catch (error) {
    console.error('Error creating activity:', error);
    throw error;
  }
};

// Static method to get activities for a user based on their role
activitySchema.statics.getActivitiesForUser = async function(userId, userRole, options = {}) {
  const { page = 1, limit = 20, type, projectId } = options;
  const skip = (page - 1) * limit;
  
  let query = {};
  
  if (userRole === 'pm') {
    // PM can see all activities
    query = {};
  } else if (userRole === 'employee') {
    // Employee can see activities from projects they're assigned to
    const Project = mongoose.model('Project');
    const assignedProjects = await Project.find({ assignedTeam: userId }).select('_id');
    const projectIds = assignedProjects.map(p => p._id);
    
    query = {
      $or: [
        { project: { $in: projectIds } },
        { actor: userId },
        { visibleTo: userId }
      ]
    };
  } else if (userRole === 'customer') {
    // Customer can see activities from their projects
    const Project = mongoose.model('Project');
    const customerProjects = await Project.find({ customer: userId }).select('_id');
    const projectIds = customerProjects.map(p => p._id);
    
    query = {
      $or: [
        { project: { $in: projectIds } },
        { actor: userId },
        { visibleTo: userId }
      ]
    };
  }
  
  // Add filters
  if (type && type !== 'all') {
    query.type = type;
  }
  
  if (projectId) {
    query.project = projectId;
  }
  
  const activities = await this.find(query)
    .populate('actor', 'fullName email avatar role')
    .populate('project', 'name')
    .populate('target', 'title name')
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit);
  
  const total = await this.countDocuments(query);
  
  return {
    activities,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total,
      limit
    }
  };
};

// Static method to get project activities
activitySchema.statics.getProjectActivities = async function(projectId, options = {}) {
  const { page = 1, limit = 20, type } = options;
  const skip = (page - 1) * limit;
  
  let query = { project: projectId };
  
  if (type && type !== 'all') {
    query.type = type;
  }
  
  const activities = await this.find(query)
    .populate('actor', 'fullName email avatar role')
    .populate('target', 'title name')
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit);
  
  const total = await this.countDocuments(query);
  
  return {
    activities,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total,
      limit
    }
  };
};

// Static method to get activity statistics
activitySchema.statics.getActivityStats = async function(userId, userRole, timeRange = '7d') {
  const now = new Date();
  let startDate;
  
  switch (timeRange) {
    case '1d':
      startDate = new Date(now - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
  }
  
  let query = { timestamp: { $gte: startDate } };
  
  if (userRole === 'employee') {
    const Project = mongoose.model('Project');
    const assignedProjects = await Project.find({ assignedTeam: userId }).select('_id');
    const projectIds = assignedProjects.map(p => p._id);
    
    query = {
      ...query,
      $or: [
        { project: { $in: projectIds } },
        { actor: userId }
      ]
    };
  } else if (userRole === 'customer') {
    const Project = mongoose.model('Project');
    const customerProjects = await Project.find({ customer: userId }).select('_id');
    const projectIds = customerProjects.map(p => p._id);
    
    query = {
      ...query,
      $or: [
        { project: { $in: projectIds } },
        { actor: userId }
      ]
    };
  }
  
  const stats = await this.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);
  
  return stats;
};

// Pre-save middleware to set visibility based on activity type
activitySchema.pre('save', async function(next) {
  // Set default visibility based on activity type
  if (this.isNew) {
    if (['project_created', 'project_completed', 'project_cancelled'].includes(this.type)) {
      this.visibility = 'public';
    } else if (['user_joined', 'user_left', 'user_role_changed'].includes(this.type)) {
      this.visibility = 'public';
    } else {
      this.visibility = 'team';
    }
  }
  
  next();
});

module.exports = mongoose.model('Activity', activitySchema);
