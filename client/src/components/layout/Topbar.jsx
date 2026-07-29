import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, ChevronDown, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notificationService';

export default function Topbar({ title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const menuRef = useRef(null);

  useEffect(() => {
    notificationService.getAll('unread').then((res) => setUnread(res.unreadCount || 0)).catch(() => {});
  }, []);

  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const initials = (user?.full_name || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header
      className="flex-between"
      style={{ padding: '18px 32px', background: '#fff', borderBottom: '1px solid var(--color-border)' }}
    >
      <h2 style={{ margin: 0, fontSize: 20 }}>{title}</h2>

      <div className="flex gap-16" style={{ alignItems: 'center' }}>
        <button
          className="btn btn-ghost btn-sm"
          style={{ position: 'relative' }}
          onClick={() => navigate('/notifications')}
          aria-label="Notifications"
        >
          <Bell size={19} />
          {unread > 0 && (
            <span
              style={{
                position: 'absolute', top: 2, right: 2, width: 8, height: 8,
                borderRadius: '50%', background: 'var(--color-danger)',
              }}
            />
          )}
        </button>

        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            className="flex gap-8"
            style={{ alignItems: 'center', background: 'none', border: 'none', padding: 4 }}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <div
              className="flex-center"
              style={{
                width: 34, height: 34, borderRadius: '50%', background: 'var(--color-primary-light)',
                color: 'var(--color-primary)', fontWeight: 700, fontSize: 13,
              }}
            >
              {initials}
            </div>
            <ChevronDown size={16} className="text-muted" />
          </button>

          {menuOpen && (
            <div
              className="card"
              style={{ position: 'absolute', right: 0, top: 44, width: 200, padding: 8, zIndex: 20 }}
            >
              <div style={{ padding: '8px 12px' }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{user?.full_name}</p>
                <p className="text-subtle" style={{ margin: 0, fontSize: 12 }}>{user?.email}</p>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '8px 0' }} />
              <button
                className="btn btn-ghost btn-sm btn-block"
                style={{ justifyContent: 'flex-start' }}
                onClick={() => { setMenuOpen(false); navigate('/settings'); }}
              >
                <User size={15} /> Profile Settings
              </button>
              <button
                className="btn btn-ghost btn-sm btn-block"
                style={{ justifyContent: 'flex-start', color: 'var(--color-danger)' }}
                onClick={async () => { await logout(); navigate('/login'); }}
              >
                <LogOut size={15} /> Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
