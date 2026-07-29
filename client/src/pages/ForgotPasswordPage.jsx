import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // NOTE: UI-only per spec — wire this up to a real
    // POST /api/auth/forgot-password endpoint when one exists.
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <AuthLayout title="Check your email">
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <MailCheck size={40} color="var(--color-primary)" style={{ marginBottom: 12 }} />
          <p className="text-muted">
            If an account exists for <strong>{email}</strong>, we've sent a link to reset your password.
          </p>
          <Link to="/login" className="btn btn-secondary btn-block" style={{ marginTop: 16 }}>
            Back to Log In
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset your password" subtitle="Enter your email and we'll send you a reset link">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            className="form-input" type="email" required placeholder="you@example.com"
            value={email} onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button className="btn btn-primary btn-block" type="submit">Send Reset Link</button>
      </form>
      <p className="text-muted" style={{ textAlign: 'center', marginTop: 20, fontSize: 14 }}>
        <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Back to Log In</Link>
      </p>
    </AuthLayout>
  );
}
