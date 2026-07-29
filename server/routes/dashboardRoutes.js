const express = require('express');
const { getDashboardStats } = require('../controllers/dashboardController');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();
router.use(requireAuth);

router.get('/stats', asyncHandler(getDashboardStats));

module.exports = router;
