const { pool } = require('../config/db');
const { computeStatus, daysRemaining, actionBucket } = require('../utils/reminderCalculator');

/**
 * GET /api/dashboard/stats
 * Returns summary counters, action-center buckets, upcoming expiries,
 * and recent activity — everything the dashboard needs in one call.
 */
async function getDashboardStats(req, res) {
  const userId = req.user.id;

  const [items] = await pool.query(
    `SELECT li.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color
     FROM life_items li
     LEFT JOIN categories c ON c.id = li.category_id
     WHERE li.user_id = ? AND li.is_deleted = 0`,
    [userId]
  );

  const enriched = items.map((item) => ({
    ...item,
    status: computeStatus(item.expiry_date, item.reminder_days_before),
    days_remaining: daysRemaining(item.expiry_date),
    bucket: actionBucket(item.expiry_date, item.reminder_days_before),
  }));

  const counts = {
    total: enriched.length,
    active: enriched.filter((i) => i.status === 'active').length,
    expiring_soon: enriched.filter((i) => i.status === 'expiring_soon').length,
    expired: enriched.filter((i) => i.status === 'expired').length,
  };

  const actionCenter = {
    immediate: enriched.filter((i) => i.bucket === 'immediate'),
    this_week: enriched.filter((i) => i.bucket === 'this_week'),
    upcoming: enriched.filter((i) => i.bucket === 'upcoming'),
    all_good: enriched.length > 0 &&
      enriched.filter((i) => i.bucket === 'immediate' || i.bucket === 'this_week').length === 0,
  };

  const upcomingExpiries = enriched
    .filter((i) => i.days_remaining !== null && i.days_remaining >= 0)
    .sort((a, b) => a.days_remaining - b.days_remaining)
    .slice(0, 8);

  const categoryBreakdown = {};
  enriched.forEach((i) => {
    const key = i.category_name || 'Uncategorized';
    categoryBreakdown[key] = (categoryBreakdown[key] || 0) + 1;
  });

  const [recentActivity] = await pool.query(
    `SELECT * FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 10`,
    [userId]
  );

  const [[{ totalCost }]] = await pool.query(
    `SELECT COALESCE(SUM(cost), 0) AS totalCost FROM life_items WHERE user_id = ? AND is_deleted = 0`,
    [userId]
  );

  res.json({
    success: true,
    data: {
      counts,
      totalTrackedCost: totalCost,
      actionCenter,
      upcomingExpiries,
      categoryBreakdown,
      recentActivity,
    },
  });
}

module.exports = { getDashboardStats };
