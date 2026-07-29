import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import { lifeItemService } from '../../services/lifeItemService';

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'];

const emptyForm = {
  title: '', categoryId: '', description: '', provider: '', referenceNumber: '',
  startDate: '', expiryDate: '', cost: '', currency: 'INR',
  reminderEnabled: true, reminderDaysBefore: 7, notes: '',
};

export default function LifeItemForm({ item, categories, onClose, onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setForm({
        title: item.title || '',
        categoryId: item.category_id || '',
        description: item.description || '',
        provider: item.provider || '',
        referenceNumber: item.reference_number || '',
        startDate: item.start_date || '',
        expiryDate: item.expiry_date || '',
        cost: item.cost ?? '',
        currency: item.currency || 'INR',
        reminderEnabled: Boolean(item.reminder_enabled),
        reminderDaysBefore: item.reminder_days_before ?? 7,
        notes: item.notes || '',
      });
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSaving(true);
    try {
      const payload = {
        ...form,
        cost: form.cost === '' ? null : Number(form.cost),
        startDate: form.startDate || null,
        expiryDate: form.expiryDate || null,
        reminderDaysBefore: Number(form.reminderDaysBefore),
      };
      const res = item
        ? await lifeItemService.update(item.id, payload)
        : await lifeItemService.create(payload);
      toast.success(item ? 'Life item updated' : 'Life item added');
      onSaved(res.data);
    } catch (err) {
      const res = err.response?.data;
      if (res?.errors) {
        const fieldErrors = {};
        res.errors.forEach((e2) => { fieldErrors[e2.field] = e2.message; });
        setErrors(fieldErrors);
      } else {
        toast.error(res?.message || 'Something went wrong');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={item ? 'Edit Life Item' : 'Add Life Item'} onClose={onClose} width={620}>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Title *</label>
          <input className="form-input" name="title" required value={form.title} onChange={handleChange} placeholder="e.g. Indian Passport" />
          {errors.title && <p className="form-error">{errors.title}</p>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" name="categoryId" value={form.categoryId} onChange={handleChange}>
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Provider / Issuer</label>
            <input className="form-input" name="provider" value={form.provider} onChange={handleChange} placeholder="e.g. Regional Passport Office" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-textarea" name="description" rows={2} value={form.description} onChange={handleChange} />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Start Date</label>
            <input className="form-input" type="date" name="startDate" value={form.startDate} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Expiry Date</label>
            <input className="form-input" type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange} />
            {errors.expiryDate && <p className="form-error">{errors.expiryDate}</p>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Cost</label>
            <input className="form-input" type="number" step="0.01" min="0" name="cost" value={form.cost} onChange={handleChange} />
            {errors.cost && <p className="form-error">{errors.cost}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Currency</label>
            <select className="form-select" name="currency" value={form.currency} onChange={handleChange}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Reference Number</label>
          <input className="form-input" name="referenceNumber" value={form.referenceNumber} onChange={handleChange} placeholder="Policy / document number" />
        </div>

        <div className="form-row">
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 22 }}>
            <input type="checkbox" id="reminderEnabled" name="reminderEnabled" checked={form.reminderEnabled} onChange={handleChange} />
            <label htmlFor="reminderEnabled" className="form-label" style={{ margin: 0 }}>Enable reminder</label>
          </div>
          <div className="form-group">
            <label className="form-label">Remind me (days before expiry)</label>
            <input
              className="form-input" type="number" min="1" max="90" name="reminderDaysBefore"
              value={form.reminderDaysBefore} onChange={handleChange} disabled={!form.reminderEnabled}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea className="form-textarea" name="notes" rows={2} value={form.notes} onChange={handleChange} />
        </div>

        <div className="flex gap-12" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : item ? 'Save Changes' : 'Add Item'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
