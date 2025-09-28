const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
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
  path: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true,
    enum: {
      values: ['image', 'video', 'document', 'audio', 'archive', 'other'],
      message: 'File type must be image, video, document, audio, archive, or other'
    }
  },
  fileExtension: {
    type: String,
    required: true,
    trim: true
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
  },
  // Reference to the entity this file belongs to
  entityType: {
    type: String,
    enum: ['task', 'subtask'],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  // Soft delete flag
  isActive: {
    type: Boolean,
    default: true
  },
  // Security and validation
  isSecure: {
    type: Boolean,
    default: true
  },
  validatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
fileSchema.index({ entityType: 1, entityId: 1 });
fileSchema.index({ customerId: 1 });
fileSchema.index({ uploadedBy: 1 });

module.exports = mongoose.model('File', fileSchema);
