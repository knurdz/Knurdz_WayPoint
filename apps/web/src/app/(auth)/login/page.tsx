'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Check,
  Home,
  PackageCheck,
  Truck,
  Store,
  MousePointerClick,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  LayoutGrid,
} from 'lucide-react';

interface Persona {
  id: 'dispatcher' | 'loader' | 'driver' | 'store';
  role: string;
  name: string;
  initials: string;
  avatarClass: string;
  dest: string;
  destIcon: React.ComponentType<{ size?: number; className?: string }>;
  scope: string;
  email: string;
  redirectUrl: string;
}

const PERSONAS: Persona[] = [
  {
    id: 'dispatcher',
    role: 'Dispatcher',
    name: 'Nimal Perera',
    initials: 'NP',
    avatarClass: 'persona-disp',
    dest: 'Mission Control',
    destIcon: Home,
    scope: 'HQ · 142 Orders',
    email: 'nimal.perera@waypoint.lk',
    redirectUrl: '/dispatcher',
  },
  {
    id: 'loader',
    role: 'Warehouse Loader',
    name: 'Priya Fernando',
    initials: 'PF',
    avatarClass: 'persona-load',
    dest: 'Warehouse Dock',
    destIcon: PackageCheck,
    scope: 'Dock 04 · LIFO',
    email: 'priya.fernando@waypoint.lk',
    redirectUrl: '/loader',
  },
  {
    id: 'driver',
    role: 'Delivery Driver',
    name: 'Kamal Silva',
    initials: 'KS',
    avatarClass: 'persona-drv',
    dest: 'Driver Route',
    destIcon: Truck,
    scope: 'VEH037 · POD',
    email: 'kamal.silva@waypoint.lk',
    redirectUrl: '/driver/route',
  },
  {
    id: 'store',
    role: 'Store Manager',
    name: 'Anjali Jayawardena',
    initials: 'AJ',
    avatarClass: 'persona-store',
    dest: 'Store Portal',
    destIcon: Store,
    scope: 'OUT001 Galle Rd',
    email: 'anjali.jayawardena@waypoint.lk',
    redirectUrl: '/store',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [selectedPersona, setSelectedPersona] = useState<Persona>(PERSONAS[0]);
  const [email, setEmail] = useState<string>(PERSONAS[0].email);
  const [password, setPassword] = useState('Waypoint2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelectPersona = (p: Persona) => {
    setSelectedPersona(p);
    setEmail(p.email);
    setPassword('Waypoint2026!');
    setError(null);
  };

  const handlePersonaDoubleClick = async (p: Persona) => {
    setSelectedPersona(p);
    setEmail(p.email);
    setPassword('Waypoint2026!');
    setError(null);
    await executeLogin(p.email, 'Waypoint2026!', p.redirectUrl);
  };

  const executeLogin = async (loginEmail: string, loginPass: string, redirectTarget?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPass, remember }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      router.push(redirectTarget || data.redirectUrl || '/dispatcher');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to connect to authentication server';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin(email, password, selectedPersona.redirectUrl);
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
            <h2>Sign In</h2>
            <p className="wp-login-subtitle">
              Select a demo persona to explore role specific workflows, or enter credentials below:
            </p>

            {error && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: 'rgba(220, 38, 38, 0.1)',
                  color: '#DC2626',
                  fontSize: 13,
                  marginBottom: 16,
                }}
              >
                {error}
              </div>
            )}

            {/* 4 Personas Selector */}
            <div className="wp-persona-selector-wrap">
              <div className="wp-persona-selector-header">
                <span className="wp-persona-selector-title">
                  <Users size={14} style={{ color: 'var(--wp-primary)' }} />
                  <span>Enterprise Role Directory</span>
                </span>
                <span className="wp-persona-badge">Verified Roles</span>
              </div>
              <p className="wp-persona-selector-desc">
                Select a role profile to load assigned credentials, or double click to authenticate directly:
              </p>

              <div className="wp-persona-grid" role="radiogroup" aria-label="Enterprise Roles">
                {PERSONAS.map((p) => {
                  const isActive = selectedPersona.id === p.id;
                  const DestIcon = p.destIcon;

                  return (
                    <button
                      key={p.id}
                      type="button"
                      className={`wp-persona-card ${isActive ? 'is-active' : ''}`}
                      role="radio"
                      aria-checked={isActive}
                      tabIndex={0}
                      onClick={() => handleSelectPersona(p)}
                      onDoubleClick={() => handlePersonaDoubleClick(p)}
                    >
                      <div className="wp-persona-card-header">
                        <span className={`wp-avatar wp-persona-avatar ${p.avatarClass}`}>
                          {p.initials}
                        </span>
                        <div className="wp-persona-meta">
                          <div className="wp-persona-role">{p.role}</div>
                          <div className="wp-persona-name">{p.name}</div>
                        </div>
                        <span className="wp-persona-check" aria-hidden="true">
                          <Check size={13} />
                        </span>
                      </div>
                      <div className="wp-persona-card-footer">
                        <span className="wp-persona-dest">
                          <DestIcon size={12} /> {p.dest}
                        </span>
                        <span className="wp-persona-scope">{p.scope}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="wp-persona-hint">
                <span>
                  <MousePointerClick size={12} style={{ display: 'inline', marginRight: 4 }} />
                  Click to select profile · Double click to launch
                </span>
                <span className="font-mono">Quick Access</span>
              </div>
            </div>

            <div className="wp-login-divider">
              <span>or sign in with credentials</span>
            </div>

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

              <div className="wp-login-field">
                <label className="wp-label" htmlFor="password">
                  Password
                </label>
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
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Dynamic Persona Destination Notice */}
              <div className="wp-persona-banner">
                <span className="wp-persona-banner-icon">
                  <ShieldCheck size={16} />
                </span>
                <div className="wp-persona-banner-text">
                  Signing in as <strong>{selectedPersona.name}</strong> ({selectedPersona.role}) → Redirects to{' '}
                  <span className="wp-persona-banner-dest">{selectedPersona.dest}</span>
                </div>
              </div>

              <div className="wp-login-options">
                <label className="wp-login-remember">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <span>Remember for 30 Days</span>
                </label>
                <Link className="wp-login-forgot" href="/forgot-password">
                  Forgot password
                </Link>
              </div>

              <button
                type="submit"
                className="wp-btn wp-btn-primary wp-login-submit"
                disabled={loading}
              >
                <span>{loading ? 'Signing in...' : `Sign in as ${selectedPersona.role}`}</span>
                <ArrowRight size={16} />
              </button>
            </form>

            <p className="wp-login-footer">
              Don&apos;t have an account? <a href="mailto:support@waypoint.lk">Contact support</a>
            </p>
          </div>
        </div>
      </section>

      {/* Right Brand & Visual Showcase Panel */}
      <section className="wp-login-brand" aria-hidden="false">
        <div className="wp-login-brand-inner">
          <h1 style={{ fontSize: '2rem', lineHeight: 1.25, fontWeight: 700, margin: '0 0 0.75rem', color: '#FFFFFF' }}>
            Welcome back! Please sign in to your <span className="wp-login-highlight">Waypoint</span> account
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.95rem', margin: 0, lineHeight: 1.5 }}>
            Intelligent enterprise logistics for Fresh, Style, and chilled distribution across Sri Lanka.
          </p>

          <div
            className="wp-login-persona-pills"
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.45rem',
              margin: '1.15rem 0 0.25rem',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.25rem 0.65rem',
                borderRadius: 999,
                fontSize: '0.75rem',
                background: 'rgba(255, 255, 255, 0.14)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#fff',
              }}
            >
              <LayoutGrid size={12} /> Dispatcher HQ
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.25rem 0.65rem',
                borderRadius: 999,
                fontSize: '0.75rem',
                background: 'rgba(255, 255, 255, 0.14)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#fff',
              }}
            >
              <PackageCheck size={12} /> Dock Loader
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.25rem 0.65rem',
                borderRadius: 999,
                fontSize: '0.75rem',
                background: 'rgba(255, 255, 255, 0.14)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#fff',
              }}
            >
              <Truck size={12} /> Fleet Driver
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.25rem 0.65rem',
                borderRadius: 999,
                fontSize: '0.75rem',
                background: 'rgba(255, 255, 255, 0.14)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#fff',
              }}
            >
              <Store size={12} /> Store Manager
            </span>
          </div>

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
                <svg
                  className="wp-login-bar-chart"
                  viewBox="0 0 520 180"
                  role="img"
                  aria-label="Monthly delivery report chart"
                >
                  <g className="wp-login-bars">
                    <g transform="translate(0,0)">
                      <rect x="8" y="90" width="18" height="70" rx="3" fill="#377A8B" />
                      <rect x="30" y="105" width="18" height="55" rx="3" fill="#D7E0E2" />
                    </g>
                    <g transform="translate(52,0)">
                      <rect x="8" y="75" width="18" height="85" rx="3" fill="#377A8B" />
                      <rect x="30" y="95" width="18" height="65" rx="3" fill="#D7E0E2" />
                    </g>
                    <g transform="translate(104,0)">
                      <rect x="8" y="82" width="18" height="78" rx="3" fill="#377A8B" />
                      <rect x="30" y="100" width="18" height="60" rx="3" fill="#D7E0E2" />
                    </g>
                    <g transform="translate(156,0)">
                      <rect x="8" y="68" width="18" height="92" rx="3" fill="#377A8B" />
                      <rect x="30" y="88" width="18" height="72" rx="3" fill="#D7E0E2" />
                    </g>
                    <g transform="translate(208,0)">
                      <rect x="8" y="58" width="18" height="102" rx="3" fill="#377A8B" />
                      <rect x="30" y="78" width="18" height="82" rx="3" fill="#D7E0E2" />
                    </g>
                    <g transform="translate(260,0)">
                      <rect x="8" y="72" width="18" height="88" rx="3" fill="#377A8B" />
                      <rect x="30" y="92" width="18" height="68" rx="3" fill="#D7E0E2" />
                    </g>
                    <g transform="translate(312,0)">
                      <rect x="8" y="48" width="18" height="112" rx="3" fill="#377A8B" />
                      <rect x="30" y="68" width="18" height="92" rx="3" fill="#D7E0E2" />
                    </g>
                    <g transform="translate(364,0)">
                      <rect x="8" y="38" width="18" height="122" rx="3" fill="#377A8B" />
                      <rect x="30" y="58" width="18" height="102" rx="3" fill="#D7E0E2" />
                    </g>
                    <g transform="translate(416,0)">
                      <rect x="8" y="55" width="18" height="105" rx="3" fill="#377A8B" />
                      <rect x="30" y="75" width="18" height="85" rx="3" fill="#D7E0E2" />
                    </g>
                    <g transform="translate(468,0)">
                      <rect x="8" y="65" width="18" height="95" rx="3" fill="#377A8B" />
                      <rect x="30" y="85" width="18" height="75" rx="3" fill="#D7E0E2" />
                    </g>
                  </g>
                  <g className="wp-login-chart-labels" fill="#9CA3AF" fontSize="11" fontFamily="Nunito Sans, sans-serif">
                    <text x="24" y="172">Jan</text>
                    <text x="76" y="172">Feb</text>
                    <text x="128" y="172">Mar</text>
                    <text x="180" y="172">Apr</text>
                    <text x="232" y="172">May</text>
                    <text x="284" y="172">Jun</text>
                    <text x="336" y="172">Jul</text>
                    <text x="388" y="172">Aug</text>
                    <text x="440" y="172">Sep</text>
                    <text x="492" y="172">Oct</text>
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
