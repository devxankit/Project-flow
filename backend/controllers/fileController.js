const path = require('path');
const fs = require('fs');
const File = require('../models/File');
const Task = require('../models/Task');
const Subtask = require('../models/Subtask');
const Customer = require('../models/Customer');
const { formatFileData, deleteFile } = require('../middlewares/enhancedFileUpload');

// @desc    Upload file
// @route   POST /api/files/upload
// @access  Private
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { entityType, entityId, customerId, description } = req.body;

    // Validate required fields
    if (!entityType || !entityId || !customerId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: entityType, entityId, customerId'
      });
    }

    // Verify entity exists and user has permission
    let entity;
    if (entityType === 'task') {
      entity = await Task.findOne({ _id: entityId, customer: customerId });
    } else if (entityType === 'subtask') {
      entity = await Subtask.findOne({ _id: entityId, customer: customerId });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid entity type'
      });
    }

    if (!entity) {
      return res.status(404).json({
        success: false,
        message: 'Entity not found'
      });
    }

    // Format file data using the helper function
    const fileData = formatFileData(req.file, req.user.id);
    
    // Add entity-specific information
    fileData.entityType = entityType;
    fileData.entityId = entityId;
    fileData.customerId = customerId;
    fileData.description = description;

    const file = new File(fileData);
    await file.save();

    // Add file reference to entity
    entity.attachments.push(file._id);
    await entity.save();

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        fileId: file._id,
        filename: file.filename,
        originalName: file.originalName,
        size: file.size,
        mimetype: file.mimetype
      }
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    
    // Clean up uploaded file if database save fails
    if (req.file && req.file.path) {
      try {
        await deleteFile(req.file.path);
      } catch (deleteError) {
        console.error('Error cleaning up uploaded file:', deleteError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
};

// @desc    Download file by ID
// @route   GET /api/files/:fileId
// @access  Private
const downloadFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    console.log('Download request for fileId:', fileId);

    // Find file in database
    const file = await File.findById(fileId).populate('uploadedBy', 'name email');
    console.log('File found in database:', file ? 'Yes' : 'No');
    
    if (!file || !file.isActive) {
      console.log('File not found or inactive');
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check if file exists on disk
    const filePath = path.join(process.cwd(), file.path);
    console.log('Looking for file at path:', filePath);
    console.log('File exists on disk:', fs.existsSync(filePath));
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on disk'
      });
    }

    // Verify file integrity
    const stats = fs.statSync(filePath);
    console.log('File size on disk:', stats.size, 'bytes');
    console.log('File size in DB:', file.size, 'bytes');
    
    if (stats.size !== file.size) {
      console.log('File size mismatch detected');
      return res.status(500).json({
        success: false,
        message: 'File integrity check failed'
      });
    }

    // Set appropriate headers
    const fileExtension = path.extname(file.originalName).toLowerCase();
    let contentType = 'application/octet-stream';
    let disposition = 'attachment';

    // Set content type based on file extension
    if (fileExtension === '.pdf') {
      contentType = 'application/pdf';
      disposition = 'attachment'; // Force download for PDFs
    } else if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'].includes(fileExtension)) {
      contentType = `image/${fileExtension.slice(1)}`;
      disposition = 'attachment'; // Force download for images
    } else if (['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.3gp'].includes(fileExtension)) {
      contentType = `video/${fileExtension.slice(1)}`;
      disposition = 'attachment'; // Force download for videos
    } else if (['.mp3', '.wav', '.ogg', '.aac', '.flac'].includes(fileExtension)) {
      contentType = `audio/${fileExtension.slice(1)}`;
      disposition = 'attachment'; // Force download for audio
    } else if (['.txt', '.csv', '.html', '.xml', '.json'].includes(fileExtension)) {
      contentType = `text/${fileExtension.slice(1)}`;
      disposition = 'attachment'; // Force download for text files
    }

    console.log('Content-Type:', contentType);
    console.log('Content-Disposition:', `${disposition}; filename="${encodeURIComponent(file.originalName)}"`);

    // Use res.download() for proper file serving
    res.download(filePath, file.originalName, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Error downloading file'
          });
        }
      } else {
        console.log('File downloaded successfully');
      }
    });

  } catch (error) {
    console.error('Error downloading file:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Error downloading file',
        error: error.message
      });
    }
  }
};

// @desc    Get files for an entity
// @route   GET /api/files/entity/:entityType/:entityId
// @access  Private
const getEntityFiles = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;

    const files = await File.find({ 
      entityType, 
      entityId, 
      isActive: true 
    })
      .populate('uploadedBy', 'name email')
      .sort({ uploadedAt: -1 });

    res.json({
      success: true,
      data: files
    });

  } catch (error) {
    console.error('Error getting entity files:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting files',
      error: error.message
    });
  }
};

// @desc    Delete file
// @route   DELETE /api/files/:fileId
// @access  Private
const deleteFileRecord = async (req, res) => {
  try {
    const { fileId } = req.params;

    // Find file in database
    const file = await File.findById(fileId);
    if (!file || !file.isActive) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check permissions (only PM can delete files)
    if (req.user.role !== 'pm') {
      return res.status(403).json({
        success: false,
        message: 'Only PMs can delete files'
      });
    }

    // Delete file from disk
    const filePath = path.join(process.cwd(), file.path);
    if (fs.existsSync(filePath)) {
      await deleteFile(filePath);
    }

    // Remove file reference from entity
    if (file.entityType === 'task') {
      await Task.findByIdAndUpdate(file.entityId, {
        $pull: { attachments: fileId }
      });
    } else if (file.entityType === 'subtask') {
      await Subtask.findByIdAndUpdate(file.entityId, {
        $pull: { attachments: fileId }
      });
    }

    // Soft delete file record
    file.isActive = false;
    await file.save();

    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting file',
      error: error.message
    });
  }
};

module.exports = {
  uploadFile,
  downloadFile,
  getEntityFiles,
  deleteFile: deleteFileRecord
};
