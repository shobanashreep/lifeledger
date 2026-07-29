const express = require('express');
const { body } = require('express-validator');
const {
  updateProfile, changePassword, updatePreferences, deleteAccount,
} = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { validate } = require('../middleware/validate');

const router = express.Router();
router.use(requireAuth);

router.put('/profile', asyncHandler(updateProfile));
router.put(
  '/password',
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  ],
  validate,
  asyncHandler(changePassword)
);
router.put('/preferences', asyncHandler(updatePreferences));
router.delete('/account', [body('password').notEmpty()], validate, asyncHandler(deleteAccount));

module.exports = router;
