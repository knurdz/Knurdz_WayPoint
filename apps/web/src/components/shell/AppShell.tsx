'use client';

import React from 'react';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import CopilotModal from '../copilot/CopilotModal';
import { useCopilot } from '../../hooks/useCopilot';
import { ToastProvider } from '../ui/Toast';

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
  const { isOpen, openCopilot, closeCopilot } = useCopilot();

  return (
    <ToastProvider>
      <div className="wp-app-shell" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <TopBar role={role} userName={userName} depot={depot} onOpenSearch={openCopilot} />
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <Sidebar role={role} />
          <main style={{
            flex: 1,
            position: 'relative',
            overflowY: 'auto',
            background: 'var(--wp-canvas, #F5F5F3)',
            padding: 24,
            minWidth: 0,
          }}>
            {children}
          </main>
        </div>
        <CopilotModal isOpen={isOpen} onClose={closeCopilot} />
      </div>
    </ToastProvider>
  );
}
