'use client';

import React, { useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import AgentChatInterface from './AgentChatInterface';

interface AgentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AgentDrawer({ isOpen, onClose }: AgentDrawerProps) {
  // Close drawer on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="wp-drawer-backdrop open"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Waypoint Agent Assistant"
      style={{
        zIndex: 9999,
        left: 0,
      }}
    >
      <div
        className="wp-drawer-right open"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(480px, 100%)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <div className="wp-drawer-header" style={{ padding: '0.85rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '1.75rem',
                height: '1.75rem',
                borderRadius: '0.5rem',
                background: 'var(--wp-primary-wash)',
                color: 'var(--wp-primary)',
              }}
            >
              <Sparkles size={16} />
            </span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--wp-heading)' }}>
                Waypoint Copilot
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--wp-subtext)' }}>
                Multimodal Assistant & Voice Agent
              </div>
            </div>
          </div>

          <button
            type="button"
            className="wp-icon-btn"
            onClick={onClose}
            aria-label="Close Agent drawer"
          >
            <X size={16} />
          </button>
        </div>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <AgentChatInterface isDrawer onNavigateComplete={onClose} />
        </div>
      </div>
    </div>
  );
}
