'use client';

import React, { useState, useEffect } from 'react';
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
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (navOpen) {
      document.body.classList.add('wp-nav-open');
    } else {
      document.body.classList.remove('wp-nav-open');
    }
    return () => {
      document.body.classList.remove('wp-nav-open');
    };
  }, [navOpen]);

  return (
    <ToastProvider>
      <div className="wp-app-shell" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <TopBar
          role={role}
          userName={userName}
          depot={depot}
          onOpenSearch={openCopilot}
          onToggleSidebar={() => setNavOpen((prev) => !prev)}
        />
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
          <div
            className="wp-sidebar-backdrop"
            onClick={() => setNavOpen(false)}
            aria-hidden="true"
          />
          <Sidebar role={role} onClose={() => setNavOpen(false)} />
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
