const express = require('express');
const router = express.Router();
const {
  createSubtask,
  getSubtasksByTask,
  getSubtask,
  updateSubtask,
  deleteSubtask,
  getSubtaskStats
} = require('../controllers/subtaskController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/enhancedFileUpload');

// Apply authentication to all routes
router.use(protect);

// @route   POST /api/subtasks
// @desc    Create a new subtask
// @access  Private (PM only)
router.post('/', 
  authorize('pm'),
  upload.array('attachments', 10),
  createSubtask
);

// @route   GET /api/subtasks/stats
// @desc    Get subtask statistics
// @access  Private
router.get('/stats', getSubtaskStats);

// @route   GET /api/subtasks/task/:taskId/customer/:customerId
// @desc    Get subtasks for a task
// @access  Private
router.get('/task/:taskId/customer/:customerId', getSubtasksByTask);

// @route   GET /api/subtasks/:subtaskId/customer/:customerId
// @desc    Get single subtask
// @access  Private
router.get('/:subtaskId/customer/:customerId', getSubtask);

// @route   PUT /api/subtasks/:subtaskId/customer/:customerId
// @desc    Update subtask
// @access  Private (PM only)
router.put('/:subtaskId/customer/:customerId', 
  authorize('pm'),
  upload.array('attachments', 10),
  updateSubtask
);

// @route   DELETE /api/subtasks/:subtaskId/customer/:customerId
// @desc    Delete subtask
// @access  Private (PM only)
router.delete('/:subtaskId/customer/:customerId', 
  authorize('pm'),
  deleteSubtask
);

module.exports = router;
