import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FolderClosed, FileStack, CalendarDays, Bell, Settings, BookMarked,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/life-items', label: 'Life Items', icon: FolderClosed },
  { to: '/documents', label: 'Documents', icon: FileStack },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <aside
      style={{
        width: 240, flexShrink: 0, background: '#fff', borderRight: '1px solid var(--color-border)',
        height: '100vh', position: 'sticky', top: 0, display: 'flex', flexDirection: 'column',
      }}
    >
      <div className="flex gap-8" style={{ padding: '22px 24px', alignItems: 'center' }}>
        <div
          className="flex-center"
          style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--color-primary)', color: '#fff' }}
        >
          <BookMarked size={18} />
        </div>
        <span style={{ fontWeight: 800, fontSize: 18 }}>LifeLedger</span>
      </div>

      <nav style={{ flex: 1, padding: '8px 12px' }}>
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex gap-12${isActive ? ' nav-active' : ''}`
            }
            style={({ isActive }) => ({
              alignItems: 'center',
              padding: '10px 14px',
              borderRadius: 10,
              marginBottom: 4,
              fontSize: 14,
              fontWeight: 600,
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
              background: isActive ? 'var(--color-primary-light)' : 'transparent',
            })}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: 16, borderTop: '1px solid var(--color-border)' }}>
        <p className="text-subtle" style={{ fontSize: 12, margin: 0 }}>LifeLedger v1.0</p>
      </div>
    </aside>
  );
}
