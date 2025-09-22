const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Enhanced file upload middleware with industry-level security and validation

// Ensure upload directories exist
const ensureUploadDirs = () => {
  const uploadDirs = [
    './uploads',
    './uploads/tasks',
    './uploads/subtasks',
    './uploads/temp',
    './uploads/backups'
  ];

  uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Initialize upload directories
ensureUploadDirs();

// Enhanced file type validation with security checks
const ALLOWED_MIME_TYPES = {
  // Images
  'image/jpeg': { ext: '.jpg', category: 'image' },
  'image/jpg': { ext: '.jpg', category: 'image' },
  'image/png': { ext: '.png', category: 'image' },
  'image/gif': { ext: '.gif', category: 'image' },
  'image/webp': { ext: '.webp', category: 'image' },
  'image/bmp': { ext: '.bmp', category: 'image' },
  'image/tiff': { ext: '.tiff', category: 'image' },
  'image/svg+xml': { ext: '.svg', category: 'image' },
  
  // Documents
  'application/pdf': { ext: '.pdf', category: 'document' },
  'application/msword': { ext: '.doc', category: 'document' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { ext: '.docx', category: 'document' },
  'application/vnd.ms-excel': { ext: '.xls', category: 'document' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { ext: '.xlsx', category: 'document' },
  'application/vnd.ms-powerpoint': { ext: '.ppt', category: 'document' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { ext: '.pptx', category: 'document' },
  'text/plain': { ext: '.txt', category: 'document' },
  'text/csv': { ext: '.csv', category: 'document' },
  'text/html': { ext: '.html', category: 'document' },
  'text/xml': { ext: '.xml', category: 'document' },
  'application/json': { ext: '.json', category: 'document' },
  'application/rtf': { ext: '.rtf', category: 'document' },
  
  // Archives
  'application/zip': { ext: '.zip', category: 'archive' },
  'application/x-rar-compressed': { ext: '.rar', category: 'archive' },
  'application/x-7z-compressed': { ext: '.7z', category: 'archive' },
  'application/x-tar': { ext: '.tar', category: 'archive' },
  'application/gzip': { ext: '.gz', category: 'archive' },
  
  // Videos
  'video/mp4': { ext: '.mp4', category: 'video' },
  'video/avi': { ext: '.avi', category: 'video' },
  'video/mov': { ext: '.mov', category: 'video' },
  'video/wmv': { ext: '.wmv', category: 'video' },
  'video/flv': { ext: '.flv', category: 'video' },
  'video/webm': { ext: '.webm', category: 'video' },
  'video/mkv': { ext: '.mkv', category: 'video' },
  'video/3gp': { ext: '.3gp', category: 'video' },
  
  // Audio
  'audio/mp3': { ext: '.mp3', category: 'audio' },
  'audio/wav': { ext: '.wav', category: 'audio' },
  'audio/ogg': { ext: '.ogg', category: 'audio' },
  'audio/mpeg': { ext: '.mp3', category: 'audio' },
  'audio/aac': { ext: '.aac', category: 'audio' },
  'audio/flac': { ext: '.flac', category: 'audio' }
};

// Security: Dangerous file types to block
const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
  '.php', '.asp', '.aspx', '.jsp', '.py', '.rb', '.pl', '.sh', '.ps1'
];

// File size limits by category (in bytes)
const FILE_SIZE_LIMITS = {
  image: 5 * 1024 * 1024,      // 5MB
  document: 10 * 1024 * 1024,  // 10MB
  video: 50 * 1024 * 1024,     // 50MB
  audio: 20 * 1024 * 1024,     // 20MB
  archive: 25 * 1024 * 1024    // 25MB
};

// Enhanced file filter with security checks
const fileFilter = (req, file, cb) => {
  try {
    // Check if MIME type is allowed
    if (!ALLOWED_MIME_TYPES[file.mimetype]) {
      return cb(new Error(`File type ${file.mimetype} is not allowed`), false);
    }

    // Get file extension from original name
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    // Security check: Block dangerous extensions
    if (DANGEROUS_EXTENSIONS.includes(fileExtension)) {
      return cb(new Error(`File extension ${fileExtension} is not allowed for security reasons`), false);
    }

    // Verify MIME type matches extension
    const expectedExt = ALLOWED_MIME_TYPES[file.mimetype].ext;
    if (fileExtension !== expectedExt) {
      return cb(new Error(`File extension ${fileExtension} does not match MIME type ${file.mimetype}`), false);
    }

    // Additional security: Check file signature (magic numbers)
    // This would require reading the first few bytes of the file
    // For now, we'll rely on MIME type validation

    cb(null, true);
  } catch (error) {
    cb(new Error(`File validation error: ${error.message}`), false);
  }
};

// Enhanced storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      let uploadPath = './uploads';
      
      // Determine upload path based on route
      const baseUrl = req.baseUrl || req.originalUrl || '';
      
      if (baseUrl.includes('/tasks')) {
        uploadPath = './uploads/tasks';
      } else if (baseUrl.includes('/subtasks')) {
        uploadPath = './uploads/subtasks';
      } else {
        uploadPath = './uploads/temp';
      }
      
      // Create entity-specific subdirectory if entity ID is available
      const entityId = req.params.taskId || req.params.subtaskId;
      if (entityId) {
        uploadPath = path.join(uploadPath, entityId);
      }
      
      // Ensure directory exists
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      
      cb(null, uploadPath);
    } catch (error) {
      cb(new Error(`Directory creation error: ${error.message}`), null);
    }
  },
  
  filename: function (req, file, cb) {
    try {
      // Generate secure filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const randomString = crypto.randomBytes(8).toString('hex');
      const fileExtension = path.extname(file.originalname).toLowerCase();
      
      // Create secure filename: timestamp-randomhash-originalname
      const sanitizedName = file.originalname
        .replace(/[^a-zA-Z0-9.-]/g, '_')  // Replace special chars with underscore
        .substring(0, 50);  // Limit length
      
      const filename = `${timestamp}-${randomString}-${sanitizedName}${fileExtension}`;
      
      cb(null, filename);
    } catch (error) {
      cb(new Error(`Filename generation error: ${error.message}`), null);
    }
  }
});

// Enhanced multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024,  // 50MB max per file
    files: 10,                    // Max 10 files per request
    fieldSize: 1024 * 1024,      // 1MB max for field values
    fieldNameSize: 100,           // Max 100 chars for field names
    parts: 20                     // Max 20 parts (fields + files)
  },
  onError: function (err, next) {
    console.error('Multer error:', err);
    next(err);
  }
});

// Helper function to format file data for database
const formatFileData = (file, userId) => {
  const mimeInfo = ALLOWED_MIME_TYPES[file.mimetype];
  
  return {
    filename: file.filename,
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    url: file.path,
    fileType: mimeInfo ? mimeInfo.category : 'other',
    fileExtension: path.extname(file.originalname).toLowerCase(),
    uploadedBy: userId,
    uploadedAt: new Date(),
    // Security metadata
    isSecure: true,
    validatedAt: new Date()
  };
};

// Helper function to validate file size by category
const validateFileSize = (file) => {
  const mimeInfo = ALLOWED_MIME_TYPES[file.mimetype];
  if (!mimeInfo) return false;
  
  const maxSize = FILE_SIZE_LIMITS[mimeInfo.category] || FILE_SIZE_LIMITS.document;
  return file.size <= maxSize;
};

// Helper function to get file system stats
const getFileSystemStats = async (filePath) => {
  try {
    const stats = await fs.promises.stat(filePath);
    return {
      exists: true,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory()
    };
  } catch (error) {
    console.error('Error getting file stats:', error);
    return { exists: false, error: error.message };
  }
};

// Helper function to serve file securely
const serveFile = (filePath, res, originalName) => {
  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const fileExtension = path.extname(filePath).toLowerCase();
    const fileName = originalName || path.basename(filePath);
    
    // Set appropriate content type and headers
    let contentType = 'application/octet-stream';
    let disposition = 'attachment'; // Default to download
    
    // Set content type based on file extension
    if (fileExtension === '.pdf') {
      contentType = 'application/pdf';
      disposition = 'inline'; // Allow PDF preview
    } else if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'].includes(fileExtension)) {
      contentType = `image/${fileExtension.slice(1)}`;
      disposition = 'inline'; // Allow image preview
    } else if (['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.3gp'].includes(fileExtension)) {
      contentType = `video/${fileExtension.slice(1)}`;
      disposition = 'inline'; // Allow video preview
    } else if (['.mp3', '.wav', '.ogg', '.aac', '.flac'].includes(fileExtension)) {
      contentType = `audio/${fileExtension.slice(1)}`;
      disposition = 'inline'; // Allow audio preview
    } else if (['.txt', '.csv', '.html', '.xml', '.json'].includes(fileExtension)) {
      contentType = `text/${fileExtension.slice(1)}`;
      disposition = 'inline'; // Allow text preview
    }
    
    // Set security headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `${disposition}; filename="${fileName}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Cache-Control', 'private, max-age=3600');
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    
    fileStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error streaming file'
        });
      }
    });
    
    fileStream.pipe(res);
    
    return true;
  } catch (error) {
    console.error(`Error serving file ${filePath}:`, error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Error serving file',
        error: error.message
      });
    }
    return false;
  }
};

// Helper function to clean up old files
const cleanupOldFiles = async (directory, maxAgeInDays = 30) => {
  try {
    if (!fs.existsSync(directory)) return;
    
    const files = await fs.promises.readdir(directory);
    const now = Date.now();
    const maxAge = maxAgeInDays * 24 * 60 * 60 * 1000; // Convert days to milliseconds
    
    for (const file of files) {
      const filePath = path.join(directory, file);
      const stats = await fs.promises.stat(filePath);
      
      if (stats.isFile() && (now - stats.mtime.getTime()) > maxAge) {
        await fs.promises.unlink(filePath);
        console.log(`Cleaned up old file: ${filePath}`);
      }
    }
  } catch (error) {
    console.error('Error cleaning up old files:', error);
  }
};

// Helper function to delete file safely
const deleteFile = async (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      console.log(`File deleted: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Helper function to move file to backup
const backupFile = async (filePath, backupDir = './uploads/backups') => {
  try {
    if (!fs.existsSync(filePath)) return false;
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const fileName = path.basename(filePath);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `${timestamp}-${fileName}`);
    
    await fs.promises.copyFile(filePath, backupPath);
    console.log(`File backed up: ${backupPath}`);
    return backupPath;
  } catch (error) {
    console.error('Error backing up file:', error);
    return false;
  }
};

module.exports = {
  upload,
  formatFileData,
  validateFileSize,
  getFileSystemStats,
  serveFile,
  cleanupOldFiles,
  deleteFile,
  backupFile,
  ALLOWED_MIME_TYPES,
  FILE_SIZE_LIMITS,
  DANGEROUS_EXTENSIONS
};
