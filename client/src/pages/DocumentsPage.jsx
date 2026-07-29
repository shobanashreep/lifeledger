import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FileText, Download, Trash2, FileStack } from 'lucide-react';
import { documentService } from '../services/documentService';
import { lifeItemService } from '../services/lifeItemService';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { formatDate } from '../utils/format';

function formatBytes(bytes) {
  if (!bytes) return '0 KB';
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [itemsById, setItemsById] = useState({});
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([documentService.getAll(), lifeItemService.getAll({ limit: 500 })])
      .then(([docsRes, itemsRes]) => {
        setDocuments(docsRes.data);
        const map = {};
        itemsRes.data.forEach((i) => { map[i.id] = i.title; });
        setItemsById(map);
      })
      .catch(() => toast.error('Failed to load documents'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

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

  const handleDelete = async () => {
    try {
      await documentService.remove(toDelete.id);
      toast.success('Document deleted');
      setToDelete(null);
      load();
    } catch {
      toast.error('Failed to delete document');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 4px' }}>Document Vault</h3>
        <p className="text-muted" style={{ margin: 0 }}>Every file you've uploaded across all life items.</p>
      </div>

      {loading ? (
        <Loader label="Loading documents..." />
      ) : documents.length === 0 ? (
        <EmptyState
          icon={FileStack}
          title="No documents yet"
          description="Upload documents from any life item's detail page to see them here."
        />
      ) : (
        <div className="card">
          <div style={{ padding: '10px 20px', borderBottom: '1px solid var(--color-border)' }} className="text-subtle">
            <div className="flex-between" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
              <span style={{ flex: 2 }}>File</span>
              <span style={{ flex: 1 }}>Linked Item</span>
              <span style={{ flex: 1 }}>Size</span>
              <span style={{ flex: 1 }}>Uploaded</span>
              <span style={{ width: 80 }}></span>
            </div>
          </div>
          {documents.map((doc) => (
            <div key={doc.id} className="flex-between" style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border)' }}>
              <div className="flex gap-8" style={{ flex: 2, alignItems: 'center', minWidth: 0 }}>
                <FileText size={16} className="text-subtle" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.original_name}</span>
              </div>
              <Link to={`/life-items/${doc.life_item_id}`} style={{ flex: 1, fontSize: 13, color: 'var(--color-primary)', fontWeight: 600 }}>
                {itemsById[doc.life_item_id] || 'View item'}
              </Link>
              <span className="text-muted" style={{ flex: 1, fontSize: 13 }}>{formatBytes(doc.file_size)}</span>
              <span className="text-muted" style={{ flex: 1, fontSize: 13 }}>{formatDate(doc.created_at)}</span>
              <div className="flex gap-8" style={{ width: 80, justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => handleDownload(doc)} aria-label="Download">
                  <Download size={14} />
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setToDelete(doc)} aria-label="Delete" style={{ color: 'var(--color-danger)' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Delete Document"
          message={`Delete "${toDelete.original_name}"? This cannot be undone.`}
          confirmLabel="Delete"
          danger
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
