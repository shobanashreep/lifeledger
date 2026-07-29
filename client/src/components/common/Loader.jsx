import React from 'react';

export default function Loader({ label = 'Loading...' }) {
  return (
    <div className="flex-center gap-8" style={{ padding: 48, flexDirection: 'column' }}>
      <div className="spinner" />
      <span className="text-muted" style={{ fontSize: 14 }}>{label}</span>
    </div>
  );
}
