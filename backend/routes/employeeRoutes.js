const express = require('express');
const { getMyTasks, updateTaskStatus } = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All employee routes require a valid token AND the 'employee' role
router.use(protect, authorize('employee'));

router.get('/tasks', getMyTasks);
router.put('/tasks/:id/status', updateTaskStatus);

module.exports = router;
