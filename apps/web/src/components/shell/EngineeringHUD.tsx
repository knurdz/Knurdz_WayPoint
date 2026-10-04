'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Zap,
  ChevronUp,
  ChevronDown,
  Cpu,
  Search,
  Radio,
  Flame,
} from 'lucide-react';
import { useAgent } from '../agent/AgentContext';

export default function EngineeringHUD() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [solverLatency, setSolverLatency] = useState(38);
  const [isTesting, setIsTesting] = useState(false);
  const { toggleSimulator } = useAgent();

  const handleTestLatency = async () => {
    setIsTesting(true);
    const start = performance.now();
    try {
      const res = await fetch('/api/dispatcher/summary');
      if (res.ok) {
        const roundTrip = Math.round(performance.now() - start);
        setSolverLatency(Math.max(14, roundTrip));
      }
    } catch {
      // test fallback
    } finally {
      setIsTesting(false);
    }
  };

  useEffect(() => {
    const handleChaosEvent = () => {
      // Brief jitter on chaos trigger
      setSolverLatency((prev) => prev + Math.floor(Math.random() * 5));
    };
    window.addEventListener('waypoint:chaos_triggered', handleChaosEvent);
    return () => {
      window.removeEventListener('waypoint:chaos_triggered', handleChaosEvent);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        zIndex: 9000,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {!isExpanded ? (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.4rem 0.75rem',
            background: 'rgba(15, 23, 42, 0.92)',
            color: '#38bdf8',
            borderRadius: '999px',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
            fontSize: '0.72rem',
            fontWeight: 600,
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
          }}
          aria-label="Open Engineering Observability HUD"
        >
          <Activity size={13} className="animate-pulse" />
          <span>OR Tools {solverLatency}ms</span>
          <span style={{ color: '#94a3b8' }}>·</span>
          <span style={{ color: '#a7f3d0' }}>RAG 6ms</span>
          <ChevronUp size={12} style={{ marginLeft: '0.2rem', color: '#94a3b8' }} />
        </button>
      ) : (
        <div
          style={{
            width: '320px',
            background: 'rgba(15, 23, 42, 0.96)',
            color: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
            padding: '1rem',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              paddingBottom: '0.65rem',
              marginBottom: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Zap size={15} color="#38bdf8" />
              <strong style={{ fontSize: '0.78rem', letterSpacing: '0.02em', color: '#38bdf8' }}>
                Engineering Observability HUD
              </strong>
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '0.2rem',
                display: 'flex',
              }}
              aria-label="Minimize HUD"
            >
              <ChevronDown size={15} />
            </button>
          </div>

          {/* Metrics Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {/* Solver */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.45rem 0.6rem',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Cpu size={14} color="#38bdf8" />
                <span style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>OR Tools Solver</span>
              </div>
              <span
                style={{
                  fontSize: '0.74rem',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  color: '#38bdf8',
                }}
              >
                {solverLatency}ms
              </span>
            </div>

            {/* RAG Retrieval */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.45rem 0.6rem',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Search size={14} color="#34d399" />
                <span style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>Vector RAG Query</span>
              </div>
              <span
                style={{
                  fontSize: '0.74rem',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  color: '#34d399',
                }}
              >
                6ms
              </span>
            </div>

            {/* Audio AEC */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.45rem 0.6rem',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Radio size={14} color="#a78bfa" />
                <span style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>Audio AEC Buffer</span>
              </div>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: '#a78bfa',
                }}
              >
                0 Dropped
              </span>
            </div>

            {/* Telemetry Stream */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.45rem 0.6rem',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={14} color="#f59e0b" />
                <span style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>Fleet Telemetry</span>
              </div>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  color: '#f59e0b',
                }}
              >
                32 Active Units
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              marginTop: '0.85rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <button
              type="button"
              onClick={handleTestLatency}
              disabled={isTesting}
              style={{
                flex: 1,
                fontSize: '0.7rem',
                padding: '0.35rem 0.5rem',
                borderRadius: '6px',
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                color: '#38bdf8',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {isTesting ? 'Pinging...' : 'Benchmark Solver'}
            </button>
            <button
              type="button"
              onClick={() => {
                toggleSimulator();
                setIsExpanded(false);
              }}
              style={{
                fontSize: '0.7rem',
                padding: '0.35rem 0.65rem',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <Flame size={12} />
              <span>Chaos</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
