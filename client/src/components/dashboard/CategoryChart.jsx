import React from 'react';

const PALETTE = ['#4f46e5', '#16a34a', '#d97706', '#dc2626', '#0891b2', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function CategoryChart({ data }) {
  const entries = Object.entries(data || {});
  const total = entries.reduce((sum, [, count]) => sum + count, 0);

  if (entries.length === 0) {
    return <p className="text-muted" style={{ fontSize: 14 }}>No items yet to break down by category.</p>;
  }

  return (
    <div>
      {entries.map(([name, count], idx) => {
        const pct = Math.round((count / total) * 100);
        return (
          <div key={name} style={{ marginBottom: 12 }}>
            <div className="flex-between" style={{ marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{name}</span>
              <span className="text-muted" style={{ fontSize: 12 }}>{count} ({pct}%)</span>
            </div>
            <div style={{ height: 8, borderRadius: 6, background: '#f1f5f9', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: PALETTE[idx % PALETTE.length], borderRadius: 6 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
