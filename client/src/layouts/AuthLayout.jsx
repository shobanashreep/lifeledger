import React from 'react';
import { Link } from 'react-router-dom';
import { BookMarked } from 'lucide-react';

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div
      className="flex-center"
      style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: 20 }}
    >
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div className="flex-center gap-8" style={{ marginBottom: 28 }}>
          <Link to="/" className="flex gap-8" style={{ alignItems: 'center' }}>
            <div className="flex-center" style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--color-primary)', color: '#fff' }}>
              <BookMarked size={18} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 19 }}>LifeLedger</span>
          </Link>
        </div>

        <div className="card card-pad">
          <h2 style={{ margin: '0 0 4px', fontSize: 22 }}>{title}</h2>
          {subtitle && <p className="text-muted" style={{ margin: '0 0 24px', fontSize: 14 }}>{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}
