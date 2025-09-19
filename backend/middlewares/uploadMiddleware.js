const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// File type validation
const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/avi'];
const allowedDocumentTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed'
];

const allAllowedTypes = [...allowedImageTypes, ...allowedVideoTypes, ...allowedDocumentTypes];

// File size limits (in bytes)
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB for images
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB for videos
const MAX_DOCUMENT_SIZE = 50 * 1024 * 1024; // 50MB for documents

// Helper function to determine file type category
const getFileTypeCategory = (mimetype) => {
  if (allowedImageTypes.includes(mimetype)) return 'image';
  if (allowedVideoTypes.includes(mimetype)) return 'video';
  if (allowedDocumentTypes.includes(mimetype)) return 'document';
  return 'other';
};

// Helper function to get file size limit based on type
const getFileSizeLimit = (mimetype) => {
  const category = getFileTypeCategory(mimetype);
  switch (category) {
    case 'image': return MAX_IMAGE_SIZE;
    case 'video': return MAX_VIDEO_SIZE;
    case 'document': return MAX_DOCUMENT_SIZE;
    default: return MAX_FILE_SIZE;
  }
};

// Custom file filter
const fileFilter = (req, file, cb) => {
  // Check if file type is allowed
  if (allAllowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed. Allowed types: ${allAllowedTypes.join(', ')}`), false);
  }
};

// Custom file size validator
const fileSizeValidator = (req, file, cb) => {
  const maxSize = getFileSizeLimit(file.mimetype);
  if (file.size && file.size > maxSize) {
    const category = getFileTypeCategory(file.mimetype);
    cb(new Error(`File size exceeds limit for ${category} files. Maximum size: ${maxSize / (1024 * 1024)}MB`), false);
  } else {
    cb(null, true);
  }
};

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: (req, file) => {
      const category = getFileTypeCategory(file.mimetype);
      // Try to get projectId from different sources
      let projectId = req.params.projectId || req.body.projectId;
      
      // If milestoneData is a JSON string, try to parse it
      if (!projectId && req.body.milestoneData) {
        try {
          const milestoneData = JSON.parse(req.body.milestoneData);
          projectId = milestoneData.projectId;
        } catch (e) {
          // Silent fail - use default
        }
      }
      
      projectId = projectId || 'general';
      return `projectflow/${category}s/${projectId}`;
    },
    public_id: (req, file) => {
      // Generate unique filename with timestamp
      const timestamp = Date.now();
      const originalName = path.parse(file.originalname).name;
      const sanitizedName = originalName.replace(/[^a-zA-Z0-9]/g, '_');
      return `${sanitizedName}_${timestamp}`;
    },
    resource_type: (req, file) => {
      const category = getFileTypeCategory(file.mimetype);
      if (category === 'video') return 'video';
      if (category === 'document') return 'raw'; // PDFs and documents should be raw
      return 'image'; // Images default to image
    },
    transformation: (req, file) => {
      const category = getFileTypeCategory(file.mimetype);
      
      if (category === 'image') {
        return {
          quality: 'auto',
          fetch_format: 'auto',
          width: 1920,
          height: 1080,
          crop: 'limit'
        };
      } else if (category === 'video') {
        return {
          quality: 'auto',
          fetch_format: 'auto',
          video_codec: 'auto',
          audio_codec: 'auto'
        };
      }
      
      return {};
    }
  }
});

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10 // Maximum 10 files per request
  }
});

// Middleware for single file upload
const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.single(fieldName);
    
    uploadMiddleware(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              message: 'File size too large',
              error: err.message
            });
          } else if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
              success: false,
              message: 'Too many files',
              error: err.message
            });
          } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
              success: false,
              message: 'Unexpected file field',
              error: err.message
            });
          }
        }
        
        return res.status(400).json({
          success: false,
          message: 'File upload error',
          error: err.message
        });
      }
      
      // Add file information to request
      if (req.file) {
        req.file.fileType = getFileTypeCategory(req.file.mimetype);
        req.file.sizeLimit = getFileSizeLimit(req.file.mimetype);
      }
      
      next();
    });
  };
};

// Middleware for multiple files upload
const uploadMultiple = (fieldName, maxCount = 10) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.array(fieldName, maxCount);
    
    uploadMiddleware(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              message: 'File size too large',
              error: err.message
            });
          } else if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
              success: false,
              message: 'Too many files',
              error: err.message
            });
          } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
              success: false,
              message: 'Unexpected file field',
              error: err.message
            });
          }
        }
        
        return res.status(400).json({
          success: false,
          message: 'File upload error',
          error: err.message
        });
      }
      
      // Add file information to request
      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
          file.fileType = getFileTypeCategory(file.mimetype);
          file.sizeLimit = getFileSizeLimit(file.mimetype);
        });
      }
      
      next();
    });
  };
};

// Middleware for mixed file uploads (different field names)
const uploadFields = (fields) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.fields(fields);
    
    uploadMiddleware(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              message: 'File size too large',
              error: err.message
            });
          } else if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
              success: false,
              message: 'Too many files',
              error: err.message
            });
          } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
              success: false,
              message: 'Unexpected file field',
              error: err.message
            });
          }
        }
        
        return res.status(400).json({
          success: false,
          message: 'File upload error',
          error: err.message
        });
      }
      
      // Add file information to request
      if (req.files) {
        Object.keys(req.files).forEach(fieldName => {
          const files = req.files[fieldName];
          if (Array.isArray(files)) {
            files.forEach(file => {
              file.fileType = getFileTypeCategory(file.mimetype);
              file.sizeLimit = getFileSizeLimit(file.mimetype);
            });
          } else {
            files.fileType = getFileTypeCategory(files.mimetype);
            files.sizeLimit = getFileSizeLimit(files.mimetype);
          }
        });
      }
      
      next();
    });
  };
};

// Helper function to format file data for database storage
const formatFileData = (file, uploadedBy) => {
  return {
    filename: file.filename,
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    url: file.path,
    cloudinaryId: file.public_id,
    fileType: file.fileType,
    uploadedBy: uploadedBy,
    uploadedAt: new Date()
  };
};

// Helper function to delete file from Cloudinary
const deleteFile = async (cloudinaryId, resourceType = 'auto') => {
  try {
    const result = await cloudinary.uploader.destroy(cloudinaryId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    throw error;
  }
};

// Helper function to get file info from Cloudinary
const getFileInfo = async (cloudinaryId, resourceType = 'auto') => {
  try {
    const result = await cloudinary.api.resource(cloudinaryId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    console.error('Error getting file info from Cloudinary:', error);
    throw error;
  }
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  formatFileData,
  deleteFile,
  getFileInfo,
  getFileTypeCategory,
  allowedImageTypes,
  allowedVideoTypes,
  allowedDocumentTypes,
  allAllowedTypes
};
