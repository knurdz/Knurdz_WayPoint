'use client';

import React, { useState } from 'react';
import AppShell from '@/components/shell/AppShell';
import AgentChatInterface from '@/components/agent/AgentChatInterface';

export default function AgentPage() {
  const [degradationState, setDegradationState] = useState<'ready' | 'offline' | 'unavailable'>('ready');

  return (
    <AppShell
      role="dispatcher"
      userName="Nimal Perera"
      depot="Peliyagoda Hub"
      title="Waypoint Agent"
    >
      <div className="wp-agent-page">
        <div className="wp-agent-shell">
          <div
            className="screen-sync-states wp-agent-deg-states"
            data-wp-agent-deg-tabs
            role="tablist"
            aria-label="Agent degradation states"
          >
            <button
              type="button"
              className={`screen-sync-state ${degradationState === 'ready' ? 'is-active' : ''}`}
              onClick={() => setDegradationState('ready')}
              role="tab"
              aria-selected={degradationState === 'ready'}
            >
              Ready
            </button>
            <button
              type="button"
              className={`screen-sync-state ${degradationState === 'offline' ? 'is-active' : ''}`}
              onClick={() => setDegradationState('offline')}
              role="tab"
              aria-selected={degradationState === 'offline'}
            >
              Offline
            </button>
            <button
              type="button"
              className={`screen-sync-state ${degradationState === 'unavailable' ? 'is-active' : ''}`}
              onClick={() => setDegradationState('unavailable')}
              role="tab"
              aria-selected={degradationState === 'unavailable'}
            >
              Model unavailable
            </button>
          </div>

          <AgentChatInterface
            degradationState={degradationState}
            onResetDegradation={() => setDegradationState('ready')}
          />
        </div>
      </div>
    </AppShell>
  );
}
