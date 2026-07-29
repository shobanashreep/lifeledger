import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FolderClosed, ShieldAlert, Clock3, IndianRupee, History } from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/dashboard/StatCard';
import ActionCenter from '../components/dashboard/ActionCenter';
import CategoryChart from '../components/dashboard/CategoryChart';
import Loader from '../components/common/Loader';
import { formatCurrency, daysRemainingLabel, timeAgo } from '../utils/format';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService
      .getStats()
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading your dashboard..." />;
  if (!stats) return null;

  const { counts, totalTrackedCost, actionCenter, upcomingExpiries, categoryBreakdown, recentActivity } = stats;

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 24 }}>
        <div>
          <h3 style={{ margin: '0 0 4px' }}>Welcome back, {user?.full_name?.split(' ')[0]} 👋</h3>
          <p className="text-muted" style={{ margin: 0 }}>Here's what's happening across your life records.</p>
        </div>
        <Link to="/life-items?new=1" className="btn btn-primary">
          <Plus size={16} /> Add Life Item
        </Link>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard icon={FolderClosed} label="Total Records" value={counts.total} tone="primary" />
        <StatCard icon={Clock3} label="Expiring Soon" value={counts.expiring_soon} tone="warning" />
        <StatCard icon={ShieldAlert} label="Expired" value={counts.expired} tone="danger" />
        <StatCard icon={IndianRupee} label="Total Tracked Value" value={formatCurrency(totalTrackedCost)} tone="success" />
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
        <div>
          <h4 style={{ margin: '0 0 12px' }}>Action Center</h4>
          <ActionCenter actionCenter={actionCenter} />

          <h4 style={{ margin: '24px 0 12px' }}>Upcoming Expiries</h4>
          <div className="card">
            {upcomingExpiries.length === 0 ? (
              <div className="empty-state">
                <p style={{ margin: 0 }}>Nothing expiring soon.</p>
              </div>
            ) : (
              upcomingExpiries.map((item) => (
                <Link
                  key={item.id}
                  to={`/life-items/${item.id}`}
                  className="flex-between"
                  style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border)' }}
                >
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{item.title}</p>
                    <p className="text-subtle" style={{ margin: 0, fontSize: 12 }}>{item.category_name || 'Uncategorized'}</p>
                  </div>
                  <span className={`badge badge-${item.status}`}>{daysRemainingLabel(item.days_remaining)}</span>
                </Link>
              ))
            )}
          </div>
        </div>

        <div>
          <h4 style={{ margin: '0 0 12px' }}>Category Breakdown</h4>
          <div className="card card-pad" style={{ marginBottom: 24 }}>
            <CategoryChart data={categoryBreakdown} />
          </div>

          <h4 style={{ margin: '0 0 12px' }}>Recent Activity</h4>
          <div className="card card-pad">
            {recentActivity.length === 0 ? (
              <p className="text-muted" style={{ fontSize: 14, margin: 0 }}>No activity yet.</p>
            ) : (
              recentActivity.map((a) => (
                <div key={a.id} className="flex gap-12" style={{ marginBottom: 14, alignItems: 'flex-start' }}>
                  <History size={15} className="text-subtle" style={{ marginTop: 3, flexShrink: 0 }} />
                  <div>
                    <p style={{ margin: 0, fontSize: 13 }}>{a.description}</p>
                    <p className="text-subtle" style={{ margin: 0, fontSize: 11 }}>{timeAgo(a.created_at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
