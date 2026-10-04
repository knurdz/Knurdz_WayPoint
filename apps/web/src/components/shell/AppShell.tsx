'use client';

import React, { useState, useEffect } from 'react';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import CopilotModal from '../copilot/CopilotModal';
import { useCopilot } from '../../hooks/useCopilot';
import { ToastProvider } from '../ui/Toast';
import { AgentProvider } from '../agent/AgentContext';

interface AppShellProps {
  role?: 'dispatcher' | 'loader' | 'driver' | 'store';
  userName?: string;
  depot?: string;
  title?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}

export default function AppShell({
  role = 'dispatcher',
  userName = 'Nimal Perera',
  depot = 'Peliyagoda Hub',
  title,
  headerAction,
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
      <AgentProvider>
        <div className="wp-layout">
          <div
            className="wp-sidebar-backdrop"
            onClick={() => setNavOpen(false)}
            aria-hidden="true"
          />
          <Sidebar
            role={role}
            userName={userName}
            depot={depot}
            onClose={() => setNavOpen(false)}
          />
          <div className="wp-stage">
            <TopBar
              title={title}
              role={role}
              userName={userName}
              depot={depot}
              headerAction={headerAction}
              onOpenSearch={openCopilot}
              onToggleSidebar={() => setNavOpen((prev) => !prev)}
            />
            <main className="wp-main">
              {children}
            </main>
          </div>
          <CopilotModal isOpen={isOpen} onClose={closeCopilot} />
        </div>
      </AgentProvider>
    </ToastProvider>
  );
}
