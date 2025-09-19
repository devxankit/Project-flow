const express = require('express');
const router = express.Router();
const {
  createMilestone,
  getMilestonesByProject,
  getMilestone,
  updateMilestone,
  deleteMilestone,
  getTeamMembersForMilestone,
  downloadAttachment
} = require('../controllers/milestoneController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { body, param } = require('express-validator');
const { upload, uploadMultiple } = require('../middlewares/uploadMiddleware');

// Validation middleware
const validateMilestone = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Milestone title is required')
    .isLength({ max: 200 })
    .withMessage('Milestone title cannot exceed 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Milestone description cannot exceed 1000 characters'),
  
  body('dueDate')
    .isISO8601()
    .withMessage('Valid due date is required'),
  
  body('assignedTo')
    .optional()
    .custom((value) => {
      // Handle both array format and FormData array format
      if (Array.isArray(value)) {
        return value.every(id => typeof id === 'string' && id.length === 24);
      }
      return true;
    })
    .withMessage('Assigned team must be an array of valid IDs'),
  
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Status must be pending, in-progress, completed, or cancelled'),
  
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Priority must be low, normal, high, or urgent'),
  
  body('sequence')
    .custom((value) => {
      const num = parseInt(value);
      if (isNaN(num) || num < 1) {
        throw new Error('Sequence must be a positive integer');
      }
      return true;
    }),
  
  body('projectId')
    .isMongoId()
    .withMessage('Valid project ID is required')
];

const validateMilestoneId = [
  param('milestoneId')
    .isMongoId()
    .withMessage('Valid milestone ID is required'),
  
  param('projectId')
    .isMongoId()
    .withMessage('Valid project ID is required')
];

// All routes are protected
router.use(protect);

// @route   POST /api/milestones
// @desc    Create a new milestone
// @access  Private (PM only)
router.post(
  '/',
  authorize('pm'),
  uploadMultiple('attachments', 10), // Allow up to 10 attachments
  createMilestone
);

// @route   GET /api/milestones/team/:projectId
// @desc    Get team members for milestone assignment
// @access  Private
router.get(
  '/team/:projectId',
  validateMilestoneId,
  getTeamMembersForMilestone
);

// @route   GET /api/milestones/project/:projectId
// @desc    Get milestones for a project
// @access  Private
router.get(
  '/project/:projectId',
  validateMilestoneId,
  getMilestonesByProject
);

// @route   GET /api/milestones/:milestoneId/project/:projectId
// @desc    Get single milestone
// @access  Private
router.get(
  '/:milestoneId/project/:projectId',
  validateMilestoneId,
  getMilestone
);

// @route   PUT /api/milestones/:milestoneId/project/:projectId
// @desc    Update milestone
// @access  Private (PM only)
router.put(
  '/:milestoneId/project/:projectId',
  authorize('pm'),
  uploadMultiple('attachments', 10), // Allow up to 10 attachments
  validateMilestoneId,
  validateMilestone,
  updateMilestone
);

// @route   DELETE /api/milestones/:milestoneId/project/:projectId
// @desc    Delete milestone
// @access  Private (PM only)
router.delete(
  '/:milestoneId/project/:projectId',
  authorize('pm'),
  validateMilestoneId,
  deleteMilestone
);

// @route   GET /api/milestones/:milestoneId/project/:projectId/attachment/:attachmentId/download
// @desc    Download milestone attachment
// @access  Private
router.get(
  '/:milestoneId/project/:projectId/attachment/:attachmentId/download',
  validateMilestoneId,
  downloadAttachment
);

// @route   GET /api/milestones/:milestoneId/project/:projectId/attachment/:attachmentId/debug
// @desc    Debug milestone attachment details
// @access  Private
router.get(
  '/:milestoneId/project/:projectId/attachment/:attachmentId/debug',
  validateMilestoneId,
  async (req, res) => {
    try {
      const { milestoneId, projectId, attachmentId } = req.params;
      
      // Find the milestone and attachment
      const Milestone = require('../models/Milestone');
      const milestone = await Milestone.findOne({
        _id: milestoneId,
        project: projectId
      });
      
      if (!milestone) {
        return res.status(404).json({
          success: false,
          message: 'Milestone not found'
        });
      }
      
      const attachment = milestone.attachments.find(att => att._id.toString() === attachmentId);
      if (!attachment) {
        return res.status(404).json({
          success: false,
          message: 'Attachment not found'
        });
      }
      
      res.json({
        success: true,
        data: {
          attachment: {
            _id: attachment._id,
            cloudinaryId: attachment.cloudinaryId,
            filename: attachment.filename,
            url: attachment.url,
            originalName: attachment.originalName,
            mimetype: attachment.mimetype,
            fileType: attachment.fileType,
            size: attachment.size
          },
          milestone: {
            _id: milestone._id,
            title: milestone.title
          }
        }
      });
      
    } catch (error) {
      console.error('Debug error:', error);
      res.status(500).json({
        success: false,
        message: 'Debug error',
        error: error.message
      });
    }
  }
);

module.exports = router;
