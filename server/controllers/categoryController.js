const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/db');

/**
 * GET /api/categories
 * Returns system defaults + the user's own custom categories.
 */
async function getCategories(req, res) {
  const userId = req.user.id;
  const [rows] = await pool.query(
    `SELECT * FROM categories WHERE is_system = 1 OR user_id = ? ORDER BY is_system DESC, name ASC`,
    [userId]
  );

  // Older seed runs could create duplicate system categories because MySQL
  // permits multiple NULL values in a composite unique key. Keep every custom
  // category, but expose each system category only once to the UI.
  const seenSystemNames = new Set();
  const categories = rows.filter((category) => {
    if (!category.is_system) return true;
    const key = category.name.trim().toLocaleLowerCase();
    if (seenSystemNames.has(key)) return false;
    seenSystemNames.add(key);
    return true;
  });

  res.json({ success: true, data: categories });
}

/**
 * POST /api/categories
 */
async function createCategory(req, res) {
  const userId = req.user.id;
  const { name, icon, color } = req.body;

  const id = uuidv4();
  await pool.query(
    `INSERT INTO categories (id, user_id, name, icon, color, is_system) VALUES (?, ?, ?, ?, ?, 0)`,
    [id, userId, name, icon || 'folder', color || '#6366f1']
  );

  const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
  res.status(201).json({ success: true, data: rows[0] });
}

/**
 * DELETE /api/categories/:id
 * Only custom (non-system) categories owned by the user can be removed.
 */
async function deleteCategory(req, res) {
  const userId = req.user.id;
  const { id } = req.params;

  const [rows] = await pool.query(
    'SELECT * FROM categories WHERE id = ? AND user_id = ? AND is_system = 0',
    [id, userId]
  );
  if (rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Category not found or cannot be deleted' });
  }

  await pool.query('DELETE FROM categories WHERE id = ? AND user_id = ?', [id, userId]);
  res.json({ success: true, message: 'Category deleted successfully' });
}

module.exports = { getCategories, createCategory, deleteCategory };
