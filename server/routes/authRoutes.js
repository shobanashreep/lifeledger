const express = require('express');
const { body } = require('express-validator');
const { register, login, me, logout } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.post(
  '/register',
  [
    body('fullName').trim().isLength({ min: 2, max: 120 }).withMessage('Full name must be 2-120 characters'),
    body('email').isEmail().normalizeEmail().withMessage('A valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validate,
  asyncHandler(register)
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('A valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  asyncHandler(login)
);

router.get('/me', requireAuth, asyncHandler(me));
router.post('/logout', requireAuth, asyncHandler(logout));

module.exports = router;
