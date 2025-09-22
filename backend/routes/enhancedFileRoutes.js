const express = require('express');
const router = express.Router();
const { authorize } = require('../middlewares/authMiddleware');
const {
  downloadTaskAttachment,
  downloadSubtaskAttachment,
  deleteTaskAttachment,
  deleteSubtaskAttachment,
  getFileInfo,
  cleanupFiles,
  getFileStatistics
} = require('../controllers/enhancedFileController');

// @route   GET /api/files/info/:filePath
// @desc    Get file information
// @access  Private
router.get('/info/:filePath', authorize(), getFileInfo);

// Task file routes
// @route   GET /api/files/task/:taskId/customer/:customerId/attachment/:attachmentId/download
// @desc    Download file from task
// @access  Private
router.get('/task/:taskId/customer/:customerId/attachment/:attachmentId/download', 
  authorize(), 
  downloadTaskAttachment
);

// @route   DELETE /api/files/task/:taskId/customer/:customerId/attachment/:attachmentId
// @desc    Delete file from task
// @access  Private (PM only)
router.delete('/task/:taskId/customer/:customerId/attachment/:attachmentId', 
  authorize('pm'), 
  deleteTaskAttachment
);

// Subtask file routes
// @route   GET /api/files/subtask/:subtaskId/customer/:customerId/attachment/:attachmentId/download
// @desc    Download file from subtask
// @access  Private
router.get('/subtask/:subtaskId/customer/:customerId/attachment/:attachmentId/download', 
  authorize(), 
  downloadSubtaskAttachment
);

// @route   DELETE /api/files/subtask/:subtaskId/customer/:customerId/attachment/:attachmentId
// @desc    Delete file from subtask
// @access  Private (PM only)
router.delete('/subtask/:subtaskId/customer/:customerId/attachment/:attachmentId', 
  authorize('pm'), 
  deleteSubtaskAttachment
);

// File management routes
// @route   POST /api/files/cleanup
// @desc    Clean up old files
// @access  Private (PM only)
router.post('/cleanup', authorize('pm'), cleanupFiles);

// @route   GET /api/files/stats
// @desc    Get file statistics
// @access  Private (PM only)
router.get('/stats', authorize('pm'), getFileStatistics);

module.exports = router;
