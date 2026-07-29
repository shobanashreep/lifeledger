import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column', gap: 12 }}>
      <h1 style={{ fontSize: 64, margin: 0, color: 'var(--color-primary)' }}>404</h1>
      <p className="text-muted">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary">Back to Home</Link>
    </div>
  );
}
