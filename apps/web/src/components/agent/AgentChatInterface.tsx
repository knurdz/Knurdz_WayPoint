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
} from 'lucide-react';
import { useVoiceAgent } from '@/hooks/useVoiceAgent';
import { useAgent } from './AgentContext';

export interface ActionDefinition {
  id: string;
  label: string;
  href: string;
  description: string;
  status: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  time: string;
  action?: ActionDefinition;
  fromVoice?: boolean;
}

interface AgentChatInterfaceProps {
  degradationState?: 'ready' | 'offline' | 'unavailable';
  onResetDegradation?: () => void;
  onNavigateComplete?: () => void;
  isDrawer?: boolean;
}

const DEFAULT_SUGGESTIONS = [
  'How many orders today?',
  'What is the cutoff time?',
  'Open exceptions',
  'Open fleet allocation',
  'Review warehouse dock',
  'Explain Rule 01 maximum payload',
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

  const threadRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    isListening,
    isSpeaking,
    isSupported: voiceSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  } = useVoiceAgent();

  const isDegraded = degradationState !== 'ready';

  // Scroll to bottom when messages update
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages, showWelcome]);

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
          fromVoice,
        };

        setMessages((prev) => [...prev, agentMsg]);

        // Vocalize response if originated from voice or voice feedback is enabled
        if ((fromVoice || voicePlaybackEnabled) && replyText) {
          speak(replyText);
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
    [loading, isDegraded, voicePlaybackEnabled, speak]
  );

  const handleMicClick = () => {
    if (isDegraded || !voiceSupported) return;

    if (isListening) {
      stopListening();
    } else {
      stopSpeaking();
      startListening((transcript) => {
        handleQuery(transcript, true);
      });
    }
  };

  const handleAllowAction = (action: ActionDefinition, fromVoice?: boolean) => {
    setLive(true, action.status);
    if (fromVoice && voicePlaybackEnabled) {
      speak(`Opening ${action.label}`);
    }
    if (onNavigateComplete) {
      onNavigateComplete();
    }
    router.push(action.href);
  };

  const handleDenyAction = (fromVoice?: boolean) => {
    const denyReply =
      "Understood. I will not navigate without your approval. Ask me anything else or request another operation.";
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
      speak(denyReply);
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
      <header className="wp-agent-chat-head" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="wp-agent-chat-avatar" aria-hidden="true">
            <Bot size={20} />
          </div>
          <div>
            <h1 className="wp-agent-chat-title" style={{ fontSize: '1rem', margin: 0 }}>
              Waypoint Agent
            </h1>
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
                : isListening
                ? 'Listening to microphone input...'
                : isSpeaking
                ? 'Vocalizing agent response...'
                : 'Ready to help with chat or voice'}
            </p>
          </div>
        </div>

        {/* Voice audio playback toggle */}
        <button
          type="button"
          onClick={() => {
            if (isSpeaking) stopSpeaking();
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
      </header>

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

        {/* Welcome Card matching prototype */}
        {showWelcome && degradationState === 'ready' && (
          <div className="wp-agent-welcome" data-wp-agent-welcome>
            <div className="wp-agent-msg-row wp-agent-msg-row--agent">
              <span className="wp-agent-msg-avatar" aria-hidden="true">
                <Bot size={16} />
              </span>
              <div className="wp-agent-welcome-card">
                <p>
                  Hi — I am Waypoint Agent. Ask about today operations or request a screen change.
                  Navigation actions need your approval.
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
              Thinking and verifying operational constraints...
            </div>
          </div>
        )}
      </div>

      {/* Composer matching prototype */}
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
              : 'Message Waypoint Agent…'
          }
          disabled={isDegraded || loading}
          autoComplete="off"
          aria-label="Message the agent"
        />

        <button
          type="button"
          onClick={handleMicClick}
          className={`wp-btn wp-btn-outline wp-agent-mic ${isListening ? 'is-listening' : ''}`}
          aria-label={
            !voiceSupported
              ? 'Voice input unavailable in browser'
              : isListening
              ? 'Listening...'
              : 'Ask with voice'
          }
          aria-pressed={isListening}
          disabled={isDegraded || !voiceSupported}
          title={
            !voiceSupported
              ? 'Voice recognition not supported in this browser'
              : isListening
              ? 'Listening to microphone'
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
