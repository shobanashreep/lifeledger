import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="empty-state">
      <Icon size={40} strokeWidth={1.5} />
      <h4 style={{ margin: '8px 0 4px', color: 'var(--color-text)' }}>{title}</h4>
      {description && <p style={{ margin: '0 0 16px', fontSize: 14 }}>{description}</p>}
      {action}
    </div>
  );
}
