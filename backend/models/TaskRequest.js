const mongoose = require('mongoose');

const taskRequestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'in-progress', 'completed'],
    default: 'pending'
  },
  dueDate: {
    type: Date
  },
  estimatedHours: {
    type: Number,
    min: [1, 'Estimated hours must be at least 1'],
    max: [1000, 'Estimated hours cannot exceed 1000']
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer is required']
  },
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [200, 'Customer name cannot exceed 200 characters']
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
  response: {
    type: String,
    trim: true,
    maxlength: [1000, 'Response cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// Indexes
taskRequestSchema.index({ customer: 1, createdAt: -1 });
taskRequestSchema.index({ requestedBy: 1, createdAt: -1 });
taskRequestSchema.index({ status: 1 });
taskRequestSchema.index({ priority: 1 });

module.exports = mongoose.model('TaskRequest', taskRequestSchema);