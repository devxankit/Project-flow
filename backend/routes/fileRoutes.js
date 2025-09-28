const express = require('express');
const router = express.Router();
const { authorize } = require('../middlewares/authMiddleware');
const { upload, addFileType } = require('../middlewares/enhancedFileUpload');
const {
  uploadFile,
  downloadFile,
  getEntityFiles,
  deleteFile
} = require('../controllers/fileController');

// @route   POST /api/files/upload
// @desc    Upload file
// @access  Private
router.post('/upload', authorize(), upload.single('file'), addFileType, uploadFile);

// @route   GET /api/files/:fileId
// @desc    Download file by ID
// @access  Private
router.get('/:fileId', authorize(), downloadFile);

// @route   GET /api/files/entity/:entityType/:entityId
// @desc    Get files for an entity
// @access  Private
router.get('/entity/:entityType/:entityId', authorize(), getEntityFiles);

// @route   DELETE /api/files/:fileId
// @desc    Delete file
// @access  Private (PM only)
router.delete('/:fileId', authorize('pm'), deleteFile);

module.exports = router;
