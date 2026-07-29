const { pool } = require('../config/db');

/**
 * GET /api/activity
 * Paginated activity log feed for the "Recent Activity" / audit trail views.
 */
async function getActivity(req, res) {
  const userId = req.user.id;
  const { page = 1, limit = 25 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const [rows] = await pool.query(
    'SELECT * FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [userId, Number(limit), offset]
  );

  const [[{ total }]] = await pool.query(
    'SELECT COUNT(*) AS total FROM activity_logs WHERE user_id = ?',
    [userId]
  );

  res.json({ success: true, data: rows, pagination: { page: Number(page), limit: Number(limit), total } });
}

module.exports = { getActivity };
