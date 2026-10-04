'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Bot, MessageSquare } from 'lucide-react';
import AgentDrawer from './AgentDrawer';
import OperationsSimulator from '../simulator/OperationsSimulator';

interface AgentContextType {
  isLive: boolean;
  agentStatus: string;
  isDrawerOpen: boolean;
  isRadioActive: boolean;
  isSimulatorOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  toggleLive: () => void;
  setLive: (live: boolean, status?: string) => void;
  toggleRadio: () => void;
  openSimulator: () => void;
  closeSimulator: () => void;
  toggleSimulator: () => void;
  broadcastRadioAlert: (text: string) => void;
}

const AgentContext = createContext<AgentContextType | null>(null);

const AGENT_LIVE_KEY = 'wp-agent-live';
const AGENT_STATUS_KEY = 'wp-agent-status';
const RADIO_ACTIVE_KEY = 'wp-radio-active';

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const [isLive, setIsLiveState] = useState(false);
  const [agentStatus, setAgentStatusState] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isRadioActive, setIsRadioActiveState] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  // Initialize from session storage on mount
  useEffect(() => {
    try {
      const storedLive = sessionStorage.getItem(AGENT_LIVE_KEY) === 'true';
      const storedStatus = sessionStorage.getItem(AGENT_STATUS_KEY) || '';
      const storedRadio = sessionStorage.getItem(RADIO_ACTIVE_KEY) === 'true';
      setIsLiveState(storedLive);
      setAgentStatusState(storedStatus);
      setIsRadioActiveState(storedRadio);
      if (storedLive) {
        document.body.classList.add('wp-agent-live');
      }
    } catch {
      // storage unavailable
    }
  }, []);

  // Sync body class when isLive changes
  useEffect(() => {
    if (isLive) {
      document.body.classList.add('wp-agent-live');
    } else {
      document.body.classList.remove('wp-agent-live');
    }
  }, [isLive]);

  // Global keyboard shortcut: cmd+j or ctrl+j toggles agent drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setIsDrawerOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setIsDrawerOpen((prev) => !prev), []);

  const openSimulator = useCallback(() => setIsSimulatorOpen(true), []);
  const closeSimulator = useCallback(() => setIsSimulatorOpen(false), []);
  const toggleSimulator = useCallback(() => setIsSimulatorOpen((prev) => !prev), []);

  const toggleRadio = useCallback(() => {
    setIsRadioActiveState((prev) => {
      const next = !prev;
      try {
        if (next) {
          sessionStorage.setItem(RADIO_ACTIVE_KEY, 'true');
        } else {
          sessionStorage.removeItem(RADIO_ACTIVE_KEY);
        }
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const broadcastRadioAlert = useCallback((text: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('waypoint:broadcast_alert', {
          detail: { text, priority: 'critical' },
        })
      );
    }
  }, []);

  const setLive = useCallback((live: boolean, status?: string) => {
    setIsLiveState(live);
    const newStatus = live ? (status || 'Watching Active Operations') : '';
    setAgentStatusState(newStatus);
    try {
      if (live) {
        sessionStorage.setItem(AGENT_LIVE_KEY, 'true');
        if (newStatus) sessionStorage.setItem(AGENT_STATUS_KEY, newStatus);
      } else {
        sessionStorage.removeItem(AGENT_LIVE_KEY);
        sessionStorage.removeItem(AGENT_STATUS_KEY);
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleLive = useCallback(() => {
    setIsLiveState((prev) => {
      const next = !prev;
      const nextStatus = next ? 'Watching Active Operations' : '';
      setAgentStatusState(nextStatus);
      try {
        if (next) {
          sessionStorage.setItem(AGENT_LIVE_KEY, 'true');
          sessionStorage.setItem(AGENT_STATUS_KEY, nextStatus);
        } else {
          sessionStorage.removeItem(AGENT_LIVE_KEY);
          sessionStorage.removeItem(AGENT_STATUS_KEY);
        }
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  return (
    <AgentContext.Provider
      value={{
        isLive,
        agentStatus,
        isDrawerOpen,
        isRadioActive,
        isSimulatorOpen,
        openDrawer,
        closeDrawer,
        toggleDrawer,
        toggleLive,
        setLive,
        toggleRadio,
        openSimulator,
        closeSimulator,
        toggleSimulator,
        broadcastRadioAlert,
      }}
    >
      {children}

      {/* Ambient agent glow active when live */}
      <div className="wp-agent-glow" data-wp-agent-glow aria-hidden="true" />

      {/* Floating status chip matching prototype */}
      {isLive && (
        <button
          type="button"
          onClick={openDrawer}
          className="wp-agent-status-chip"
          data-wp-agent-status
          aria-label="Open Waypoint Agent drawer"
        >
          <span className="wp-agent-status-pulse" aria-hidden="true" />
          <Bot size={16} />
          <span data-wp-agent-status-label>
            {agentStatus || 'Agent active'}
          </span>
          <MessageSquare size={14} className="wp-agent-status-chat" />
        </button>
      )}

      {/* Global slide over agent drawer */}
      <AgentDrawer isOpen={isDrawerOpen} onClose={closeDrawer} />

      {/* Global Evaluator Chaos Simulator */}
      <OperationsSimulator
        isOpen={isSimulatorOpen}
        onClose={closeSimulator}
        onBroadcast={broadcastRadioAlert}
      />
    </AgentContext.Provider>
  );
}

const DEFAULT_AGENT_CONTEXT: AgentContextType = {
  isLive: false,
  agentStatus: '',
  isDrawerOpen: false,
  isRadioActive: false,
  isSimulatorOpen: false,
  openDrawer: () => {},
  closeDrawer: () => {},
  toggleDrawer: () => {},
  toggleLive: () => {},
  setLive: () => {},
  toggleRadio: () => {},
  openSimulator: () => {},
  closeSimulator: () => {},
  toggleSimulator: () => {},
  broadcastRadioAlert: () => {},
};

export function useAgent() {
  const context = useContext(AgentContext);
  return context || DEFAULT_AGENT_CONTEXT;
}
