'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import CutoffTicker from './CutoffTicker';
import { LogOut, User } from 'lucide-react';

interface TopBarProps {
  role?: string;
  userName?: string;
  depot?: string;
  children?: React.ReactNode;
}

export default function TopBar({
  role = 'dispatcher',
  userName = 'Nimal Perera',
  depot = 'Peliyagoda Hub',
  children,
}: TopBarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="wp-topbar" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 64,
      padding: '0 24px',
      borderBottom: '1px solid var(--wp-border, rgba(0,0,0,0.08))',
      background: 'var(--wp-panel, #FFFFFF)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <a href={`/${role}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="/assets/logo-mark.svg" alt="Waypoint" width={32} height={32} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--wp-heading, #1A1C1C)', lineHeight: 1 }}>
              Waypoint
            </span>
            <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--wp-muted, #6E838A)' }}>
              Logistics
            </span>
          </div>
        </a>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '4px 10px',
          borderRadius: 6,
          background: 'var(--wp-subpanel, #F8F8F7)',
          border: '1px solid var(--wp-subpanel-border, rgba(0,0,0,0.06))',
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--wp-subtext, #3E555C)',
        }}>
          <span style={{ textTransform: 'capitalize' }}>{role}</span>
          <span style={{ color: 'var(--wp-muted, #6E838A)' }}>•</span>
          <span>{depot}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <CutoffTicker />
        {children}

        <ThemeToggle />

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '4px 10px',
          borderRadius: 20,
          background: 'var(--wp-subpanel, #F8F8F7)',
          border: '1px solid var(--wp-border, rgba(0,0,0,0.08))',
        }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'var(--wp-primary, #377A8B)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
          }}>
            {userName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--wp-heading, #1A1C1C)' }}>
            {userName}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            title="Log out"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--wp-muted, #6E838A)',
              display: 'flex',
              alignItems: 'center',
              padding: 4,
            }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}
