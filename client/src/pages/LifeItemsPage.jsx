import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Search, FolderClosed } from 'lucide-react';
import { lifeItemService } from '../services/lifeItemService';
import { categoryService } from '../services/categoryService';
import { useDebounce } from '../hooks/useDebounce';
import LifeItemCard from '../components/lifeItems/LifeItemCard';
import LifeItemForm from '../components/lifeItems/LifeItemForm';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';

export default function LifeItemsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sort, setSort] = useState('newest');
  const [showForm, setShowForm] = useState(searchParams.get('new') === '1');

  const debouncedQuery = useDebounce(query, 350);

  const loadItems = useCallback(() => {
    setLoading(true);
    lifeItemService
      .getAll({ q: debouncedQuery || undefined, category: categoryFilter || undefined, status: statusFilter || undefined, sort })
      .then((res) => setItems(res.data))
      .catch(() => toast.error('Failed to load life items'))
      .finally(() => setLoading(false));
  }, [debouncedQuery, categoryFilter, statusFilter, sort]);

  useEffect(() => { loadItems(); }, [loadItems]);

  useEffect(() => {
    categoryService.getAll().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  const handleFormClose = () => {
    setShowForm(false);
    if (searchParams.get('new')) setSearchParams({});
  };

  const handleSaved = () => {
    handleFormClose();
    loadItems();
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: '0 0 4px' }}>Life Items</h3>
          <p className="text-muted" style={{ margin: 0 }}>All your tracked records in one place.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Add Life Item
        </button>
      </div>

      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <div className="flex gap-12" style={{ flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--color-text-subtle)' }} />
            <input
              className="form-input" style={{ paddingLeft: 36 }}
              placeholder="Search by title or provider..." value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select className="form-select" style={{ flex: '0 1 180px' }} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="form-select" style={{ flex: '0 1 160px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="expiring_soon">Expiring Soon</option>
            <option value="expired">Expired</option>
          </select>
          <select className="form-select" style={{ flex: '0 1 160px' }} value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="az">A → Z</option>
            <option value="expiry">Expiry Date</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Loader label="Loading your life items..." />
      ) : items.length === 0 ? (
        <EmptyState
          icon={FolderClosed}
          title="No life items yet"
          description="Add your first record — a passport, policy, or subscription — to get started."
          action={<button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={16} /> Add Life Item</button>}
        />
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {items.map((item) => <LifeItemCard key={item.id} item={item} />)}
        </div>
      )}

      {showForm && (
        <LifeItemForm categories={categories} onClose={handleFormClose} onSaved={handleSaved} />
      )}
    </div>
  );
}
