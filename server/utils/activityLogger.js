const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/db');

/**
 * Records a row in activity_logs for the user's timeline / recent activity feed.
 */
async function logActivity({ userId, action, entityType, entityId, description }) {
  try {
    await pool.query(
      `INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [uuidv4(), userId, action, entityType, entityId || null, description]
    );
  } catch (err) {
    // Activity logging must never break the primary request flow.
    console.error('Failed to log activity:', err.message);
  }
}

module.exports = { logActivity };
