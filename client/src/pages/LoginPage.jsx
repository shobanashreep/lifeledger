import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate(location.state?.from || '/dashboard');
    } catch (err) {
      const res = err.response?.data;
      if (res?.errors) {
        const fieldErrors = {};
        res.errors.forEach((e2) => { fieldErrors[e2.field] = e2.message; });
        setErrors(fieldErrors);
      } else {
        toast.error(res?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to access your LifeLedger dashboard">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            className="form-input" type="email" name="email" required
            placeholder="you@example.com" value={form.email} onChange={handleChange}
          />
          {errors.email && <p className="form-error">{errors.email}</p>}
        </div>

        <div className="form-group">
          <div className="flex-between">
            <label className="form-label">Password</label>
            <Link to="/forgot-password" style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600 }}>
              Forgot password?
            </Link>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              className="form-input" type={showPassword ? 'text' : 'password'} name="password" required
              placeholder="••••••••" value={form.password} onChange={handleChange}
            />
            <button
              type="button" onClick={() => setShowPassword((v) => !v)}
              style={{ position: 'absolute', right: 12, top: 10, background: 'none', border: 'none', color: 'var(--color-text-subtle)' }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="form-error">{errors.password}</p>}
        </div>

        <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
          {loading ? <span className="spinner" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.4)' }} /> : 'Log In'}
        </button>
      </form>

      <p className="text-muted" style={{ textAlign: 'center', marginTop: 20, fontSize: 14 }}>
        Don't have an account? <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign up</Link>
      </p>
    </AuthLayout>
  );
}
