'use client';

import React, { useState } from 'react';
import {
  Flame,
  X,
  AlertTriangle,
  RefreshCw,
  Clock,
  WifiOff,
  CheckCircle,
  Zap,
  Volume2,
} from 'lucide-react';

interface OperationsSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  onBroadcast?: (message: string) => void;
}

interface ScenarioExecutionResult {
  scenario: string;
  title: string;
  elapsedMs: number;
  spokenAlert: string;
}

export default function OperationsSimulator({
  isOpen,
  onClose,
  onBroadcast,
}: OperationsSimulatorProps) {
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [loadingScenario, setLoadingScenario] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<ScenarioExecutionResult | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  if (!isOpen) return null;

  const handleRunScenario = async (scenario: string) => {
    setLoadingScenario(scenario);
    setStatusMessage('Dispatching disruption payload...');
    try {
      const res = await fetch('/api/simulator/scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario }),
      });

      const data = await res.json();
      if (res.ok) {
        setActiveScenario(scenario === 'reset' ? null : scenario);
        setLastResult({
          scenario,
          title: data.title,
          elapsedMs: data.elapsedMs || 12,
          spokenAlert: data.spokenAlert || '',
        });
        setStatusMessage(data.title);

        if (data.spokenAlert) {
          if (onBroadcast) {
            onBroadcast(data.spokenAlert);
          }
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('waypoint:broadcast_alert', {
                detail: { text: data.spokenAlert, priority: 'critical' },
              })
            );
            window.dispatchEvent(
              new CustomEvent('waypoint:chaos_triggered', {
                detail: { scenario, data },
              })
            );
          }
        }
      } else {
        setStatusMessage('Error executing scenario');
      }
    } catch {
      setStatusMessage('Network request failed');
    } finally {
      setLoadingScenario(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="chaos-simulator-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        padding: '1rem',
      }}
    >
      <div
        className="wp-panel"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '12px',
          border: '1px solid var(--wp-border-color, #e2e8f0)',
          background: 'var(--wp-panel-bg, #ffffff)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: '1.5rem',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--wp-border-color, #e2e8f0)',
            paddingBottom: '1rem',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <Flame size={20} />
            </div>
            <div>
              <span
                style={{
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontWeight: 700,
                  color: '#ea580c',
                }}
              >
                Evaluator God Mode · Stress Testing
              </span>
              <h2
                id="chaos-simulator-title"
                className="wp-headline-sm"
                style={{ margin: '0.15rem 0 0', fontSize: '1.15rem' }}
              >
                Operational Chaos & Stress Simulator
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="wp-icon-btn"
            aria-label="Close Chaos Simulator"
          >
            <X size={18} />
          </button>
        </div>

        <p
          className="wp-subtext"
          style={{ fontSize: '0.82rem', marginBottom: '1.25rem', lineHeight: 1.5 }}
        >
          Inject live operational emergencies to demonstrate real time self healing, dynamic OR Tools
          rebalancing, dynamic RAG incident ingestion, and proactive audio dispatch radio bulletins.
        </p>

        {/* Execution Benchmark Telemetry */}
        {lastResult && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              background: 'rgba(234, 88, 12, 0.08)',
              border: '1px solid rgba(234, 88, 12, 0.25)',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={16} color="#ea580c" />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--wp-text-main)' }}>
                {statusMessage}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontFamily: 'monospace',
                  background: 'var(--wp-panel-bg, #ffffff)',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  border: '1px solid var(--wp-border-color, #e2e8f0)',
                }}
              >
                Engine Latency: {lastResult.elapsedMs}ms
              </span>
              <Volume2 size={14} color="#ea580c" />
            </div>
          </div>
        )}

        {/* Four Scenario Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Scenario A: Cold Chain Emergency */}
          <div
            style={{
              padding: '1rem',
              borderRadius: '8px',
              border:
                activeScenario === 'cold_chain'
                  ? '2px solid #ef4444'
                  : '1px solid var(--wp-border-color, #e2e8f0)',
              background:
                activeScenario === 'cold_chain'
                  ? 'rgba(239, 68, 68, 0.05)'
                  : 'var(--wp-panel-bg, #ffffff)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={18} color="#ef4444" />
                <strong style={{ fontSize: '0.88rem' }}>
                  Disruption A: Cold Chain Thermal Emergency
                </strong>
              </div>
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '999px',
                  fontWeight: 600,
                  background: activeScenario === 'cold_chain' ? '#fee2e2' : 'var(--wp-tag-bg, #f1f5f9)',
                  color: activeScenario === 'cold_chain' ? '#991b1b' : 'var(--wp-text-muted)',
                }}
              >
                {activeScenario === 'cold_chain' ? 'Breach Active · 6.2°C' : 'Rule 02 Perishable'}
              </span>
            </div>
            <p className="wp-subtext" style={{ fontSize: '0.78rem', margin: 0 }}>
              Simulates compressor stall on TRK002 at Kadawatha. Temperature rises to 6.2°C,
              triggering live RAG incident ingestion, ambient warnings, and radio bulletin.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
              <button
                type="button"
                onClick={() => handleRunScenario('cold_chain')}
                disabled={loadingScenario !== null}
                className="wp-btn wp-btn-outline"
                style={{
                  fontSize: '0.78rem',
                  padding: '0.4rem 0.85rem',
                  borderColor: '#ef4444',
                  color: '#b91c1c',
                }}
              >
                {loadingScenario === 'cold_chain' ? 'Simulating...' : 'Inject Thermal Spike'}
              </button>
            </div>
          </div>

          {/* Scenario B: Vehicle Breakdown & Auto Rebalancing */}
          <div
            style={{
              padding: '1rem',
              borderRadius: '8px',
              border:
                activeScenario === 'breakdown'
                  ? '2px solid #f59e0b'
                  : '1px solid var(--wp-border-color, #e2e8f0)',
              background:
                activeScenario === 'breakdown'
                  ? 'rgba(245, 158, 11, 0.05)'
                  : 'var(--wp-panel-bg, #ffffff)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RefreshCw size={18} color="#f59e0b" />
                <strong style={{ fontSize: '0.88rem' }}>
                  Disruption B: Expressway Breakdown & Auto Rebalance
                </strong>
              </div>
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '999px',
                  fontWeight: 600,
                  background: activeScenario === 'breakdown' ? '#fef3c7' : 'var(--wp-tag-bg, #f1f5f9)',
                  color: activeScenario === 'breakdown' ? '#92400e' : 'var(--wp-text-muted)',
                }}
              >
                {activeScenario === 'breakdown' ? 'Rebalanced to VAN001' : 'Rule 01 Capacity'}
              </span>
            </div>
            <p className="wp-subtext" style={{ fontSize: '0.78rem', margin: 0 }}>
              Immobilizes TRK001 on the expressway. Triggers the allocation microservice to reallocate
              drops to VAN001 while respecting payload caps.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
              <button
                type="button"
                onClick={() => handleRunScenario('breakdown')}
                disabled={loadingScenario !== null}
                className="wp-btn wp-btn-outline"
                style={{
                  fontSize: '0.78rem',
                  padding: '0.4rem 0.85rem',
                  borderColor: '#f59e0b',
                  color: '#b45309',
                }}
              >
                {loadingScenario === 'breakdown' ? 'Simulating...' : 'Trigger Breakdown'}
              </button>
            </div>
          </div>

          {/* Scenario C: Pre Cutoff Rush */}
          <div
            style={{
              padding: '1rem',
              borderRadius: '8px',
              border:
                activeScenario === 'cutoff_rush'
                  ? '2px solid #8b5cf6'
                  : '1px solid var(--wp-border-color, #e2e8f0)',
              background:
                activeScenario === 'cutoff_rush'
                  ? 'rgba(139, 92, 246, 0.05)'
                  : 'var(--wp-panel-bg, #ffffff)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={18} color="#8b5cf6" />
                <strong style={{ fontSize: '0.88rem' }}>
                  Disruption C: Pre Cutoff Surge (15:45 SLST)
                </strong>
              </div>
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '999px',
                  fontWeight: 600,
                  background: activeScenario === 'cutoff_rush' ? '#ede9fe' : 'var(--wp-tag-bg, #f1f5f9)',
                  color: activeScenario === 'cutoff_rush' ? '#6d28d9' : 'var(--wp-text-muted)',
                }}
              >
                {activeScenario === 'cutoff_rush' ? '4 Deferred' : 'Rule 06 Departure Budget'}
              </span>
            </div>
            <p className="wp-subtext" style={{ fontSize: '0.78rem', margin: 0 }}>
              Simultaneously submits 12 priority supermarket orders 15 minutes before the 16:00
              deadline, exercising departure budgets and deferral routing.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
              <button
                type="button"
                onClick={() => handleRunScenario('cutoff_rush')}
                disabled={loadingScenario !== null}
                className="wp-btn wp-btn-outline"
                style={{
                  fontSize: '0.78rem',
                  padding: '0.4rem 0.85rem',
                  borderColor: '#8b5cf6',
                  color: '#6d28d9',
                }}
              >
                {loadingScenario === 'cutoff_rush' ? 'Simulating...' : 'Inject 12 Late Orders'}
              </button>
            </div>
          </div>

          {/* Scenario D: Central Highlands Signal Blackout */}
          <div
            style={{
              padding: '1rem',
              borderRadius: '8px',
              border:
                activeScenario === 'offline_sync'
                  ? '2px solid #06b6d4'
                  : '1px solid var(--wp-border-color, #e2e8f0)',
              background:
                activeScenario === 'offline_sync'
                  ? 'rgba(6, 182, 212, 0.05)'
                  : 'var(--wp-panel-bg, #ffffff)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <WifiOff size={18} color="#06b6d4" />
                <strong style={{ fontSize: '0.88rem' }}>
                  Disruption D: Central Highlands Signal Blackout
                </strong>
              </div>
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '999px',
                  fontWeight: 600,
                  background: activeScenario === 'offline_sync' ? '#cffafe' : 'var(--wp-tag-bg, #f1f5f9)',
                  color: activeScenario === 'offline_sync' ? '#0e7490' : 'var(--wp-text-muted)',
                }}
              >
                {activeScenario === 'offline_sync' ? 'Offline Queuing' : 'IndexedDB Resilience'}
              </span>
            </div>
            <p className="wp-subtext" style={{ fontSize: '0.78rem', margin: 0 }}>
              Simulates network drop on Kandy route R025229, demonstrating offline IndexedDB queuing
              and automated vector clock dispute resolution.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
              <button
                type="button"
                onClick={() => handleRunScenario('offline_sync')}
                disabled={loadingScenario !== null}
                className="wp-btn wp-btn-outline"
                style={{
                  fontSize: '0.78rem',
                  padding: '0.4rem 0.85rem',
                  borderColor: '#06b6d4',
                  color: '#0891b2',
                }}
              >
                {loadingScenario === 'offline_sync' ? 'Simulating...' : 'Simulate Blackout'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--wp-border-color, #e2e8f0)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <button
            type="button"
            onClick={() => handleRunScenario('reset')}
            disabled={loadingScenario !== null}
            className="wp-btn wp-btn-outline"
            style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem' }}
          >
            <CheckCircle size={14} />
            <span>Restore All to Baseline</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="wp-btn wp-btn-primary"
            style={{ fontSize: '0.78rem', padding: '0.45rem 1rem' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
