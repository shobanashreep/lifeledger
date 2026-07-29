import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookMarked, ShieldCheck, BellRing, FolderClosed, FileStack, CalendarClock,
  CheckCircle2, ArrowRight,
} from 'lucide-react';

const FEATURES = [
  { icon: FolderClosed, title: 'One Place for Everything', desc: 'Passport, insurance, warranties, subscriptions — every important record lives in a single organized vault.' },
  { icon: BellRing, title: 'Never Miss a Deadline', desc: 'Automatic reminders before anything expires, so renewals never sneak up on you.' },
  { icon: FileStack, title: 'Secure Document Vault', desc: 'Upload and store the actual documents alongside each record for instant access.' },
  { icon: CalendarClock, title: 'Visual Calendar', desc: 'See every expiry and renewal laid out on a calendar so you can plan ahead.' },
  { icon: ShieldCheck, title: 'Private & Secure', desc: 'Bank-grade password hashing and token-based authentication keep your data yours alone.' },
  { icon: BookMarked, title: 'Built for Real Life', desc: 'Designed around how people actually manage life admin — not a generic spreadsheet.' },
];

const BENEFITS = [
  'Track unlimited life records across custom categories',
  'Get reminders days before something expires',
  'Upload supporting documents for every record',
  'See a live dashboard of what needs attention',
  'Search, filter, and sort your entire vault instantly',
];

export default function LandingPage() {
  return (
    <div>
      {/* Nav */}
      <header className="flex-between" style={{ padding: '20px 0' }}>
        <div className="container flex-between">
          <div className="flex gap-8" style={{ alignItems: 'center' }}>
            <div className="flex-center" style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--color-primary)', color: '#fff' }}>
              <BookMarked size={18} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 19 }}>LifeLedger</span>
          </div>
          <div className="flex gap-12">
            <Link to="/login" className="btn btn-ghost">Log In</Link>
            <Link to="/register" className="btn btn-primary">Get Started Free</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ padding: '80px 0 60px' }}>
        <div className="container" style={{ maxWidth: 780, textAlign: 'center' }}>
          <span className="badge badge-active" style={{ marginBottom: 20 }}>Your Personal Life Admin Assistant</span>
          <h1 style={{ fontSize: 48, lineHeight: 1.15, margin: '0 0 20px', fontWeight: 800 }}>
            Organize Your Life.<br />Track What Matters.<br />
            <span style={{ color: 'var(--color-primary)' }}>Never Miss a Deadline.</span>
          </h1>
          <p className="text-muted" style={{ fontSize: 18, margin: '0 0 32px' }}>
            LifeLedger keeps every passport, policy, warranty, and subscription in one secure place —
            with smart reminders so renewals never catch you off guard.
          </p>
          <div className="flex gap-12" style={{ justifyContent: 'center' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: 15 }}>
              Start for Free <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: 15 }}>
              I already have an account
            </Link>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section style={{ padding: '40px 0 80px', background: '#fff' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: 30, marginBottom: 12 }}>Everything you need to stay on top of life</h2>
          <p className="text-muted" style={{ textAlign: 'center', marginBottom: 48 }}>
            Built as a real personal-admin platform, not another checklist app.
          </p>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {FEATURES.map((f) => (
              <div key={f.title} className="card card-pad">
                <div
                  className="flex-center"
                  style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--color-primary-light)', color: 'var(--color-primary)', marginBottom: 16 }}
                >
                  <f.icon size={22} />
                </div>
                <h3 style={{ margin: '0 0 8px', fontSize: 17 }}>{f.title}</h3>
                <p className="text-muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section style={{ padding: '80px 0' }}>
        <div className="container grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: 30, marginBottom: 20 }}>A dashboard that actually tells you what to do next</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {BENEFITS.map((b) => (
                <li key={b} className="flex gap-12" style={{ marginBottom: 16, alignItems: 'flex-start' }}>
                  <CheckCircle2 size={20} color="var(--color-success)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card card-pad" style={{ background: 'var(--color-primary-light)', border: 'none' }}>
            <div className="flex-between" style={{ marginBottom: 16 }}>
              <strong>Action Center</strong>
              <span className="badge badge-expiring_soon">3 Due This Week</span>
            </div>
            <div className="card card-pad" style={{ marginBottom: 12 }}>
              <div className="flex-between">
                <span style={{ fontWeight: 600, fontSize: 14 }}>Vehicle Insurance</span>
                <span className="badge badge-expired">Expired</span>
              </div>
            </div>
            <div className="card card-pad" style={{ marginBottom: 12 }}>
              <div className="flex-between">
                <span style={{ fontWeight: 600, fontSize: 14 }}>Passport Renewal</span>
                <span className="badge badge-expiring_soon">6 days left</span>
              </div>
            </div>
            <div className="card card-pad">
              <div className="flex-between">
                <span style={{ fontWeight: 600, fontSize: 14 }}>Gym Membership</span>
                <span className="badge badge-active">Active</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '70px 0', background: 'var(--color-primary)', color: '#fff', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: 600 }}>
          <h2 style={{ fontSize: 30, margin: '0 0 12px' }}>Start organizing your life today</h2>
          <p style={{ opacity: 0.9, marginBottom: 28 }}>Free to get started. No credit card required.</p>
          <Link
            to="/register"
            className="btn"
            style={{ background: '#fff', color: 'var(--color-primary)', padding: '14px 32px', fontSize: 15 }}
          >
            Create Your Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '32px 0', background: '#0f172a', color: '#94a3b8' }}>
        <div className="container flex-between">
          <span style={{ fontSize: 14 }}>© {new Date().getFullYear()} LifeLedger. All rights reserved.</span>
          <div className="flex gap-16" style={{ fontSize: 14 }}>
            <span>Privacy</span>
            <span>Terms</span>
            <span>Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
