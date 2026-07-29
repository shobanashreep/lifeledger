const { pool } = require('../config/db');

/**
 * GET /api/notifications
 * Optional ?status=unread|read filter
 */
async function getNotifications(req, res) {
  const userId = req.user.id;
  const { status } = req.query;

  const where = ['user_id = ?'];
  const params = [userId];
  if (status === 'unread') {
    where.push('is_read = 0');
  } else if (status === 'read') {
    where.push('is_read = 1');
  }

  const [rows] = await pool.query(
    `SELECT * FROM notifications WHERE ${where.join(' AND ')} ORDER BY created_at DESC`,
    params
  );

  const [[{ unreadCount }]] = await pool.query(
    'SELECT COUNT(*) AS unreadCount FROM notifications WHERE user_id = ? AND is_read = 0',
    [userId]
  );

  res.json({ success: true, data: rows, unreadCount });
}

/**
 * PUT /api/notifications/:id/read
 */
async function markAsRead(req, res) {
  const userId = req.user.id;
  const { id } = req.params;

  const [result] = await pool.query(
    'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
    [id, userId]
  );
  if (result.affectedRows === 0) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }
  res.json({ success: true, message: 'Notification marked as read' });
}

/**
 * PUT /api/notifications/read-all
 */
async function markAllAsRead(req, res) {
  const userId = req.user.id;
  await pool.query('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0', [userId]);
  res.json({ success: true, message: 'All notifications marked as read' });
}

/**
 * DELETE /api/notifications/:id
 */
async function deleteNotification(req, res) {
  const userId = req.user.id;
  const { id } = req.params;

  const [result] = await pool.query('DELETE FROM notifications WHERE id = ? AND user_id = ?', [id, userId]);
  if (result.affectedRows === 0) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }
  res.json({ success: true, message: 'Notification deleted' });
}

module.exports = { getNotifications, markAsRead, markAllAsRead, deleteNotification };
