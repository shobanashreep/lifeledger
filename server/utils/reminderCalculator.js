const dayjs = require('dayjs');

/**
 * Derives a live status for a life item based on its expiry_date.
 * - expired: expiry date has passed
 * - expiring_soon: expiry within the item's reminder window (default 7 days)
 * - active: everything else / no expiry date set
 */
function computeStatus(expiryDate, reminderDaysBefore = 7) {
  if (!expiryDate) return 'active';

  const today = dayjs().startOf('day');
  const expiry = dayjs(expiryDate).startOf('day');
  const diff = expiry.diff(today, 'day');

  if (diff < 0) return 'expired';
  if (diff <= reminderDaysBefore) return 'expiring_soon';
  return 'active';
}

/**
 * Returns whole days remaining until expiry (negative if already expired).
 */
function daysRemaining(expiryDate) {
  if (!expiryDate) return null;
  const today = dayjs().startOf('day');
  const expiry = dayjs(expiryDate).startOf('day');
  return expiry.diff(today, 'day');
}

/**
 * Buckets an item into the Action Center categories used on the dashboard.
 */
function actionBucket(expiryDate, reminderDaysBefore = 7) {
  const days = daysRemaining(expiryDate);
  if (days === null) return 'good';
  if (days < 0) return 'immediate';       // already expired
  if (days <= 2) return 'immediate';      // needs immediate attention
  if (days <= 7) return 'this_week';      // due this week
  if (days <= reminderDaysBefore + 23) return 'upcoming'; // ~30 days
  return 'good';
}

module.exports = { computeStatus, daysRemaining, actionBucket };
