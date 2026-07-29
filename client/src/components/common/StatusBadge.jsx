import React from 'react';
import { statusLabel } from '../../utils/format';

export default function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{statusLabel(status)}</span>;
}
