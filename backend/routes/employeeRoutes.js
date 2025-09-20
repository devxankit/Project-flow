const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { protect, authorize } = require('../middlewares/authMiddleware');
const {
  getEmployeeDashboard,
  getEmployeeProjects,
  getEmployeeProjectDetails,
  getEmployeeTasks,
  getEmployeeTask,
  getEmployeeMilestone,
  getEmployeeTasksByMilestone,
  recalculateMilestoneProgress,
  updateTaskStatus,
  getEmployeeActivity,
  getEmployeeFiles,
  addTaskComment,
  addMilestoneComment,
  deleteTaskComment,
  deleteMilestoneComment
} = require('../controllers/employeeController');

// Validation middleware
const validateTaskStatus = [
  body('status')
    .isIn(['pending', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Status must be pending, in-progress, completed, or cancelled')
];

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

const validateTaskId = [
  param('id')
    .isMongoId()
    .withMessage('Valid task ID is required')
];

const validateTaskIdParam = [
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

const validateProjectId = [
  param('id')
    .isMongoId()
    .withMessage('Valid project ID is required')
];

// All routes are protected and require employee role
router.use(protect);
router.use(authorize('employee'));

// @route   GET /api/employee/dashboard
// @desc    Get employee dashboard data
// @access  Private (Employee only)
router.get('/dashboard', getEmployeeDashboard);

// @route   GET /api/employee/projects
// @desc    Get employee assigned projects
// @access  Private (Employee only)
router.get('/projects', validatePagination, getEmployeeProjects);

// @route   GET /api/employee/projects/:id
// @desc    Get single project details for employee
// @access  Private (Employee only)
router.get('/projects/:id', validateProjectId, getEmployeeProjectDetails);

// @route   GET /api/employee/milestones/:milestoneId/project/:projectId
// @desc    Get single milestone for employee
// @access  Private (Employee only)
router.get('/milestones/:milestoneId/project/:projectId', validateMilestoneId, getEmployeeMilestone);

// @route   POST /api/employee/milestones/:milestoneId/recalculate-progress
// @desc    Recalculate milestone progress
// @access  Private (Employee only)
router.post('/milestones/:milestoneId/recalculate-progress', recalculateMilestoneProgress);

// @route   GET /api/employee/tasks/milestone/:milestoneId/project/:projectId
// @desc    Get tasks by milestone for employee
// @access  Private (Employee only)
router.get('/tasks/milestone/:milestoneId/project/:projectId', validateMilestoneId, getEmployeeTasksByMilestone);

// @route   GET /api/employee/tasks
// @desc    Get employee assigned tasks
// @access  Private (Employee only)
router.get('/tasks', validatePagination, getEmployeeTasks);

// @route   GET /api/employee/tasks/:id
// @desc    Get single task for employee
// @access  Private (Employee only)
router.get('/tasks/:id', validateTaskId, getEmployeeTask);

// @route   PUT /api/employee/tasks/:id/status
// @desc    Update task status (Employee only)
// @access  Private (Employee only)
router.put('/tasks/:id/status', validateTaskId, validateTaskStatus, updateTaskStatus);

// @route   GET /api/employee/activity
// @desc    Get employee activity feed
// @access  Private (Employee only)
router.get('/activity', validatePagination, getEmployeeActivity);

// @route   GET /api/employee/files
// @desc    Get employee files
// @access  Private (Employee only)
router.get('/files', validatePagination, getEmployeeFiles);

// @route   POST /api/employee/tasks/:taskId/comments
// @desc    Add comment to task
// @access  Private (Employee only)
router.post('/tasks/:taskId/comments', validateTaskIdParam, validateComment, addTaskComment);

// @route   DELETE /api/employee/tasks/:taskId/comments/:commentId
// @desc    Delete comment from task
// @access  Private (Employee only)
router.delete('/tasks/:taskId/comments/:commentId', validateTaskIdParam, deleteTaskComment);

// @route   POST /api/employee/milestones/:milestoneId/comments
// @desc    Add comment to milestone
// @access  Private (Employee only)
router.post('/milestones/:milestoneId/comments', validateMilestoneId, validateComment, addMilestoneComment);

// @route   DELETE /api/employee/milestones/:milestoneId/comments/:commentId
// @desc    Delete comment from milestone
// @access  Private (Employee only)
router.delete('/milestones/:milestoneId/comments/:commentId', validateMilestoneId, deleteMilestoneComment);

module.exports = router;
