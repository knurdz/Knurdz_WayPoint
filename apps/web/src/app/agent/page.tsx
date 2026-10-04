'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/shell/AppShell';
import AgentChatInterface from '@/components/agent/AgentChatInterface';

export default function AgentPage() {
  const [degradationState, setDegradationState] = useState<'ready' | 'offline' | 'unavailable'>('ready');

  useEffect(() => {
    const updateOnlineStatus = () => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setDegradationState('offline');
      } else {
        setDegradationState('ready');
      }
    };

    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  return (
    <AppShell
      role="dispatcher"
      userName="Nimal Perera"
      depot="Peliyagoda Hub"
      title="Waypoint Agent"
    >
      <div className="wp-agent-page">
        <div className="wp-agent-shell">
          <AgentChatInterface
            degradationState={degradationState}
            onResetDegradation={() => setDegradationState('ready')}
          />
        </div>
      </div>
    </AppShell>
  );
}
