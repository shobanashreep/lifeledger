import React from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { daysRemainingLabel, formatCurrency } from '../../utils/format';

export default function LifeItemCard({ item }) {
  const Icon = Icons[toPascalCase(item.category_icon)] || Icons.Folder;

  return (
    <Link to={`/life-items/${item.id}`} className="card card-pad" style={{ display: 'block' }}>
      <div className="flex-between" style={{ marginBottom: 12 }}>
        <div
          className="flex-center"
          style={{
            width: 40, height: 40, borderRadius: 10,
            background: `${item.category_color || '#6366f1'}1a`, color: item.category_color || '#6366f1',
          }}
        >
          <Icon size={19} />
        </div>
        <StatusBadge status={item.status} />
      </div>
      <h4 style={{ margin: '0 0 4px', fontSize: 15 }}>{item.title}</h4>
      <p className="text-subtle" style={{ margin: '0 0 12px', fontSize: 12 }}>
        {item.category_name || 'Uncategorized'}{item.provider ? ` · ${item.provider}` : ''}
      </p>
      <div className="flex-between" style={{ fontSize: 13 }}>
        <span className="text-muted">{daysRemainingLabel(item.days_remaining)}</span>
        {item.cost && <span style={{ fontWeight: 600 }}>{formatCurrency(item.cost, item.currency)}</span>}
      </div>
    </Link>
  );
}

function toPascalCase(str) {
  if (!str) return '';
  return str.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('');
}
