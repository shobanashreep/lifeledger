const express = require('express');
const {
  getNotifications, markAsRead, markAllAsRead, deleteNotification,
} = require('../controllers/notificationController');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();
router.use(requireAuth);

router.get('/', asyncHandler(getNotifications));
router.put('/read-all', asyncHandler(markAllAsRead));
router.put('/:id/read', asyncHandler(markAsRead));
router.delete('/:id', asyncHandler(deleteNotification));

module.exports = router;
