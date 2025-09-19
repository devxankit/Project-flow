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

// Allowed image types for profile pictures
const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// File size limit for profile images (5MB)
const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;

// Custom file filter for profile images
const profileImageFilter = (req, file, cb) => {
  if (allowedImageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Only image files are allowed for profile pictures. Allowed types: ${allowedImageTypes.join(', ')}`), false);
  }
};

// Cloudinary storage configuration for profile images
const profileImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: (req, file) => {
      const userId = req.user ? req.user._id : 'anonymous';
      return `projectflow/profile-images/${userId}`;
    },
    public_id: (req, file) => {
      // Generate unique filename with timestamp
      const timestamp = Date.now();
      const originalName = path.parse(file.originalname).name;
      const sanitizedName = originalName.replace(/[^a-zA-Z0-9]/g, '_');
      return `profile_${sanitizedName}_${timestamp}`;
    },
    resource_type: 'image',
    transformation: {
      quality: 'auto',
      fetch_format: 'auto',
      width: 400,
      height: 400,
      crop: 'fill',
      gravity: 'face'
    }
  }
});

// Multer configuration for profile images
const profileImageUpload = multer({
  storage: profileImageStorage,
  fileFilter: profileImageFilter,
  limits: {
    fileSize: MAX_PROFILE_IMAGE_SIZE,
    files: 1 // Only one profile image at a time
  }
});

// Middleware for single profile image upload
const uploadProfileImage = (req, res, next) => {
  const uploadMiddleware = profileImageUpload.single('profileImage');
  
  uploadMiddleware(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'Profile image size too large. Maximum size: 5MB',
            error: err.message
          });
        } else if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: 'Only one profile image is allowed',
            error: err.message
          });
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            success: false,
            message: 'Unexpected file field. Use "profileImage" field name',
            error: err.message
          });
        }
      }
      
      return res.status(400).json({
        success: false,
        message: 'Profile image upload error',
        error: err.message
      });
    }
    
    // Add file information to request
    if (req.file) {
      req.file.fileType = 'profile-image';
      req.file.sizeLimit = MAX_PROFILE_IMAGE_SIZE;
    }
    
    next();
  });
};

// Helper function to delete profile image from Cloudinary
const deleteProfileImage = async (cloudinaryId) => {
  try {
    const result = await cloudinary.uploader.destroy(cloudinaryId, {
      resource_type: 'image'
    });
    return result;
  } catch (error) {
    console.error('Error deleting profile image from Cloudinary:', error);
    throw error;
  }
};

// Helper function to format profile image data for database storage
const formatProfileImageData = (file) => {
  return {
    url: file.path,
    cloudinaryId: file.public_id,
    uploadedAt: new Date()
  };
};

module.exports = {
  uploadProfileImage,
  deleteProfileImage,
  formatProfileImageData,
  allowedImageTypes,
  MAX_PROFILE_IMAGE_SIZE
};
