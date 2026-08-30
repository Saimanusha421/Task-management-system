const express = require('express');
const { body } = require('express-validator');
const { login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email address'),
    body('password').notEmpty().withMessage('Password is required'),
    body('role').optional().isIn(['admin', 'employee']).withMessage('Role must be admin or employee'),
  ],
  login
);

router.get('/me', protect, getMe);

module.exports = router;
