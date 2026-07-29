import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, Lock, Bell, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import ConfirmDialog from '../components/common/ConfirmDialog';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'preferences', label: 'Notification Preferences', icon: Bell },
  { id: 'danger', label: 'Danger Zone', icon: Trash2 },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div>
      <h3 style={{ margin: '0 0 20px' }}>Settings</h3>

      <div className="grid" style={{ gridTemplateColumns: '220px 1fr', gap: 24 }}>
        <div className="card card-pad" style={{ height: 'fit-content' }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex gap-8 btn-block"
              style={{
                alignItems: 'center', padding: '10px 12px', borderRadius: 10, marginBottom: 4,
                background: activeTab === tab.id ? 'var(--color-primary-light)' : 'transparent',
                color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
                border: 'none', fontWeight: 600, fontSize: 14, textAlign: 'left',
              }}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        <div className="card card-pad">
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'security' && <SecurityTab />}
          {activeTab === 'preferences' && <PreferencesTab />}
          {activeTab === 'danger' && <DangerZoneTab />}
        </div>
      </div>
    </div>
  );
}

function ProfileTab() {
  const { user, updateUserLocal } = useAuth();
  const [form, setForm] = useState({ fullName: user?.full_name || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await userService.updateProfile(form);
      updateUserLocal(res.data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h4 style={{ marginTop: 0 }}>Profile Information</h4>
      <div className="form-group">
        <label className="form-label">Full Name</label>
        <input className="form-input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
      </div>
      <div className="form-group">
        <label className="form-label">Email Address</label>
        <input className="form-input" value={user?.email || ''} disabled style={{ background: '#f8fafc' }} />
        <p className="form-hint">Email address cannot be changed</p>
      </div>
      <div className="form-group">
        <label className="form-label">Phone Number</label>
        <input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
      </div>
      <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
    </form>
  );
}

function SecurityTab() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setSaving(true);
    try {
      await userService.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('Password updated successfully');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h4 style={{ marginTop: 0 }}>Change Password</h4>
      <div className="form-group">
        <label className="form-label">Current Password</label>
        <input className="form-input" type="password" required value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">New Password</label>
          <input className="form-input" type="password" required minLength={8} value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Confirm New Password</label>
          <input className="form-input" type="password" required value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
        </div>
      </div>
      <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Updating...' : 'Update Password'}</button>
    </form>
  );
}

function PreferencesTab() {
  const { user, updateUserLocal } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(Boolean(user?.email_notifications ?? true));
  const [reminderDaysBefore, setReminderDaysBefore] = useState(user?.reminder_days_before ?? 7);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await userService.updatePreferences({ emailNotifications, reminderDaysBefore: Number(reminderDaysBefore) });
      updateUserLocal(res.data.user);
      toast.success('Preferences saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h4 style={{ marginTop: 0 }}>Notification Preferences</h4>
      <div className="flex gap-8" style={{ alignItems: 'center', marginBottom: 18 }}>
        <input type="checkbox" id="emailNotif" checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)} />
        <label htmlFor="emailNotif" className="form-label" style={{ margin: 0 }}>Email me about upcoming expiries</label>
      </div>
      <div className="form-group" style={{ maxWidth: 260 }}>
        <label className="form-label">Default reminder window (days before expiry)</label>
        <input className="form-input" type="number" min={1} max={90} value={reminderDaysBefore} onChange={(e) => setReminderDaysBefore(e.target.value)} />
      </div>
      <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Preferences'}</button>
    </form>
  );
}

function DangerZoneTab() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      await userService.deleteAccount(password);
      toast.success('Account deleted');
      await logout();
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account');
      setShowConfirm(false);
    }
  };

  return (
    <div>
      <h4 style={{ marginTop: 0, color: 'var(--color-danger)' }}>Delete Account</h4>
      <p className="text-muted" style={{ fontSize: 14 }}>
        This permanently deletes your account and every life item, document, and record associated with it.
        This action cannot be undone.
      </p>
      <div className="form-group" style={{ maxWidth: 320 }}>
        <label className="form-label">Confirm your password</label>
        <input className="form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <button className="btn btn-danger" disabled={!password} onClick={() => setShowConfirm(true)}>
        <Trash2 size={15} /> Delete My Account
      </button>

      {showConfirm && (
        <ConfirmDialog
          title="Delete Account Permanently"
          message="This is irreversible. All of your data will be permanently erased. Are you absolutely sure?"
          confirmLabel="Yes, Delete Everything"
          danger
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
