const express = require('express');
const { getActivity } = require('../controllers/activityController');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();
router.use(requireAuth);

router.get('/', asyncHandler(getActivity));

module.exports = router;
