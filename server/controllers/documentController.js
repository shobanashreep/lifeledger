const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/db');
const { logActivity } = require('../utils/activityLogger');
const { absoluteUploadDir } = require('../middleware/upload');

/**
 * GET /api/documents
 * Optional ?lifeItemId= filter to scope to one record's document vault.
 */
async function getDocuments(req, res) {
  const userId = req.user.id;
  const { lifeItemId } = req.query;

  const where = ['user_id = ?'];
  const params = [userId];
  if (lifeItemId) {
    where.push('life_item_id = ?');
    params.push(lifeItemId);
  }

  const [rows] = await pool.query(
    `SELECT * FROM documents WHERE ${where.join(' AND ')} ORDER BY created_at DESC`,
    params
  );
  res.json({ success: true, data: rows });
}

/**
 * POST /api/documents
 * multipart/form-data: file + lifeItemId
 */
async function uploadDocument(req, res) {
  const userId = req.user.id;
  const { lifeItemId } = req.body;

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  if (!lifeItemId) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ success: false, message: 'lifeItemId is required' });
  }

  const [itemRows] = await pool.query(
    'SELECT id, title FROM life_items WHERE id = ? AND user_id = ? AND is_deleted = 0',
    [lifeItemId, userId]
  );
  if (itemRows.length === 0) {
    fs.unlinkSync(req.file.path);
    return res.status(404).json({ success: false, message: 'Life item not found' });
  }

  const id = uuidv4();
  await pool.query(
    `INSERT INTO documents (id, user_id, life_item_id, file_name, original_name, file_path, file_type, file_size)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, userId, lifeItemId, req.file.filename, req.file.originalname,
      req.file.path, req.file.mimetype, req.file.size,
    ]
  );

  await logActivity({
    userId, action: 'uploaded_document', entityType: 'document', entityId: id,
    description: `Uploaded "${req.file.originalname}" to "${itemRows[0].title}"`,
  });

  const [rows] = await pool.query('SELECT * FROM documents WHERE id = ?', [id]);
  res.status(201).json({ success: true, data: rows[0] });
}

/**
 * GET /api/documents/:id/download
 */
async function downloadDocument(req, res) {
  const userId = req.user.id;
  const { id } = req.params;

  const [rows] = await pool.query('SELECT * FROM documents WHERE id = ? AND user_id = ?', [id, userId]);
  if (rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Document not found' });
  }

  const doc = rows[0];
  const safePath = path.join(absoluteUploadDir, doc.file_name);
  if (!fs.existsSync(safePath)) {
    return res.status(404).json({ success: false, message: 'File no longer exists on server' });
  }

  res.download(safePath, doc.original_name);
}

/**
 * DELETE /api/documents/:id
 */
async function deleteDocument(req, res) {
  const userId = req.user.id;
  const { id } = req.params;

  const [rows] = await pool.query('SELECT * FROM documents WHERE id = ? AND user_id = ?', [id, userId]);
  if (rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Document not found' });
  }

  const doc = rows[0];
  await pool.query('DELETE FROM documents WHERE id = ? AND user_id = ?', [id, userId]);

  const filePath = path.join(absoluteUploadDir, doc.file_name);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  await logActivity({
    userId, action: 'deleted_document', entityType: 'document', entityId: id,
    description: `Deleted document "${doc.original_name}"`,
  });

  res.json({ success: true, message: 'Document deleted successfully' });
}

module.exports = { getDocuments, uploadDocument, downloadDocument, deleteDocument };
