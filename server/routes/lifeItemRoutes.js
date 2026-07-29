const express = require('express');
const { body } = require('express-validator');
const {
  getLifeItems, getLifeItemById, createLifeItem, updateLifeItem, deleteLifeItem,
} = require('../controllers/lifeItemController');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { validate } = require('../middleware/validate');

const router = express.Router();
router.use(requireAuth);

const itemValidation = [
  body('title').trim().isLength({ min: 1, max: 150 }).withMessage('Title is required (max 150 chars)'),
  body('expiryDate').optional({ nullable: true }).isISO8601().withMessage('expiryDate must be a valid date'),
  body('startDate').optional({ nullable: true }).isISO8601().withMessage('startDate must be a valid date'),
  body('cost').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('cost must be a positive number'),
  body('reminderEnabled').optional().isBoolean().withMessage('reminderEnabled must be a boolean'),
  body('reminderDaysBefore').optional().isInt({ min: 1, max: 365 }).withMessage('reminderDaysBefore must be 1-365'),
  body('currency').optional().isLength({ min: 3, max: 10 }).withMessage('currency must be 3-10 characters'),
];

router.get('/', asyncHandler(getLifeItems));
router.get('/:id', asyncHandler(getLifeItemById));
router.post('/', itemValidation, validate, asyncHandler(createLifeItem));
router.put('/:id', itemValidation, validate, asyncHandler(updateLifeItem));
router.delete('/:id', asyncHandler(deleteLifeItem));

module.exports = router;
