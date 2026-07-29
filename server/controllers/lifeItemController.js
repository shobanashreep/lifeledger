const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/db');
const { logActivity } = require('../utils/activityLogger');
const { computeStatus, daysRemaining } = require('../utils/reminderCalculator');

function withComputedFields(item) {
  const status = computeStatus(item.expiry_date, item.reminder_days_before);
  return {
    ...item,
    status,
    days_remaining: daysRemaining(item.expiry_date),
  };
}

async function assertCategoryAccessible(categoryId, userId) {
  if (!categoryId) return;
  const [rows] = await pool.query(
    'SELECT id FROM categories WHERE id = ? AND (is_system = 1 OR user_id = ?)',
    [categoryId, userId]
  );
  if (rows.length === 0) {
    const error = new Error('Category not found');
    error.status = 422;
    throw error;
  }
}

/**
 * GET /api/life-items
 * Supports: search (q), category, status, sort, pagination
 */
async function getLifeItems(req, res) {
  const userId = req.user.id;
  const { q, category, status, sort = 'newest' } = req.query;
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));

  const where = ['li.user_id = ?', 'li.is_deleted = 0'];
  const params = [userId];

  if (q) {
    where.push('(li.title LIKE ? OR li.provider LIKE ?)');
    params.push(`%${q}%`, `%${q}%`);
  }
  if (category) {
    where.push('li.category_id = ?');
    params.push(category);
  }

  if (status) {
    const statusConditions = {
      active: '(li.expiry_date IS NULL OR DATEDIFF(li.expiry_date, CURDATE()) > li.reminder_days_before)',
      expiring_soon: '(li.expiry_date IS NOT NULL AND DATEDIFF(li.expiry_date, CURDATE()) BETWEEN 0 AND li.reminder_days_before)',
      expired: '(li.expiry_date IS NOT NULL AND DATEDIFF(li.expiry_date, CURDATE()) < 0)',
    };
    if (!statusConditions[status]) {
      return res.status(422).json({ success: false, message: 'Invalid status filter' });
    }
    where.push(statusConditions[status]);
  }

  let orderBy = 'li.created_at DESC';
  if (sort === 'oldest') orderBy = 'li.created_at ASC';
  if (sort === 'az') orderBy = 'li.title ASC';
  if (sort === 'expiry') orderBy = 'li.expiry_date ASC';

  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT li.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color
     FROM life_items li
     LEFT JOIN categories c ON c.id = li.category_id
     WHERE ${where.join(' AND ')}
     ORDER BY ${orderBy}
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), offset]
  );

  const items = rows.map(withComputedFields);

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM life_items li WHERE ${where.join(' AND ')}`,
    params
  );

  res.json({
    success: true,
    data: items,
    pagination: { page, limit, total },
  });
}

/**
 * GET /api/life-items/:id
 */
async function getLifeItemById(req, res) {
  const userId = req.user.id;
  const { id } = req.params;

  const [rows] = await pool.query(
    `SELECT li.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color
     FROM life_items li
     LEFT JOIN categories c ON c.id = li.category_id
     WHERE li.id = ? AND li.user_id = ? AND li.is_deleted = 0`,
    [id, userId]
  );

  if (rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Life item not found' });
  }

  const [documents] = await pool.query(
    'SELECT * FROM documents WHERE life_item_id = ? AND user_id = ? ORDER BY created_at DESC',
    [id, userId]
  );

  res.json({ success: true, data: { ...withComputedFields(rows[0]), documents } });
}

/**
 * POST /api/life-items
 */
async function createLifeItem(req, res) {
  const userId = req.user.id;
  const {
    title, categoryId, description, provider, referenceNumber,
    startDate, expiryDate, cost, currency, reminderEnabled,
    reminderDaysBefore, notes,
  } = req.body;

  const id = uuidv4();

  await assertCategoryAccessible(categoryId, userId);

  await pool.query(
    `INSERT INTO life_items
      (id, user_id, category_id, title, description, provider, reference_number,
       start_date, expiry_date, cost, currency, reminder_enabled, reminder_days_before, notes, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, userId, categoryId || null, title, description || null, provider || null,
      referenceNumber || null, startDate || null, expiryDate || null, cost || null,
      currency || 'INR', reminderEnabled === false ? 0 : 1, reminderDaysBefore ?? 7,
      notes || null, computeStatus(expiryDate, reminderDaysBefore ?? 7),
    ]
  );

  if (expiryDate && reminderEnabled !== false) {
    const dayjs = require('dayjs');
    const remindAt = dayjs(expiryDate).subtract(reminderDaysBefore ?? 7, 'day').format('YYYY-MM-DD');
    await pool.query(
      `INSERT INTO reminders (id, user_id, life_item_id, remind_at, message)
       VALUES (?, ?, ?, ?, ?)`,
      [uuidv4(), userId, id, remindAt, `${title} is expiring soon`]
    );
  }

  await logActivity({
    userId, action: 'created', entityType: 'life_item', entityId: id,
    description: `Added "${title}"`,
  });

  const [rows] = await pool.query('SELECT * FROM life_items WHERE id = ?', [id]);
  res.status(201).json({ success: true, data: withComputedFields(rows[0]) });
}

/**
 * PUT /api/life-items/:id
 */
async function updateLifeItem(req, res) {
  const userId = req.user.id;
  const { id } = req.params;

  const [existingRows] = await pool.query(
    'SELECT * FROM life_items WHERE id = ? AND user_id = ? AND is_deleted = 0',
    [id, userId]
  );
  if (existingRows.length === 0) {
    return res.status(404).json({ success: false, message: 'Life item not found' });
  }

  const existing = existingRows[0];
  const {
    title, categoryId, description, provider, referenceNumber,
    startDate, expiryDate, cost, currency, reminderEnabled,
    reminderDaysBefore, notes,
  } = req.body;

  const merged = {
    title: title ?? existing.title,
    categoryId: categoryId ?? existing.category_id,
    description: description ?? existing.description,
    provider: provider ?? existing.provider,
    referenceNumber: referenceNumber ?? existing.reference_number,
    startDate: startDate ?? existing.start_date,
    expiryDate: expiryDate ?? existing.expiry_date,
    cost: cost ?? existing.cost,
    currency: currency ?? existing.currency,
    reminderEnabled: reminderEnabled ?? Boolean(existing.reminder_enabled),
    reminderDaysBefore: reminderDaysBefore ?? existing.reminder_days_before,
    notes: notes ?? existing.notes,
  };

  await assertCategoryAccessible(merged.categoryId, userId);

  const newStatus = computeStatus(merged.expiryDate, merged.reminderDaysBefore);

  await pool.query(
    `UPDATE life_items SET
       title = ?, category_id = ?, description = ?, provider = ?, reference_number = ?,
       start_date = ?, expiry_date = ?, cost = ?, currency = ?, reminder_enabled = ?,
       reminder_days_before = ?, notes = ?, status = ?
     WHERE id = ? AND user_id = ?`,
    [
      merged.title, merged.categoryId, merged.description, merged.provider, merged.referenceNumber,
      merged.startDate, merged.expiryDate, merged.cost, merged.currency,
      merged.reminderEnabled ? 1 : 0, merged.reminderDaysBefore, merged.notes, newStatus,
      id, userId,
    ]
  );

  await pool.query('DELETE FROM reminders WHERE life_item_id = ? AND user_id = ?', [id, userId]);
  if (merged.expiryDate && merged.reminderEnabled) {
    const dayjs = require('dayjs');
    const remindAt = dayjs(merged.expiryDate).subtract(merged.reminderDaysBefore, 'day').format('YYYY-MM-DD');
    await pool.query(
      `INSERT INTO reminders (id, user_id, life_item_id, remind_at, message)
       VALUES (?, ?, ?, ?, ?)`,
      [uuidv4(), userId, id, remindAt, `${merged.title} is expiring soon`]
    );
  }

  await logActivity({
    userId, action: 'updated', entityType: 'life_item', entityId: id,
    description: `Updated "${merged.title}"`,
  });

  const [rows] = await pool.query('SELECT * FROM life_items WHERE id = ?', [id]);
  res.json({ success: true, data: withComputedFields(rows[0]) });
}

/**
 * DELETE /api/life-items/:id
 * Soft delete — keeps history for activity_logs / audit purposes.
 */
async function deleteLifeItem(req, res) {
  const userId = req.user.id;
  const { id } = req.params;

  const [rows] = await pool.query(
    'SELECT * FROM life_items WHERE id = ? AND user_id = ? AND is_deleted = 0',
    [id, userId]
  );
  if (rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Life item not found' });
  }

  await pool.query('UPDATE life_items SET is_deleted = 1 WHERE id = ? AND user_id = ?', [id, userId]);

  await logActivity({
    userId, action: 'deleted', entityType: 'life_item', entityId: id,
    description: `Deleted "${rows[0].title}"`,
  });

  res.json({ success: true, message: 'Life item deleted successfully' });
}

module.exports = {
  getLifeItems, getLifeItemById, createLifeItem, updateLifeItem, deleteLifeItem,
};
