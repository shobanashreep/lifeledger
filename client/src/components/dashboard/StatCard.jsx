import React from 'react';

export default function StatCard({ icon: Icon, label, value, tone = 'primary' }) {
  return (
    <div className="card card-pad">
      <div className="flex-between">
        <div>
          <p className="text-muted" style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 600 }}>{label}</p>
          <h3 style={{ margin: 0, fontSize: 28 }}>{value}</h3>
        </div>
        <div
          className="flex-center"
          style={{
            width: 44, height: 44, borderRadius: 12,
            background: `var(--color-${tone}-light)`, color: `var(--color-${tone})`,
          }}
        >
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}
