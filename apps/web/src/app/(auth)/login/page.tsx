'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('nimal.perera@waypoint.lk');
  const [password, setPassword] = useState('Waypoint2026!');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (selectedEmail: string) => {
    setEmail(selectedEmail);
    setPassword('Waypoint2026!');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, remember }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      router.push(data.redirectUrl || '/dispatcher');
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to connect to authentication server';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wp-login-page">
      <section className="wp-login-form-wrap">
        <div className="wp-login-form-inner">
          <a href="/login" className="wp-login-logo">
            <span className="wp-logo-mark" aria-hidden="true">
              <img src="/assets/logo-mark.svg" alt="" width={32} height={32} />
            </span>
            <div className="wp-login-logo-text">
              <span className="font-laro wp-login-wordmark">Waypoint</span>
              <span className="wp-login-badge">Logistics</span>
            </div>
          </a>

          <div className="wp-login-card">
            <h2>Sign In</h2>
            <p className="wp-login-subtitle">Welcome back! Please enter your details</p>

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(220, 38, 38, 0.1)', color: '#DC2626', fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: 16, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleRoleSelect('dispatcher@waypoint.test')}
                style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.1)', background: email.includes('dispatcher') ? '#377A8B' : '#FFF', color: email.includes('dispatcher') ? '#FFF' : '#333', cursor: 'pointer' }}
              >
                Dispatcher
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('loader@waypoint.test')}
                style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.1)', background: email.includes('loader') ? '#377A8B' : '#FFF', color: email.includes('loader') ? '#FFF' : '#333', cursor: 'pointer' }}
              >
                Loader
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('driver@waypoint.test')}
                style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.1)', background: email.includes('driver') ? '#377A8B' : '#FFF', color: email.includes('driver') ? '#FFF' : '#333', cursor: 'pointer' }}
              >
                Driver
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('store@waypoint.test')}
                style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.1)', background: email.includes('store') ? '#377A8B' : '#FFF', color: email.includes('store') ? '#FFF' : '#333', cursor: 'pointer' }}
              >
                Store
              </button>
            </div>

            <form className="wp-login-form" onSubmit={handleSubmit}>
              <div className="wp-login-field">
                <label className="wp-label" htmlFor="email">Email</label>
                <input
                  className="wp-input"
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>

              <div className="wp-login-field">
                <label className="wp-label" htmlFor="password">Password</label>
                <div className="wp-login-password-wrap">
                  <input
                    className="wp-input"
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="wp-login-password-toggle"
                    id="password-toggle"
                    aria-label="Show password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="wp-login-options">
                <label className="wp-login-remember">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <span>Remember for 30 Days</span>
                </label>
                <a className="wp-login-forgot" href="#forgot">Forgot password</a>
              </div>

              <button
                type="submit"
                className="wp-btn wp-btn-primary wp-login-submit"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <p className="wp-login-footer">
              Need assistance? <a href="mailto:support@waypoint.test">Contact enterprise operations</a>
            </p>
          </div>
        </div>
      </section>

      <section className="wp-login-brand" aria-hidden="false">
        <div className="wp-login-brand-inner">
          <h1>Welcome back! Please sign in to your <span className="wp-login-highlight">Waypoint</span> account</h1>
          <p>Intelligent enterprise logistics for Fresh, Style, Tech, and chilled distribution across Sri Lanka.</p>

          <div className="wp-login-visuals">
            <div className="wp-login-chart-card">
              <div className="wp-login-chart-head">
                <strong>Delivery Report</strong>
                <div className="wp-login-chart-legend">
                  <span><i className="wp-login-legend-dot is-on-time"></i>On time</span>
                  <span><i className="wp-login-legend-dot is-deferred"></i>Deferred</span>
                </div>
              </div>
              <div className="wp-login-chart-body">
                <svg className="wp-login-bar-chart" viewBox="0 0 520 180" role="img" aria-label="Monthly delivery report chart">
                  <g className="wp-login-bars">
                    <g transform="translate(0,0)">
                      <rect x="8" y="90" width="18" height="70" rx="3" fill="#377A8B"/>
                      <rect x="30" y="105" width="18" height="55" rx="3" fill="#D7E0E2"/>
                    </g>
                    <g transform="translate(52,0)">
                      <rect x="8" y="75" width="18" height="85" rx="3" fill="#377A8B"/>
                      <rect x="30" y="95" width="18" height="65" rx="3" fill="#D7E0E2"/>
                    </g>
                    <g transform="translate(104,0)">
                      <rect x="8" y="82" width="18" height="78" rx="3" fill="#377A8B"/>
                      <rect x="30" y="100" width="18" height="60" rx="3" fill="#D7E0E2"/>
                    </g>
                    <g transform="translate(156,0)">
                      <rect x="8" y="68" width="18" height="92" rx="3" fill="#377A8B"/>
                      <rect x="30" y="88" width="18" height="72" rx="3" fill="#D7E0E2"/>
                    </g>
                    <g transform="translate(208,0)">
                      <rect x="8" y="58" width="18" height="102" rx="3" fill="#377A8B"/>
                      <rect x="30" y="78" width="18" height="82" rx="3" fill="#D7E0E2"/>
                    </g>
                    <g transform="translate(260,0)">
                      <rect x="8" y="72" width="18" height="88" rx="3" fill="#377A8B"/>
                      <rect x="30" y="92" width="18" height="68" rx="3" fill="#D7E0E2"/>
                    </g>
                    <g transform="translate(312,0)">
                      <rect x="8" y="48" width="18" height="112" rx="3" fill="#377A8B"/>
                      <rect x="30" y="68" width="18" height="92" rx="3" fill="#D7E0E2"/>
                    </g>
                    <g transform="translate(364,0)">
                      <rect x="8" y="38" width="18" height="122" rx="3" fill="#377A8B"/>
                      <rect x="30" y="58" width="18" height="102" rx="3" fill="#D7E0E2"/>
                    </g>
                    <g transform="translate(416,0)">
                      <rect x="8" y="52" width="18" height="108" rx="3" fill="#377A8B"/>
                      <rect x="30" y="72" width="18" height="88" rx="3" fill="#D7E0E2"/>
                    </g>
                    <g transform="translate(468,0)">
                      <rect x="8" y="30" width="18" height="130" rx="3" fill="#377A8B"/>
                      <rect x="30" y="50" width="18" height="110" rx="3" fill="#D7E0E2"/>
                    </g>
                  </g>
                </svg>
              </div>
            </div>

            <div className="wp-login-stats-grid">
              <div className="wp-login-stat-card">
                <span className="wp-login-stat-label">On Time Dispatch</span>
                <span className="wp-login-stat-value">98.4%</span>
                <span className="wp-login-stat-meta">Across 2 depots</span>
              </div>
              <div className="wp-login-stat-card">
                <span className="wp-login-stat-label">Fleet Capacity</span>
                <span className="wp-login-stat-value">60 Units</span>
                <span className="wp-login-stat-meta">16 Chilled Reefer</span>
              </div>
              <div className="wp-login-stat-card">
                <span className="wp-login-stat-label">Daily Outlets</span>
                <span className="wp-login-stat-value">120 Active</span>
                <span className="wp-login-stat-meta">Island wide network</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
