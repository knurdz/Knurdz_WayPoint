'use client';

import React from 'react';
import TopBar from './TopBar';
import Sidebar from './Sidebar';

interface AppShellProps {
  role?: 'dispatcher' | 'loader' | 'driver' | 'store';
  userName?: string;
  depot?: string;
  children: React.ReactNode;
}

export default function AppShell({
  role = 'dispatcher',
  userName = 'Nimal Perera',
  depot = 'Peliyagoda Hub',
  children,
}: AppShellProps) {
  return (
    <div className="wp-app-shell" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopBar role={role} userName={userName} depot={depot} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar role={role} />
        <main style={{
          flex: 1,
          overflowY: 'auto',
          background: 'var(--wp-canvas, #F5F5F3)',
          padding: 24,
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}
