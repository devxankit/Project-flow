const express = require('express');
const router = express.Router();
const {
  getCustomerDashboard,
  getCustomerProjects,
  getCustomerProjectDetails,
  getCustomerTaskDetails,
  getCustomerMilestoneDetails,
  getCustomerFiles,
  getCustomerActivity,
  uploadTaskFile,
  uploadMilestoneFile,
  deleteTaskFile,
  deleteMilestoneFile,
  addTaskComment,
  addMilestoneComment,
  deleteTaskComment,
  deleteMilestoneComment
} = require('../controllers/customerController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { param, query } = require('express-validator');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/customer-files');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow common file types
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip',
    'application/x-rar-compressed'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, documents, and archives are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Validation middleware
const validateProjectId = [
  param('id')
    .isMongoId()
    .withMessage('Valid project ID is required')
];

const validateTaskId = [
  param('id')
    .isMongoId()
    .withMessage('Valid task ID is required')
];

const validateMilestoneId = [
  param('id')
    .isMongoId()
    .withMessage('Valid milestone ID is required')
];

const validateQueryParams = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('status')
    .optional()
    .isIn(['planning', 'active', 'on-hold', 'completed', 'cancelled'])
    .withMessage('Invalid status filter'),
  
  query('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Invalid priority filter'),
  
  query('type')
    .optional()
    .isString()
    .withMessage('Type must be a string'),
  
  query('project')
    .optional()
    .isString()
    .withMessage('Project must be a string')
];

// All routes are protected and customer-only
router.use(protect);
router.use(authorize('customer'));

// @route   GET /api/customer/dashboard
// @desc    Get customer dashboard statistics
// @access  Private (Customer only)
router.get('/dashboard', getCustomerDashboard);

// @route   GET /api/customer/projects
// @desc    Get customer projects
// @access  Private (Customer only)
router.get('/projects', validateQueryParams, getCustomerProjects);

// @route   GET /api/customer/projects/:id
// @desc    Get customer project details
// @access  Private (Customer only)
router.get('/projects/:id', validateProjectId, getCustomerProjectDetails);

// @route   GET /api/customer/tasks/:id
// @desc    Get customer task details
// @access  Private (Customer only)
router.get('/tasks/:id', validateTaskId, getCustomerTaskDetails);

// @route   GET /api/customer/milestones/:id
// @desc    Get customer milestone details
// @access  Private (Customer only)
router.get('/milestones/:id', validateMilestoneId, getCustomerMilestoneDetails);

// @route   GET /api/customer/files
// @desc    Get customer files
// @access  Private (Customer only)
router.get('/files', validateQueryParams, getCustomerFiles);

// @route   GET /api/customer/activity
// @desc    Get customer activity feed
// @access  Private (Customer only)
router.get('/activity', validateQueryParams, getCustomerActivity);

// @route   POST /api/customer/tasks/:taskId/files
// @desc    Upload file to task
// @access  Private (Customer only)
router.post('/tasks/:taskId/files', validateTaskId, upload.single('file'), uploadTaskFile);

// @route   DELETE /api/customer/tasks/:taskId/files/:fileId
// @desc    Delete file from task
// @access  Private (Customer only)
router.delete('/tasks/:taskId/files/:fileId', validateTaskId, deleteTaskFile);

// @route   POST /api/customer/milestones/:milestoneId/files
// @desc    Upload file to milestone
// @access  Private (Customer only)
router.post('/milestones/:milestoneId/files', validateMilestoneId, upload.single('file'), uploadMilestoneFile);

// @route   DELETE /api/customer/milestones/:milestoneId/files/:fileId
// @desc    Delete file from milestone
// @access  Private (Customer only)
router.delete('/milestones/:milestoneId/files/:fileId', validateMilestoneId, deleteMilestoneFile);

// @route   POST /api/customer/tasks/:taskId/comments
// @desc    Add comment to task
// @access  Private (Customer only)
router.post('/tasks/:taskId/comments', validateTaskId, addTaskComment);

// @route   DELETE /api/customer/tasks/:taskId/comments/:commentId
// @desc    Delete comment from task
// @access  Private (Customer only)
router.delete('/tasks/:taskId/comments/:commentId', validateTaskId, deleteTaskComment);

// @route   POST /api/customer/milestones/:milestoneId/comments
// @desc    Add comment to milestone
// @access  Private (Customer only)
router.post('/milestones/:milestoneId/comments', validateMilestoneId, addMilestoneComment);

// @route   DELETE /api/customer/milestones/:milestoneId/comments/:commentId
// @desc    Delete comment from milestone
// @access  Private (Customer only)
router.delete('/milestones/:milestoneId/comments/:commentId', validateMilestoneId, deleteMilestoneComment);

module.exports = router;
