import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { lifeItemService } from '../services/lifeItemService';
import Loader from '../components/common/Loader';

export default function CalendarPage() {
  const [month, setMonth] = useState(dayjs());
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    lifeItemService.getAll({ limit: 500 }).then((res) => setItems(res.data)).finally(() => setLoading(false));
  }, []);

  const itemsByDate = useMemo(() => {
    const map = {};
    items.forEach((item) => {
      if (!item.expiry_date) return;
      const key = dayjs(item.expiry_date).format('YYYY-MM-DD');
      if (!map[key]) map[key] = [];
      map[key].push(item);
    });
    return map;
  }, [items]);

  const startOfMonth = month.startOf('month');
  const endOfMonth = month.endOf('month');
  const startDay = startOfMonth.day(); // 0 = Sunday
  const daysInMonth = endOfMonth.date();

  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(startOfMonth.date(d));

  if (loading) return <Loader label="Loading calendar..." />;

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: '0 0 4px' }}>Calendar</h3>
          <p className="text-muted" style={{ margin: 0 }}>Expiry and renewal dates at a glance.</p>
        </div>
        <div className="flex gap-12" style={{ alignItems: 'center' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setMonth(month.subtract(1, 'month'))}>
            <ChevronLeft size={15} />
          </button>
          <strong style={{ minWidth: 140, textAlign: 'center' }}>{month.format('MMMM YYYY')}</strong>
          <button className="btn btn-secondary btn-sm" onClick={() => setMonth(month.add(1, 'month'))}>
            <ChevronRight size={15} />
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setMonth(dayjs())}>Today</button>
        </div>
      </div>

      <div className="card card-pad">
        <div className="grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 8 }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="text-subtle" style={{ textAlign: 'center', fontSize: 12, fontWeight: 700 }}>{d}</div>
          ))}
        </div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
          {cells.map((date, idx) => {
            if (!date) return <div key={idx} />;
            const key = date.format('YYYY-MM-DD');
            const dayItems = itemsByDate[key] || [];
            const isToday = date.isSame(dayjs(), 'day');
            return (
              <div
                key={key}
                style={{
                  minHeight: 90, borderRadius: 10, padding: 8,
                  border: isToday ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  background: dayItems.length > 0 ? 'var(--color-warning-light)' : '#fff',
                }}
              >
                <span style={{ fontSize: 12, fontWeight: isToday ? 800 : 600, color: isToday ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                  {date.date()}
                </span>
                {dayItems.slice(0, 2).map((item) => (
                  <Link
                    key={item.id}
                    to={`/life-items/${item.id}`}
                    style={{
                      display: 'block', marginTop: 4, fontSize: 11, fontWeight: 600,
                      color: 'var(--color-warning)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}
                  >
                    • {item.title}
                  </Link>
                ))}
                {dayItems.length > 2 && (
                  <span className="text-subtle" style={{ fontSize: 10 }}>+{dayItems.length - 2} more</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
