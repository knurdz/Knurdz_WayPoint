'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, ArrowRight } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('nimal.perera@waypoint.lk');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push(`/reset-sent?email=${encodeURIComponent(email)}`);
    }, 400);
  };

  return (
    <div className="wp-login-page">
      <section className="wp-login-form-wrap">
        <div className="wp-login-form-inner">
          <Link href="/login" className="wp-login-logo">
            <span className="wp-logo-mark" aria-hidden="true">
              <img src="/assets/logo-mark.svg" alt="" width={32} height={32} />
            </span>
            <div className="wp-login-logo-text">
              <span className="font-laro wp-login-wordmark">Waypoint</span>
              <span className="wp-login-badge">Logistics</span>
            </div>
          </Link>

          <div className="wp-login-card">
            <h2>Forgot password</h2>
            <p className="wp-login-subtitle">
              Enter the email linked to your account and we will dispatch a secure reset link.
            </p>

            <form className="wp-login-form" onSubmit={handleSubmit}>
              <div className="wp-login-field">
                <label className="wp-label" htmlFor="email">
                  Email
                </label>
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

              <button
                type="submit"
                className="wp-btn wp-btn-primary wp-login-submit"
                disabled={loading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <span>Send reset link</span>
                <ArrowRight size={16} />
              </button>
            </form>

            <p className="wp-login-footer">
              <Link className="wp-login-back-link" href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <ArrowLeft size={16} /> Back to sign in
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className="wp-login-brand">
        <div className="wp-login-brand-inner">
          <h1>
            Reset your <span className="wp-login-highlight">Waypoint</span> account password
          </h1>
          <p>
            We will email you a single use verification link so you can choose a new password and return to your route dispatch console.
          </p>

          <div className="wp-login-visuals">
            <div className="wp-login-chart-card">
              <div className="wp-login-chart-head">
                <strong>Delivery Report</strong>
                <div className="wp-login-chart-legend">
                  <span>
                    <i className="wp-login-legend-dot is-on-time"></i>On time
                  </span>
                  <span>
                    <i className="wp-login-legend-dot is-deferred"></i>Deferred
                  </span>
                </div>
              </div>
              <div className="wp-login-chart-body">
                <svg className="wp-login-bar-chart" viewBox="0 0 520 180" role="img" aria-label="Monthly delivery report chart">
                  <g className="wp-login-bars">
                    <g transform="translate(0,0)"><rect x="8" y="90" width="18" height="70" rx="3" fill="#377A8B" /><rect x="30" y="105" width="18" height="55" rx="3" fill="#D7E0E2" /></g>
                    <g transform="translate(52,0)"><rect x="8" y="75" width="18" height="85" rx="3" fill="#377A8B" /><rect x="30" y="95" width="18" height="65" rx="3" fill="#D7E0E2" /></g>
                    <g transform="translate(104,0)"><rect x="8" y="82" width="18" height="78" rx="3" fill="#377A8B" /><rect x="30" y="100" width="18" height="60" rx="3" fill="#D7E0E2" /></g>
                    <g transform="translate(156,0)"><rect x="8" y="68" width="18" height="92" rx="3" fill="#377A8B" /><rect x="30" y="88" width="18" height="72" rx="3" fill="#D7E0E2" /></g>
                    <g transform="translate(208,0)"><rect x="8" y="58" width="18" height="102" rx="3" fill="#377A8B" /><rect x="30" y="78" width="18" height="82" rx="3" fill="#D7E0E2" /></g>
                    <g transform="translate(260,0)"><rect x="8" y="72" width="18" height="88" rx="3" fill="#377A8B" /><rect x="30" y="92" width="18" height="68" rx="3" fill="#D7E0E2" /></g>
                    <g transform="translate(312,0)"><rect x="8" y="48" width="18" height="112" rx="3" fill="#377A8B" /><rect x="30" y="68" width="18" height="92" rx="3" fill="#D7E0E2" /></g>
                    <g transform="translate(364,0)"><rect x="8" y="38" width="18" height="122" rx="3" fill="#377A8B" /><rect x="30" y="58" width="18" height="102" rx="3" fill="#D7E0E2" /></g>
                    <g transform="translate(416,0)"><rect x="8" y="52" width="18" height="108" rx="3" fill="#377A8B" /><rect x="30" y="72" width="18" height="88" rx="3" fill="#D7E0E2" /></g>
                    <g transform="translate(468,0)"><rect x="8" y="30" width="18" height="130" rx="3" fill="#377A8B" /><rect x="30" y="50" width="18" height="110" rx="3" fill="#D7E0E2" /></g>
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
