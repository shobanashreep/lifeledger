import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Clock, CalendarClock, CheckCircle2 } from 'lucide-react';
import { daysRemainingLabel } from '../../utils/format';

function Row({ item }) {
  return (
    <Link
      to={`/life-items/${item.id}`}
      className="flex-between"
      style={{ padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}
    >
      <div>
        <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{item.title}</p>
        <p className="text-subtle" style={{ margin: 0, fontSize: 12 }}>{item.category_name || 'Uncategorized'}</p>
      </div>
      <span className="text-muted" style={{ fontSize: 13, fontWeight: 600 }}>
        {daysRemainingLabel(item.days_remaining)}
      </span>
    </Link>
  );
}

export default function ActionCenter({ actionCenter }) {
  if (!actionCenter) return null;

  const { immediate = [], this_week: thisWeek = [], upcoming = [], all_good: allGood } = actionCenter;

  if (allGood) {
    return (
      <div className="card card-pad flex-center" style={{ flexDirection: 'column', padding: 40 }}>
        <CheckCircle2 size={36} color="var(--color-success)" style={{ marginBottom: 10 }} />
        <h4 style={{ margin: '0 0 4px' }}>Everything Good</h4>
        <p className="text-muted" style={{ margin: 0, fontSize: 14 }}>No urgent renewals right now.</p>
      </div>
    );
  }

  return (
    <div className="card card-pad">
      {immediate.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div className="flex gap-8" style={{ alignItems: 'center', marginBottom: 8 }}>
            <AlertTriangle size={16} color="var(--color-danger)" />
            <strong style={{ fontSize: 14, color: 'var(--color-danger)' }}>Needs Immediate Attention</strong>
          </div>
          {immediate.map((i) => <Row key={i.id} item={i} />)}
        </div>
      )}
      {thisWeek.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div className="flex gap-8" style={{ alignItems: 'center', marginBottom: 8 }}>
            <Clock size={16} color="var(--color-warning)" />
            <strong style={{ fontSize: 14, color: 'var(--color-warning)' }}>Due This Week</strong>
          </div>
          {thisWeek.map((i) => <Row key={i.id} item={i} />)}
        </div>
      )}
      {upcoming.length > 0 && (
        <div>
          <div className="flex gap-8" style={{ alignItems: 'center', marginBottom: 8 }}>
            <CalendarClock size={16} color="var(--color-info)" />
            <strong style={{ fontSize: 14, color: 'var(--color-info)' }}>Upcoming</strong>
          </div>
          {upcoming.slice(0, 5).map((i) => <Row key={i.id} item={i} />)}
        </div>
      )}
    </div>
  );
}
