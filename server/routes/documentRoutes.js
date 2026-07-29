const express = require('express');
const {
  getDocuments, uploadDocument, downloadDocument, deleteDocument,
} = require('../controllers/documentController');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { upload } = require('../middleware/upload');

const router = express.Router();
router.use(requireAuth);

router.get('/', asyncHandler(getDocuments));
router.post('/', upload.single('file'), asyncHandler(uploadDocument));
router.get('/:id/download', asyncHandler(downloadDocument));
router.delete('/:id', asyncHandler(deleteDocument));

module.exports = router;
