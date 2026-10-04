'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Bot, MessageSquare } from 'lucide-react';
import AgentDrawer from './AgentDrawer';

interface AgentContextType {
  isLive: boolean;
  agentStatus: string;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  toggleLive: () => void;
  setLive: (live: boolean, status?: string) => void;
}

const AgentContext = createContext<AgentContextType | null>(null);

const AGENT_LIVE_KEY = 'wp-agent-live';
const AGENT_STATUS_KEY = 'wp-agent-status';


export function AgentProvider({ children }: { children: React.ReactNode }) {
  const [isLive, setIsLiveState] = useState(false);
  const [agentStatus, setAgentStatusState] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);


  // Initialize from session storage on mount
  useEffect(() => {
    try {
      const storedLive = sessionStorage.getItem(AGENT_LIVE_KEY) === 'true';
      const storedStatus = sessionStorage.getItem(AGENT_STATUS_KEY) || '';
      setIsLiveState(storedLive);
      setAgentStatusState(storedStatus);
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
        openDrawer,
        closeDrawer,
        toggleDrawer,
        toggleLive,
        setLive,
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
    </AgentContext.Provider>
  );
}

const DEFAULT_AGENT_CONTEXT: AgentContextType = {
  isLive: false,
  agentStatus: '',
  isDrawerOpen: false,
  openDrawer: () => {},
  closeDrawer: () => {},
  toggleDrawer: () => {},
  toggleLive: () => {},
  setLive: () => {},
};

export function useAgent() {
  const context = useContext(AgentContext);
  return context || DEFAULT_AGENT_CONTEXT;
}
