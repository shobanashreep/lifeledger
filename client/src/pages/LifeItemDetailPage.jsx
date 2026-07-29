import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Pencil, Trash2, Upload, FileText, Download, X, Calendar, DollarSign, Hash, Building2,
} from 'lucide-react';
import { lifeItemService } from '../services/lifeItemService';
import { categoryService } from '../services/categoryService';
import { documentService } from '../services/documentService';
import LifeItemForm from '../components/lifeItems/LifeItemForm';
import StatusBadge from '../components/common/StatusBadge';
import Loader from '../components/common/Loader';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { formatDate, formatCurrency, daysRemainingLabel } from '../utils/format';

export default function LifeItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [item, setItem] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadItem = useCallback(() => {
    setLoading(true);
    lifeItemService
      .getById(id)
      .then((res) => setItem(res.data))
      .catch(() => toast.error('Life item not found'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { loadItem(); }, [loadItem]);
  useEffect(() => { categoryService.getAll().then((res) => setCategories(res.data)).catch(() => {}); }, []);

  const handleDelete = async () => {
    try {
      await lifeItemService.remove(id);
      toast.success('Life item deleted');
      navigate('/life-items');
    } catch {
      toast.error('Failed to delete life item');
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      await documentService.upload(file, id);
      toast.success('Document uploaded');
      loadItem();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownload = async (doc) => {
    try {
      const res = await documentService.download(doc.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.original_name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error('Download failed');
    }
  };

  const handleDeleteDoc = async (docId) => {
    try {
      await documentService.remove(docId);
      toast.success('Document deleted');
      loadItem();
    } catch {
      toast.error('Failed to delete document');
    }
  };

  if (loading) return <Loader label="Loading item..." />;
  if (!item) return null;

  return (
    <div>
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/life-items')} style={{ marginBottom: 16 }}>
        <ArrowLeft size={16} /> Back to Life Items
      </button>

      <div className="flex-between" style={{ marginBottom: 20 }}>
        <div>
          <div className="flex gap-12" style={{ alignItems: 'center', marginBottom: 6 }}>
            <h2 style={{ margin: 0 }}>{item.title}</h2>
            <StatusBadge status={item.status} />
          </div>
          <p className="text-muted" style={{ margin: 0 }}>{item.category_name || 'Uncategorized'}{item.provider ? ` · ${item.provider}` : ''}</p>
        </div>
        <div className="flex gap-8">
          <button className="btn btn-secondary" onClick={() => setShowEdit(true)}><Pencil size={15} /> Edit</button>
          <button className="btn btn-danger" onClick={() => setShowDelete(true)}><Trash2 size={15} /> Delete</button>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.3fr 1fr', gap: 24 }}>
        <div>
          <div className="card card-pad" style={{ marginBottom: 20 }}>
            <h4 style={{ marginTop: 0 }}>Details</h4>
            {item.description && <p className="text-muted">{item.description}</p>}

            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
              <DetailField icon={Calendar} label="Start Date" value={formatDate(item.start_date)} />
              <DetailField icon={Calendar} label="Expiry Date" value={formatDate(item.expiry_date)} />
              <DetailField icon={DollarSign} label="Cost" value={formatCurrency(item.cost, item.currency)} />
              <DetailField icon={Hash} label="Reference Number" value={item.reference_number || '—'} />
              <DetailField icon={Building2} label="Provider" value={item.provider || '—'} />
              <DetailField icon={Calendar} label="Time Remaining" value={daysRemainingLabel(item.days_remaining)} />
            </div>

            {item.notes && (
              <div style={{ marginTop: 16, padding: 14, background: 'var(--color-bg)', borderRadius: 10 }}>
                <p style={{ margin: 0, fontSize: 13 }}><strong>Notes:</strong> {item.notes}</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="card card-pad">
            <div className="flex-between" style={{ marginBottom: 14 }}>
              <h4 style={{ margin: 0 }}>Document Vault</h4>
              <button className="btn btn-secondary btn-sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload'}
              </button>
              <input ref={fileInputRef} type="file" hidden accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={handleFileSelect} />
            </div>

            {(!item.documents || item.documents.length === 0) ? (
              <p className="text-muted" style={{ fontSize: 13 }}>No documents uploaded yet.</p>
            ) : (
              item.documents.map((doc) => (
                <div key={doc.id} className="flex-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
                  <div className="flex gap-8" style={{ alignItems: 'center', minWidth: 0 }}>
                    <FileText size={16} className="text-subtle" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {doc.original_name}
                    </span>
                  </div>
                  <div className="flex gap-8">
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDownload(doc)} aria-label="Download">
                      <Download size={14} />
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDeleteDoc(doc.id)} aria-label="Delete" style={{ color: 'var(--color-danger)' }}>
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showEdit && (
        <LifeItemForm
          item={item}
          categories={categories}
          onClose={() => setShowEdit(false)}
          onSaved={() => { setShowEdit(false); loadItem(); }}
        />
      )}

      {showDelete && (
        <ConfirmDialog
          title="Delete Life Item"
          message={`Are you sure you want to delete "${item.title}"? This cannot be undone.`}
          confirmLabel="Delete"
          danger
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </div>
  );
}

function DetailField({ icon: Icon, label, value }) {
  return (
    <div className="flex gap-8" style={{ alignItems: 'flex-start' }}>
      <Icon size={15} className="text-subtle" style={{ marginTop: 2, flexShrink: 0 }} />
      <div>
        <p className="text-subtle" style={{ margin: 0, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</p>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{value}</p>
      </div>
    </div>
  );
}
