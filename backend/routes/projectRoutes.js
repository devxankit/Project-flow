const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  getProjectStats,
  getUsersForProject,
  addTaskComment,
  addMilestoneComment,
  deleteTaskComment,
  deleteMilestoneComment
} = require('../controllers/projectController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { body, param, query } = require('express-validator');

// Validation middleware
const validateProject = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ max: 200 })
    .withMessage('Project name cannot exceed 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Project description cannot exceed 2000 characters'),
  
  body('customer')
    .isMongoId()
    .withMessage('Valid customer ID is required'),
  
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Priority must be low, normal, high, or urgent'),
  
  body('dueDate')
    .isISO8601()
    .withMessage('Valid due date is required')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Due date must be in the future');
      }
      return true;
    }),
  
  body('assignedTeam')
    .optional()
    .isArray()
    .withMessage('Assigned team must be an array'),
  
  body('assignedTeam.*')
    .optional()
    .isMongoId()
    .withMessage('Each team member must have a valid ID'),
  
  body('status')
    .optional()
    .isIn(['planning', 'active', 'on-hold', 'completed', 'cancelled'])
    .withMessage('Status must be planning, active, on-hold, completed, or cancelled'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Each tag cannot exceed 50 characters')
];

const validateProjectId = [
  param('id')
    .isMongoId()
    .withMessage('Valid project ID is required')
];

const validateTaskId = [
  param('taskId')
    .isMongoId()
    .withMessage('Valid task ID is required')
];

const validateMilestoneId = [
  param('milestoneId')
    .isMongoId()
    .withMessage('Valid milestone ID is required')
];

const validateComment = [
  body('comment')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters')
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
  
  query('customer')
    .optional()
    .isMongoId()
    .withMessage('Invalid customer ID'),
  
  query('projectManager')
    .optional()
    .isMongoId()
    .withMessage('Invalid project manager ID'),
  
  query('sortBy')
    .optional()
    .isIn(['name', 'createdAt', 'dueDate', 'status', 'priority', 'progress'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

// All routes are protected
router.use(protect);

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private (PM only)
router.post(
  '/',
  authorize('pm'),
  validateProject,
  createProject
);

// @route   GET /api/projects
// @desc    Get all projects (filtered by user role)
// @access  Private
router.get(
  '/',
  validateQueryParams,
  getProjects
);

// @route   GET /api/projects/stats
// @desc    Get project statistics
// @access  Private
router.get(
  '/stats',
  getProjectStats
);

// @route   GET /api/projects/users
// @desc    Get users for project assignment
// @access  Private (PM only)
router.get(
  '/users',
  authorize('pm'),
  getUsersForProject
);

// @route   GET /api/projects/:id
// @desc    Get single project
// @access  Private
router.get(
  '/:id',
  validateProjectId,
  getProject
);

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private (PM only)
router.put(
  '/:id',
  authorize('pm'),
  validateProjectId,
  validateProject,
  updateProject
);

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private (PM only)
router.delete(
  '/:id',
  authorize('pm'),
  validateProjectId,
  deleteProject
);

// @route   POST /api/projects/tasks/:taskId/comments
// @desc    Add comment to task
// @access  Private (PM only)
router.post('/tasks/:taskId/comments', authorize('pm'), validateTaskId, validateComment, addTaskComment);

// @route   DELETE /api/projects/tasks/:taskId/comments/:commentId
// @desc    Delete comment from task
// @access  Private (PM only)
router.delete('/tasks/:taskId/comments/:commentId', authorize('pm'), validateTaskId, deleteTaskComment);

// @route   POST /api/projects/milestones/:milestoneId/comments
// @desc    Add comment to milestone
// @access  Private (PM only)
router.post('/milestones/:milestoneId/comments', authorize('pm'), validateMilestoneId, validateComment, addMilestoneComment);

// @route   DELETE /api/projects/milestones/:milestoneId/comments/:commentId
// @desc    Delete comment from milestone
// @access  Private (PM only)
router.delete('/milestones/:milestoneId/comments/:commentId', authorize('pm'), validateMilestoneId, deleteMilestoneComment);

module.exports = router;
