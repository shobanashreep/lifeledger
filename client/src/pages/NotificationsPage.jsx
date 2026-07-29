import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Bell, CheckCheck, Trash2, AlertCircle, FileText, Info } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import { timeAgo } from '../utils/format';

const TYPE_ICON = { expiry: AlertCircle, reminder: Bell, document: FileText, system: Info, activity: Info };

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    notificationService
      .getAll(filter || undefined)
      .then((res) => setNotifications(res.data))
      .catch(() => toast.error('Failed to load notifications'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const handleMarkRead = async (id) => {
    await notificationService.markRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n)));
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllRead();
    toast.success('All notifications marked as read');
    load();
  };

  const handleDelete = async (id) => {
    await notificationService.remove(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: '0 0 4px' }}>Notifications</h3>
          <p className="text-muted" style={{ margin: 0 }}>Stay on top of every reminder and update.</p>
        </div>
        <button className="btn btn-secondary" onClick={handleMarkAllRead}>
          <CheckCheck size={15} /> Mark All Read
        </button>
      </div>

      <div className="flex gap-8" style={{ marginBottom: 16 }}>
        {[{ label: 'All', value: '' }, { label: 'Unread', value: 'unread' }, { label: 'Read', value: 'read' }].map((f) => (
          <button
            key={f.value}
            className={filter === f.value ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader label="Loading notifications..." />
      ) : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up." />
      ) : (
        <div className="card">
          {notifications.map((n) => {
            const Icon = TYPE_ICON[n.type] || Info;
            return (
              <div
                key={n.id}
                className="flex-between"
                style={{
                  padding: '16px 20px', borderBottom: '1px solid var(--color-border)',
                  background: n.is_read ? '#fff' : 'var(--color-primary-light)',
                }}
              >
                <div className="flex gap-12" style={{ alignItems: 'flex-start' }}>
                  <Icon size={17} color="var(--color-primary)" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{n.title}</p>
                    <p className="text-muted" style={{ margin: '2px 0 0', fontSize: 13 }}>{n.message}</p>
                    <p className="text-subtle" style={{ margin: '4px 0 0', fontSize: 11 }}>{timeAgo(n.created_at)}</p>
                  </div>
                </div>
                <div className="flex gap-8">
                  {!n.is_read && (
                    <button className="btn btn-ghost btn-sm" onClick={() => handleMarkRead(n.id)}>Mark Read</button>
                  )}
                  <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(n.id)} style={{ color: 'var(--color-danger)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
