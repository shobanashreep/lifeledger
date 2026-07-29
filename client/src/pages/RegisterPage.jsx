import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from '../layouts/AuthLayout';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (form.password !== form.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      await register(form.fullName, form.email, form.password);
      toast.success('Account created! Welcome to LifeLedger.');
      navigate('/dashboard');
    } catch (err) {
      const res = err.response?.data;
      if (res?.errors) {
        const fieldErrors = {};
        res.errors.forEach((e2) => { fieldErrors[e2.field] = e2.message; });
        setErrors(fieldErrors);
      } else {
        toast.error(res?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Start organizing your life admin in minutes">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            className="form-input" type="text" name="fullName" required
            placeholder="Jane Doe" value={form.fullName} onChange={handleChange}
          />
          {errors.fullName && <p className="form-error">{errors.fullName}</p>}
        </div>

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            className="form-input" type="email" name="email" required
            placeholder="you@example.com" value={form.email} onChange={handleChange}
          />
          {errors.email && <p className="form-error">{errors.email}</p>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input" type="password" name="password" required
              placeholder="At least 8 characters" value={form.password} onChange={handleChange}
            />
            {errors.password && <p className="form-error">{errors.password}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              className="form-input" type="password" name="confirmPassword" required
              placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange}
            />
            {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
          </div>
        </div>

        <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
          {loading ? <span className="spinner" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.4)' }} /> : 'Create Account'}
        </button>
      </form>

      <p className="text-muted" style={{ textAlign: 'center', marginTop: 20, fontSize: 14 }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Log in</Link>
      </p>
    </AuthLayout>
  );
}
