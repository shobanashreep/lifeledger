const bcrypt = require('bcrypt');
const { pool } = require('../config/db');
const { logActivity } = require('../utils/activityLogger');

function sanitizeUser(user) {
  const { password_hash, ...safe } = user;
  return safe;
}

/**
 * PUT /api/users/profile
 */
async function updateProfile(req, res) {
  const userId = req.user.id;
  const { fullName, phone } = req.body;

  await pool.query(
    'UPDATE users SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone) WHERE id = ?',
    [fullName, phone, userId]
  );

  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
  res.json({ success: true, data: { user: sanitizeUser(rows[0]) } });
}

/**
 * PUT /api/users/password
 */
async function changePassword(req, res) {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
  const user = rows[0];

  const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Current password is incorrect' });
  }

  const newHash = await bcrypt.hash(newPassword, 12);
  await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);

  await logActivity({
    userId, action: 'updated', entityType: 'user', entityId: userId,
    description: 'Changed account password',
  });

  res.json({ success: true, message: 'Password updated successfully' });
}

/**
 * PUT /api/users/preferences
 */
async function updatePreferences(req, res) {
  const userId = req.user.id;
  const { emailNotifications, reminderDaysBefore } = req.body;

  await pool.query(
    `UPDATE users SET
       email_notifications = COALESCE(?, email_notifications),
       reminder_days_before = COALESCE(?, reminder_days_before)
     WHERE id = ?`,
    [
      typeof emailNotifications === 'boolean' ? (emailNotifications ? 1 : 0) : null,
      reminderDaysBefore ?? null,
      userId,
    ]
  );

  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
  res.json({ success: true, data: { user: sanitizeUser(rows[0]) } });
}

/**
 * DELETE /api/users/account
 * Cascades to life_items, documents, reminders, notifications, activity_logs via FK constraints.
 */
async function deleteAccount(req, res) {
  const userId = req.user.id;
  const { password } = req.body;

  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
  const user = rows[0];

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Password is incorrect' });
  }

  await pool.query('DELETE FROM users WHERE id = ?', [userId]);
  res.json({ success: true, message: 'Account deleted permanently' });
}

module.exports = { updateProfile, changePassword, updatePreferences, deleteAccount };
