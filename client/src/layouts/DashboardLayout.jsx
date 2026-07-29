import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';

const TITLES = {
  '/dashboard': 'Dashboard',
  '/life-items': 'Life Items',
  '/documents': 'Document Vault',
  '/calendar': 'Calendar',
  '/notifications': 'Notifications',
  '/settings': 'Settings',
};

export default function DashboardLayout() {
  const { pathname } = useLocation();
  const title = Object.entries(TITLES).find(([path]) => pathname.startsWith(path))?.[1] || 'LifeLedger';

  return (
    <div className="flex" style={{ minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0 }}>
        <Topbar title={title} />
        <main style={{ padding: 32 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
