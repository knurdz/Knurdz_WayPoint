'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bot,
  Mic,
  ArrowUp,
  ShieldCheck,
  CloudOff,
  BotOff,
  RefreshCw,
  Volume2,
  VolumeX,
  Zap,
  Radio,
  Thermometer,
  Truck,
  Package,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useFullDuplexVoice } from '@/hooks/useFullDuplexVoice';
import { useAgent } from './AgentContext';

export interface ActionDefinition {
  id: string;
  label: string;
  href: string;
  description: string;
  status: string;
}

export interface RAGCitation {
  id: string;
  title: string;
  category: string;
  actionUrl?: string;
  score: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  time: string;
  action?: ActionDefinition;
  telemetryData?: Record<string, unknown>;
  toolName?: string;
  citations?: RAGCitation[];
  ragContext?: string;
  fromVoice?: boolean;
}

interface AgentChatInterfaceProps {
  degradationState?: 'ready' | 'offline' | 'unavailable';
  onResetDegradation?: () => void;
  onNavigateComplete?: () => void;
  isDrawer?: boolean;
}

const DEFAULT_SUGGESTIONS = [
  'Where is truck TRK 001 and is cold chain safe?',
  'What is the issue with Peliyagoda Bay 04?',
  'What is the vehicle restriction for OUT003?',
  'How many orders today?',
  'What is the cutoff time remaining?',
  'Explain Rule 08 mall delivery window',
];

export default function AgentChatInterface({
  degradationState = 'ready',
  onResetDegradation,
  onNavigateComplete,
  isDrawer = false,
}: AgentChatInterfaceProps) {
  const router = useRouter();
  const { setLive } = useAgent();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [voicePlaybackEnabled, setVoicePlaybackEnabled] = useState(true);
  const [expandedRAGMsgId, setExpandedRAGMsgId] = useState<string | null>(null);

  const threadRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const speakRef = useRef<(text: string) => void>(() => {});

  const isDegraded = degradationState !== 'ready';

  const handleQuery = useCallback(
    async (queryText: string, fromVoice = false) => {
      const trimmed = queryText.trim();
      if (!trimmed || loading || isDegraded) return;

      setShowWelcome(false);

      const userTime = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      const userMsg: ChatMessage = {
        id: `user_${Date.now()}`,
        sender: 'user',
        text: trimmed,
        time: userTime,
        fromVoice,
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setLoading(true);

      try {
        const res = await fetch('/api/agent/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: trimmed, fromVoice }),
        });

        const data = await res.json();
        const replyText = data.reply || 'Request processed.';

        const agentMsg: ChatMessage = {
          id: `agent_${Date.now()}`,
          sender: 'agent',
          text: replyText,
          time: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          action: data.action || undefined,
          telemetryData: data.telemetryData || undefined,
          toolName: data.toolName || undefined,
          citations: data.citations || undefined,
          ragContext: data.ragContext || undefined,
          fromVoice,
        };

        setMessages((prev) => [...prev, agentMsg]);

        // Vocalize response if from voice or voice feedback enabled
        if ((fromVoice || voicePlaybackEnabled) && replyText) {
          speakRef.current(replyText);
        }
      } catch {
        const errorMsg: ChatMessage = {
          id: `agent_${Date.now()}`,
          sender: 'agent',
          text: 'Connection error while consulting Waypoint Agent. Please try again.',
          time: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setLoading(false);
      }
    },
    [loading, isDegraded, voicePlaybackEnabled]
  );

  const voiceEngine = useFullDuplexVoice({
    mode: 'full_duplex',
    provider: 'elevenlabs',
    onUserTranscript: (transcript) => {
      handleQuery(transcript, true);
    },
    onBargeIn: () => {
      // Barge in detected, user interrupted the agent speech
    },
  });

  speakRef.current = voiceEngine.speak;

  const {
    duplexMode,
    voiceProvider,
    isListening,
    isSpeaking,
    isUserSpeaking,
    isInterrupted,
    audioLevel,
    isSupported: voiceSupported,
    startSession,
    stopSession,
    cancelSpeech,
    toggleDuplexMode,
    toggleVoiceProvider,
  } = voiceEngine;

  // Scroll to bottom when messages update
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages, showWelcome, isInterrupted, expandedRAGMsgId]);



  const handleMicToggle = async () => {
    if (isDegraded || !voiceSupported) return;

    if (isListening) {
      stopSession();
    } else {
      cancelSpeech();
      await startSession();
    }
  };

  const handleAllowAction = (action: ActionDefinition, fromVoice?: boolean) => {
    setLive(true, action.status);
    if (fromVoice && voicePlaybackEnabled) {
      voiceEngine.speak(`Opening ${action.label}`);
    }
    if (onNavigateComplete) {
      onNavigateComplete();
    }
    router.push(action.href);
  };

  const handleDenyAction = (fromVoice?: boolean) => {
    const denyReply =
      'Understood. I will not navigate without your approval. Ask me anything else or request another operation.';
    const denyMsg: ChatMessage = {
      id: `agent_${Date.now()}`,
      sender: 'agent',
      text: denyReply,
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setMessages((prev) => [...prev, denyMsg]);
    if (fromVoice && voicePlaybackEnabled) {
      voiceEngine.speak(denyReply);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleQuery(input, false);
  };

  return (
    <section
      className={`wp-agent-chat ${isDegraded ? 'is-degraded' : ''}`}
      aria-label="Agent conversation"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: isDrawer ? '100%' : undefined,
        minHeight: isDrawer ? '100%' : undefined,
      }}
    >
      <header className="wp-agent-chat-head" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="wp-agent-chat-avatar" aria-hidden="true">
            <Bot size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h1 className="wp-agent-chat-title" style={{ fontSize: '1rem', margin: 0 }}>
                Waypoint Agent
              </h1>
              {/* Duplex mode badge */}
              <button
                type="button"
                onClick={toggleDuplexMode}
                className="wp-agent-prompt"
                style={{
                  fontSize: '0.68rem',
                  padding: '0.15rem 0.55rem',
                  minHeight: '1.5rem',
                  borderRadius: '999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: duplexMode === 'full_duplex' ? 'var(--wp-primary-wash)' : 'var(--wp-subpanel)',
                  color: duplexMode === 'full_duplex' ? 'var(--wp-primary)' : 'var(--wp-subtext)',
                  borderColor: duplexMode === 'full_duplex' ? 'var(--wp-primary)' : 'var(--wp-border)',
                }}
                title={duplexMode === 'full_duplex' ? 'Full Duplex: continuous conversation with barge in' : 'Half Duplex: push to talk'}
              >
                <Radio size={12} />
                <span>{duplexMode === 'full_duplex' ? 'Full Duplex' : 'Half Duplex'}</span>
              </button>

              {/* Voice provider badge */}
              <button
                type="button"
                onClick={toggleVoiceProvider}
                className="wp-agent-prompt"
                style={{
                  fontSize: '0.68rem',
                  padding: '0.15rem 0.55rem',
                  minHeight: '1.5rem',
                  borderRadius: '999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: voiceProvider === 'elevenlabs' ? 'var(--wp-primary-wash)' : 'var(--wp-subpanel)',
                  color: voiceProvider === 'elevenlabs' ? 'var(--wp-primary)' : 'var(--wp-subtext)',
                  borderColor: voiceProvider === 'elevenlabs' ? 'var(--wp-primary)' : 'var(--wp-border)',
                }}
                title={
                  voiceProvider === 'elevenlabs'
                    ? 'Studio Voice: ElevenLabs streaming synthesis with automatic local fallback'
                    : 'Local Browser Voice: zero network speech synthesis'
                }
              >
                <Sparkles size={12} />
                <span>{voiceProvider === 'elevenlabs' ? 'ElevenLabs Voice' : 'Browser Voice'}</span>
              </button>
            </div>
            <p
              className={`wp-agent-chat-status ${
                degradationState === 'offline'
                  ? 'is-offline'
                  : degradationState === 'unavailable'
                  ? 'is-unavailable'
                  : ''
              }`}
              style={{ fontSize: '0.75rem', margin: 0 }}
            >
              {degradationState === 'offline'
                ? 'Offline — voice and remote model paused'
                : degradationState === 'unavailable'
                ? 'Model unavailable — fallback mode active'
                : isInterrupted
                ? '⚡ Barge in detected — listening to your voice...'
                : isUserSpeaking
                ? 'User speaking — streaming speech audio...'
                : isSpeaking
                ? 'Vocalizing agent response...'
                : isListening
                ? duplexMode === 'full_duplex'
                  ? 'Full Duplex live — talk anytime, you can interrupt'
                  : 'Listening to microphone input...'
                : 'Ready to help with chat or voice'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          {/* Audio level meter when active */}
          {isListening && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                height: '1.25rem',
                padding: '0 0.4rem',
                borderRadius: '4px',
                background: 'var(--wp-subpanel)',
                border: '1px solid var(--wp-border)',
              }}
              title="Acoustic audio energy level"
            >
              {[0.2, 0.4, 0.6, 0.8, 1.0].map((threshold, barIndex) => (
                <span
                  key={`audio-bar-${threshold}`}
                  style={{
                    width: '3px',
                    height: `${(barIndex + 1) * 3}px`,
                    borderRadius: '1px',
                    background: audioLevel >= threshold ? 'var(--wp-primary)' : 'var(--wp-border)',
                    transition: 'background 0.08s ease',
                  }}
                />
              ))}
            </div>
          )}

          {/* Vocal feedback toggle */}
          <button
            type="button"
            onClick={() => {
              if (isSpeaking) cancelSpeech();
              setVoicePlaybackEnabled((prev) => !prev);
            }}
            className="wp-icon-btn"
            aria-label={voicePlaybackEnabled ? 'Mute vocal feedback' : 'Enable vocal feedback'}
            title={voicePlaybackEnabled ? 'Vocal feedback enabled' : 'Vocal feedback muted'}
            style={{ width: '2rem', height: '2rem' }}
          >
            {voicePlaybackEnabled ? (
              <Volume2 size={16} color="var(--wp-primary)" />
            ) : (
              <VolumeX size={16} color="var(--wp-subtext)" />
            )}
          </button>
        </div>
      </header>

      {/* Barge in notification banner */}
      {isInterrupted && (
        <div
          style={{
            margin: '0.5rem 1rem 0',
            padding: '0.4rem 0.85rem',
            borderRadius: '0.5rem',
            background: 'var(--wp-primary-wash)',
            border: '1px solid var(--wp-primary-ring)',
            color: 'var(--wp-primary)',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontWeight: 600,
          }}
        >
          <Zap size={14} />
          <span>Barge in detected: Agent paused speech to listen to your voice.</span>
        </div>
      )}

      <div
        className="wp-agent-thread"
        ref={threadRef}
        aria-live="polite"
        style={{ flex: 1, overflowY: 'auto' }}
      >
        {/* Degradation State Banners */}
        {degradationState === 'offline' && (
          <div className="wp-agent-deg-banner wp-agent-deg-banner--offline" role="alert">
            <div className="wp-agent-deg-banner-head">
              <CloudOff size={16} />
              <span>Offline</span>
            </div>
            <p>
              No network connection. Waypoint Agent cannot reach remote inference models. Chat and
              voice interactions are paused until connectivity returns.
            </p>
            {onResetDegradation && (
              <button
                type="button"
                onClick={onResetDegradation}
                className="wp-btn wp-btn-outline"
                style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}
              >
                <RefreshCw size={14} />
                <span>Simulate Online Reconnect</span>
              </button>
            )}
          </div>
        )}

        {degradationState === 'unavailable' && (
          <div className="wp-agent-deg-banner wp-agent-deg-banner--unavailable" role="alert">
            <div className="wp-agent-deg-banner-head">
              <BotOff size={16} />
              <span>Model unavailable</span>
            </div>
            <p>
              The remote reasoning model is temporarily unavailable. Live answers and automated
              actions are paused.
            </p>
            {onResetDegradation && (
              <button
                type="button"
                onClick={onResetDegradation}
                className="wp-btn wp-btn-primary"
                style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}
              >
                <RefreshCw size={14} />
                <span>Retry connection</span>
              </button>
            )}
          </div>
        )}

        {/* Welcome Card */}
        {showWelcome && degradationState === 'ready' && (
          <div className="wp-agent-welcome" data-wp-agent-welcome>
            <div className="wp-agent-msg-row wp-agent-msg-row--agent">
              <span className="wp-agent-msg-avatar" aria-hidden="true">
                <Bot size={16} />
              </span>
              <div className="wp-agent-welcome-card">
                <p>
                  Hi — I am Waypoint Agent. Ask about real time deliveries, live vehicle telemetry,
                  bay constraints, or active dock incidents. You can speak naturally and interrupt anytime.
                </p>
                <div className="wp-agent-suggestions" aria-label="Suggested prompts">
                  {DEFAULT_SUGGESTIONS.map((promptText) => (
                    <button
                      key={promptText}
                      type="button"
                      className="wp-agent-prompt"
                      onClick={() => handleQuery(promptText, false)}
                    >
                      {promptText}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Conversation Thread Messages */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`wp-agent-msg-row wp-agent-msg-row--${msg.sender} ${
              msg.action ? 'wp-agent-msg-row--auth' : ''
            }`}
          >
            {msg.sender === 'agent' && (
              <span className="wp-agent-msg-avatar" aria-hidden="true">
                <Bot size={16} />
              </span>
            )}

            <div className={`wp-agent-msg wp-agent-msg--${msg.sender}`}>
              <div>{msg.text}</div>

              {/* Real time vehicle telemetry card */}
              {msg.telemetryData && typeof msg.telemetryData === 'object' && 'id' in msg.telemetryData && (
                <div
                  style={{
                    marginTop: '0.65rem',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    background: 'var(--wp-panel)',
                    border: '1px solid var(--wp-border-sub)',
                    fontSize: '0.78rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
                      <Truck size={14} color="var(--wp-primary)" />
                      <span>{String(msg.telemetryData.id)}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--wp-subtext)', fontWeight: 400 }}>
                        ({String(msg.telemetryData.driver)})
                      </span>
                    </div>
                    <span
                      style={{
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        background:
                          msg.telemetryData.coldChainStatus === 'breach'
                            ? 'rgba(220, 38, 38, 0.15)'
                            : msg.telemetryData.coldChainStatus === 'warning'
                            ? 'rgba(217, 119, 6, 0.15)'
                            : 'rgba(22, 163, 74, 0.15)',
                        color:
                          msg.telemetryData.coldChainStatus === 'breach'
                            ? '#DC2626'
                            : msg.telemetryData.coldChainStatus === 'warning'
                            ? '#D97706'
                            : '#16A34A',
                      }}
                    >
                      {String(msg.telemetryData.coldChainStatus).toUpperCase()}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', color: 'var(--wp-subtext)' }}>
                    <div>Location: <strong style={{ color: 'var(--wp-heading)' }}>{String(msg.telemetryData.location)}</strong></div>
                    <div>Speed: <strong style={{ color: 'var(--wp-heading)' }}>{String(msg.telemetryData.speedKmH)} km/h</strong></div>
                    {msg.telemetryData.chilledTempC !== undefined && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Thermometer size={12} />
                        <span>Chilled: <strong style={{ color: 'var(--wp-heading)' }}>{String(msg.telemetryData.chilledTempC)}°C</strong></span>
                      </div>
                    )}
                    {msg.telemetryData.frozenTempC !== undefined && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Thermometer size={12} />
                        <span>Freezer: <strong style={{ color: 'var(--wp-heading)' }}>{String(msg.telemetryData.frozenTempC)}°C</strong></span>
                      </div>
                    )}
                    <div>Progress: <strong style={{ color: 'var(--wp-heading)' }}>{String(msg.telemetryData.completedStops)}/{String(msg.telemetryData.totalStops)} stops</strong></div>
                    <div>Assigned Orders: <strong style={{ color: 'var(--wp-heading)' }}>{String(msg.telemetryData.assignedOrders)}</strong></div>
                  </div>
                </div>
              )}

              {/* Real time deliveries summary card */}
              {msg.telemetryData && typeof msg.telemetryData === 'object' && 'totalOrders' in msg.telemetryData && (
                <div
                  style={{
                    marginTop: '0.65rem',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    background: 'var(--wp-panel)',
                    border: '1px solid var(--wp-border-sub)',
                    fontSize: '0.78rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, marginBottom: '0.45rem' }}>
                    <Package size={14} color="var(--wp-primary)" />
                    <span>Operational Deliveries Summary</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.45rem' }}>
                    <div style={{ padding: '0.35rem', background: 'var(--wp-subpanel)', borderRadius: '4px' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--wp-subtext)' }}>Total Orders</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--wp-primary)' }}>{String(msg.telemetryData.totalOrders)}</div>
                    </div>
                    <div style={{ padding: '0.35rem', background: 'var(--wp-subpanel)', borderRadius: '4px' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--wp-subtext)' }}>Confirmed</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#16A34A' }}>{String(msg.telemetryData.confirmedOrders)}</div>
                    </div>
                    <div style={{ padding: '0.35rem', background: 'var(--wp-subpanel)', borderRadius: '4px' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--wp-subtext)' }}>In Transit</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#D97706' }}>{String(msg.telemetryData.inTransitOrders)}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Real time cutoff card */}
              {msg.telemetryData && typeof msg.telemetryData === 'object' && 'minutesRemaining' in msg.telemetryData && (
                <div
                  style={{
                    marginTop: '0.65rem',
                    padding: '0.65rem',
                    borderRadius: '0.5rem',
                    background: 'var(--wp-panel)',
                    border: '1px solid var(--wp-border-sub)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Clock size={16} color="var(--wp-primary)" />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>Cutoff 16:00 SLST</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--wp-subtext)' }}>
                        {String(msg.telemetryData.pendingReviews)} orders pending deferral desk review
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--wp-primary)' }}>
                      {String(msg.telemetryData.minutesRemaining)} min
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic RAG Grounded Sources Inspector */}
              {msg.citations && msg.citations.length > 0 && (
                <div style={{ marginTop: '0.55rem' }}>
                  <button
                    type="button"
                    onClick={() => setExpandedRAGMsgId(expandedRAGMsgId === msg.id ? null : msg.id)}
                    style={{
                      background: 'var(--wp-subpanel)',
                      border: '1px solid var(--wp-border-sub)',
                      borderRadius: '999px',
                      padding: '0.2rem 0.65rem',
                      fontSize: '0.7rem',
                      color: 'var(--wp-primary)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontWeight: 600,
                    }}
                  >
                    <Sparkles size={11} />
                    <span>{msg.citations.length} Operational Sources Cited</span>
                  </button>

                  {expandedRAGMsgId === msg.id && (
                    <div
                      style={{
                        marginTop: '0.45rem',
                        padding: '0.65rem 0.75rem',
                        background: 'var(--wp-panel)',
                        border: '1px solid var(--wp-border-sub)',
                        borderRadius: '0.5rem',
                        fontSize: '0.74rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.4rem',
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          color: 'var(--wp-heading)',
                          fontSize: '0.7rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        RAG Grounding & Operational Sources
                      </div>
                      {msg.citations.map((c) => (
                        <div
                          key={c.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.3rem 0.45rem',
                            borderRadius: '4px',
                            background: 'var(--wp-subpanel)',
                            border: '1px solid var(--wp-border-sub)',
                            gap: '0.5rem',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              minWidth: 0,
                              overflow: 'hidden',
                            }}
                          >
                            <span
                              style={{
                                fontSize: '0.65rem',
                                padding: '0.1rem 0.35rem',
                                borderRadius: '3px',
                                background: 'var(--wp-primary-wash)',
                                color: 'var(--wp-primary)',
                                fontWeight: 700,
                                flexShrink: 0,
                              }}
                            >
                              {c.category}
                            </span>
                            <span
                              style={{
                                fontWeight: 600,
                                color: 'var(--wp-heading)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {c.title}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
                            <span style={{ color: 'var(--wp-subtext)', fontSize: '0.68rem' }}>{c.score}% Match</span>
                            {c.actionUrl && (
                              <button
                                type="button"
                                onClick={() => router.push(c.actionUrl!)}
                                style={{
                                  fontSize: '0.68rem',
                                  color: 'var(--wp-primary)',
                                  textDecoration: 'underline',
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: 0,
                                }}
                              >
                                Open
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Human in the loop action authorization card */}
              {msg.action && (
                <div className="wp-agent-auth-card" style={{ marginTop: '0.75rem' }}>
                  <div className="wp-agent-auth-head">
                    <ShieldCheck size={16} />
                    <strong>Authorization required</strong>
                  </div>
                  <p className="wp-subtext" style={{ margin: '0.25rem 0' }}>
                    I can open <strong>{msg.action.label}</strong> for you.
                  </p>
                  <p className="wp-agent-auth-desc">{msg.action.description}</p>
                  <div className="wp-agent-auth-actions">
                    <button
                      type="button"
                      className="wp-btn wp-btn-primary"
                      onClick={() => handleAllowAction(msg.action!, msg.fromVoice)}
                    >
                      Allow
                    </button>
                    <button
                      type="button"
                      className="wp-btn wp-btn-outline"
                      onClick={() => handleDenyAction(msg.fromVoice)}
                    >
                      Deny
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="wp-agent-msg-row wp-agent-msg-row--agent">
            <span className="wp-agent-msg-avatar" aria-hidden="true">
              <Bot size={16} />
            </span>
            <div className="wp-agent-msg wp-agent-msg--agent" style={{ fontStyle: 'italic' }}>
              Querying dynamic operational RAG index and telemetry streams...
            </div>
          </div>
        )}
      </div>

      {/* Composer */}
      <form className="wp-agent-composer" onSubmit={handleFormSubmit}>
        <input
          ref={inputRef}
          className="wp-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            degradationState === 'offline'
              ? 'Offline — messaging paused'
              : degradationState === 'unavailable'
              ? 'Model unavailable — retry to continue'
              : isListening && duplexMode === 'full_duplex'
              ? 'Full Duplex live — talk freely or type here…'
              : 'Message Waypoint Agent…'
          }
          disabled={isDegraded || loading}
          autoComplete="off"
          aria-label="Message the agent"
        />

        <button
          type="button"
          onClick={handleMicToggle}
          className={`wp-btn wp-btn-outline wp-agent-mic ${isListening ? 'is-listening' : ''}`}
          aria-label={
            !voiceSupported
              ? 'Voice input unavailable in browser'
              : isListening
              ? duplexMode === 'full_duplex'
                ? 'Full Duplex session active — click to stop'
                : 'Listening...'
              : 'Ask with voice'
          }
          aria-pressed={isListening}
          disabled={isDegraded || !voiceSupported}
          title={
            !voiceSupported
              ? 'Voice recognition not supported in this browser'
              : isListening
              ? duplexMode === 'full_duplex'
                ? 'Full Duplex active with instant barge in — click to stop'
                : 'Listening to microphone'
              : 'Ask with voice'
          }
        >
          <Mic size={16} />
        </button>

        <button
          type="submit"
          className="wp-btn wp-btn-primary"
          aria-label="Send message"
          disabled={isDegraded || loading || !input.trim()}
        >
          <ArrowUp size={16} />
        </button>
      </form>
    </section>
  );
}
