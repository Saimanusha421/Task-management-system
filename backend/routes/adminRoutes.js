const express = require('express');
const { body } = require('express-validator');
const {
  getEmployees,
  createEmployee,
  setEmployeeStatus,
  assignTask,
  updateTask,
  deleteTask,
  getAllTasks,
  getDashboardStats,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require a valid token AND the 'admin' role
router.use(protect, authorize('admin'));

// Employees
router.get('/employees', getEmployees);
router.post(
  '/employees',
  [
    body('name').trim().notEmpty().withMessage('Employee name is required'),
    body('email').isEmail().withMessage('Please provide a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  createEmployee
);
router.put('/employees/:id/status', setEmployeeStatus);

// Tasks
router.get('/tasks', getAllTasks);
router.post(
  '/tasks',
  [
    body('title').trim().notEmpty().withMessage('Task title is required'),
    body('description').trim().notEmpty().withMessage('Task description is required'),
    body('assignedTo').notEmpty().withMessage('An employee must be assigned to this task'),
    body('priority').optional().isIn(['High', 'Medium', 'Low']).withMessage('Priority must be High, Medium or Low'),
  ],
  assignTask
);
router.put('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

module.exports = router;
