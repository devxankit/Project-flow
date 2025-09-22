const path = require('path');
const fs = require('fs');
const { 
  serveFile, 
  deleteFile, 
  backupFile, 
  getFileSystemStats,
  cleanupOldFiles 
} = require('../middlewares/enhancedFileUpload');

const Task = require('../models/Task');
const Subtask = require('../models/Subtask');
const Customer = require('../models/Customer');
const User = require('../models/User');

// Permission check helper
const checkCustomerPermission = async (customerId, userId, userRole) => {
  try {
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return { hasPermission: false, error: 'Customer not found' };
    }

    if (userRole === 'pm') {
      return { hasPermission: true };
    } else if (userRole === 'employee') {
      const hasAccess = customer.assignedTeam.some(teamMember => teamMember.toString() === userId);
      return { hasPermission: hasAccess };
    } else if (userRole === 'customer') {
      const hasAccess = customer.customer.toString() === userId;
      return { hasPermission: hasAccess };
    }

    return { hasPermission: false, error: 'Invalid role' };
  } catch (error) {
    console.error('Error checking customer permission:', error);
    return { hasPermission: false, error: 'Permission check failed' };
  }
};

// @desc    Download file from task
// @route   GET /api/files/task/:taskId/customer/:customerId/attachment/:attachmentId/download
// @access  Private
const downloadTaskAttachment = async (req, res) => {
  try {
    const { taskId, customerId, attachmentId } = req.params;

    // Check permissions
    const permissionCheck = await checkCustomerPermission(customerId, req.user.id, req.user.role);
    if (!permissionCheck.hasPermission) {
      const statusCode = permissionCheck.error === 'Customer not found' ? 404 : 403;
      return res.status(statusCode).json({
        success: false,
        message: permissionCheck.error || 'Access denied'
      });
    }

    // Find the task
    const task = await Task.findOne({ _id: taskId, customer: customerId });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Find the attachment
    const attachment = task.attachments.find(att => att._id.toString() === attachmentId);
    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
    }

    // Serve the file
    const filePath = path.join(process.cwd(), attachment.url);
    serveFile(filePath, res, attachment.originalName);

  } catch (error) {
    console.error('Error downloading task attachment:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Error downloading attachment',
        error: error.message
      });
    }
  }
};

// @desc    Download file from subtask
// @route   GET /api/files/subtask/:subtaskId/customer/:customerId/attachment/:attachmentId/download
// @access  Private
const downloadSubtaskAttachment = async (req, res) => {
  try {
    const { subtaskId, customerId, attachmentId } = req.params;

    // Check permissions
    const permissionCheck = await checkCustomerPermission(customerId, req.user.id, req.user.role);
    if (!permissionCheck.hasPermission) {
      const statusCode = permissionCheck.error === 'Customer not found' ? 404 : 403;
      return res.status(statusCode).json({
        success: false,
        message: permissionCheck.error || 'Access denied'
      });
    }

    // Find the subtask
    const subtask = await Subtask.findOne({ _id: subtaskId, customer: customerId });
    if (!subtask) {
      return res.status(404).json({
        success: false,
        message: 'Subtask not found'
      });
    }

    // Find the attachment
    const attachment = subtask.attachments.find(att => att._id.toString() === attachmentId);
    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
    }

    // Serve the file
    const filePath = path.join(process.cwd(), attachment.url);
    serveFile(filePath, res, attachment.originalName);

  } catch (error) {
    console.error('Error downloading subtask attachment:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Error downloading attachment',
        error: error.message
      });
    }
  }
};

// @desc    Delete file from task
// @route   DELETE /api/files/task/:taskId/customer/:customerId/attachment/:attachmentId
// @access  Private (PM only)
const deleteTaskAttachment = async (req, res) => {
  try {
    const { taskId, customerId, attachmentId } = req.params;

    // Check permissions (only PM can delete files)
    if (req.user.role !== 'pm') {
      return res.status(403).json({
        success: false,
        message: 'Only PMs can delete attachments'
      });
    }

    const permissionCheck = await checkCustomerPermission(customerId, req.user.id, req.user.role);
    if (!permissionCheck.hasPermission) {
      const statusCode = permissionCheck.error === 'Customer not found' ? 404 : 403;
      return res.status(statusCode).json({
        success: false,
        message: permissionCheck.error || 'Access denied'
      });
    }

    // Find the task
    const task = await Task.findOne({ _id: taskId, customer: customerId });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Find the attachment
    const attachmentIndex = task.attachments.findIndex(att => att._id.toString() === attachmentId);
    if (attachmentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
    }

    const attachment = task.attachments[attachmentIndex];

    // Backup file before deletion
    const filePath = path.join(process.cwd(), attachment.url);
    await backupFile(filePath);

    // Delete physical file
    await deleteFile(filePath);

    // Remove attachment from task
    task.attachments.splice(attachmentIndex, 1);
    await task.save();

    res.json({
      success: true,
      message: 'Attachment deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting task attachment:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting attachment',
      error: error.message
    });
  }
};

// @desc    Delete file from subtask
// @route   DELETE /api/files/subtask/:subtaskId/customer/:customerId/attachment/:attachmentId
// @access  Private (PM only)
const deleteSubtaskAttachment = async (req, res) => {
  try {
    const { subtaskId, customerId, attachmentId } = req.params;

    // Check permissions (only PM can delete files)
    if (req.user.role !== 'pm') {
      return res.status(403).json({
        success: false,
        message: 'Only PMs can delete attachments'
      });
    }

    const permissionCheck = await checkCustomerPermission(customerId, req.user.id, req.user.role);
    if (!permissionCheck.hasPermission) {
      const statusCode = permissionCheck.error === 'Customer not found' ? 404 : 403;
      return res.status(statusCode).json({
        success: false,
        message: permissionCheck.error || 'Access denied'
      });
    }

    // Find the subtask
    const subtask = await Subtask.findOne({ _id: subtaskId, customer: customerId });
    if (!subtask) {
      return res.status(404).json({
        success: false,
        message: 'Subtask not found'
      });
    }

    // Find the attachment
    const attachmentIndex = subtask.attachments.findIndex(att => att._id.toString() === attachmentId);
    if (attachmentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
    }

    const attachment = subtask.attachments[attachmentIndex];

    // Backup file before deletion
    const filePath = path.join(process.cwd(), attachment.url);
    await backupFile(filePath);

    // Delete physical file
    await deleteFile(filePath);

    // Remove attachment from subtask
    subtask.attachments.splice(attachmentIndex, 1);
    await subtask.save();

    res.json({
      success: true,
      message: 'Attachment deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting subtask attachment:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting attachment',
      error: error.message
    });
  }
};

// @desc    Get file information
// @route   GET /api/files/info/:filePath
// @access  Private
const getFileInfo = async (req, res) => {
  try {
    const { filePath } = req.params;
    const decodedPath = decodeURIComponent(filePath);
    
    // Security check: ensure path is within uploads directory
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const fullPath = path.resolve(decodedPath);
    
    if (!fullPath.startsWith(uploadsDir)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Invalid file path'
      });
    }

    const stats = await getFileSystemStats(fullPath);
    
    if (!stats.exists) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    res.json({
      success: true,
      data: {
        path: fullPath,
        size: stats.size,
        created: stats.created,
        modified: stats.modified,
        isFile: stats.isFile,
        isDirectory: stats.isDirectory
      }
    });

  } catch (error) {
    console.error('Error getting file info:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting file information',
      error: error.message
    });
  }
};

// @desc    Clean up old files
// @route   POST /api/files/cleanup
// @access  Private (PM only)
const cleanupFiles = async (req, res) => {
  try {
    // Only PMs can trigger cleanup
    if (req.user.role !== 'pm') {
      return res.status(403).json({
        success: false,
        message: 'Only PMs can trigger file cleanup'
      });
    }

    const { maxAgeInDays = 30 } = req.body;
    
    // Clean up different directories
    const directories = [
      './uploads/temp',
      './uploads/backups'
    ];

    let totalCleaned = 0;
    
    for (const dir of directories) {
      await cleanupOldFiles(dir, maxAgeInDays);
      totalCleaned++;
    }

    res.json({
      success: true,
      message: `File cleanup completed. Processed ${totalCleaned} directories.`,
      data: {
        directoriesProcessed: totalCleaned,
        maxAgeInDays
      }
    });

  } catch (error) {
    console.error('Error during file cleanup:', error);
    res.status(500).json({
      success: false,
      message: 'Error during file cleanup',
      error: error.message
    });
  }
};

// @desc    Get file statistics
// @route   GET /api/files/stats
// @access  Private (PM only)
const getFileStatistics = async (req, res) => {
  try {
    // Only PMs can view file statistics
    if (req.user.role !== 'pm') {
      return res.status(403).json({
        success: false,
        message: 'Only PMs can view file statistics'
      });
    }

    const uploadsDir = './uploads';
    let totalFiles = 0;
    let totalSize = 0;
    let fileTypes = {};

    const scanDirectory = async (dir) => {
      try {
        const items = await fs.promises.readdir(dir);
        
        for (const item of items) {
          const itemPath = path.join(dir, item);
          const stats = await fs.promises.stat(itemPath);
          
          if (stats.isDirectory()) {
            await scanDirectory(itemPath);
          } else if (stats.isFile()) {
            totalFiles++;
            totalSize += stats.size;
            
            const ext = path.extname(item).toLowerCase();
            fileTypes[ext] = (fileTypes[ext] || 0) + 1;
          }
        }
      } catch (error) {
        console.error(`Error scanning directory ${dir}:`, error);
      }
    };

    await scanDirectory(uploadsDir);

    res.json({
      success: true,
      data: {
        totalFiles,
        totalSize,
        totalSizeFormatted: formatBytes(totalSize),
        fileTypes,
        directories: {
          tasks: './uploads/tasks',
          subtasks: './uploads/subtasks',
          temp: './uploads/temp',
          backups: './uploads/backups'
        }
      }
    });

  } catch (error) {
    console.error('Error getting file statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting file statistics',
      error: error.message
    });
  }
};

// Helper function to format bytes
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

module.exports = {
  downloadTaskAttachment,
  downloadSubtaskAttachment,
  deleteTaskAttachment,
  deleteSubtaskAttachment,
  getFileInfo,
  cleanupFiles,
  getFileStatistics
};
