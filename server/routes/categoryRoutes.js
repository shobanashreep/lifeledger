const express = require('express');
const { body } = require('express-validator');
const { getCategories, createCategory, deleteCategory } = require('../controllers/categoryController');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { validate } = require('../middleware/validate');

const router = express.Router();
router.use(requireAuth);

router.get('/', asyncHandler(getCategories));
router.post(
  '/',
  [body('name').trim().isLength({ min: 1, max: 80 }).withMessage('Category name is required')],
  validate,
  asyncHandler(createCategory)
);
router.delete('/:id', asyncHandler(deleteCategory));

module.exports = router;
