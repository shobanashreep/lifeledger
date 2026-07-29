import dayjs from 'dayjs';

export function formatDate(date) {
  if (!date) return '—';
  return dayjs(date).format('DD MMM YYYY');
}

export function formatCurrency(amount, currency = 'INR') {
  if (amount === null || amount === undefined || amount === '') return '—';
  const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
  const symbol = symbols[currency] || currency + ' ';
  return `${symbol}${Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

export function daysRemainingLabel(days) {
  if (days === null || days === undefined) return 'No expiry date';
  if (days < 0) return `Expired ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`;
  if (days === 0) return 'Expires today';
  return `${days} day${days === 1 ? '' : 's'} left`;
}

export function statusLabel(status) {
  const map = { active: 'Active', expiring_soon: 'Expiring Soon', expired: 'Expired', archived: 'Archived' };
  return map[status] || status;
}

export function timeAgo(date) {
  const now = dayjs();
  const then = dayjs(date);
  const minutes = now.diff(then, 'minute');
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = now.diff(then, 'hour');
  if (hours < 24) return `${hours}h ago`;
  const days = now.diff(then, 'day');
  if (days < 30) return `${days}d ago`;
  return formatDate(date);
}
