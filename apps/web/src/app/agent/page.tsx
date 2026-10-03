'use client';

import React, { useState } from 'react';
import AppShell from '@/components/shell/AppShell';
import { Bot, Mic, ArrowUp, Send, CheckCircle2, AlertTriangle, WifiOff, Sparkles } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  time: string;
  actionUrl?: string;
  category?: string;
}

const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    sender: 'agent',
    text: 'Hello. I am the Waypoint Logistics Copilot. Ask me about fleet capacity rules, outlet bay physical constraints, cold chain limits, or late cutoff policies.',
    time: '12:00',
  },
];

const SUGGESTIONS = [
  'Explain Rule 01 maximum payload capacity',
  'What are the bay constraints for OUT001?',
  'Why is OUT003 restricted to vans?',
  'What is the cutoff policy for Peliyagoda?',
];

export default function AgentPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(DEFAULT_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [degradationState, setDegradationState] = useState<'ready' | 'offline' | 'unavailable'>('ready');
  const [isListening, setIsListening] = useState(false);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    if (degradationState === 'offline') {
      const userMsg: ChatMessage = {
        id: String(Date.now()),
        sender: 'user',
        text: query,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      const offlineMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'agent',
        text: 'Agent is operating in offline mode. Remote model inference is disabled. Local knowledge cache remains active for standard queries.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, userMsg, offlineMsg]);
      setInput('');
      return;
    }

    if (degradationState === 'unavailable') {
      const userMsg: ChatMessage = {
        id: String(Date.now()),
        sender: 'user',
        text: query,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      const unavailMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'agent',
        text: 'Language model service is currently unavailable. Operating in rule lookup fallback mode.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, userMsg, unavailMsg]);
      setInput('');
      return;
    }

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();

      const agentMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'agent',
        text: data.reply || 'No response generated.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionUrl: data.actionUrl,
        category: data.category,
      };
      setMessages((prev) => [...prev, agentMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'agent',
        text: 'Service communication error. Local rule evaluator active.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const toggleMic = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        handleSend('Check fleet allocation status for Peliyagoda');
      }, 1800);
    }
  };

  return (
    <AppShell role="dispatcher" userName="Nimal Perera" depot="Peliyagoda Hub">
      <main className="wp-main wp-agent-page">
        <div className="wp-agent-shell">
          <div className="screen-sync-states wp-agent-deg-states" role="tablist" aria-label="Agent degradation states">
            <button
              type="button"
              className={`screen-sync-state ${degradationState === 'ready' ? 'active' : ''}`}
              onClick={() => setDegradationState('ready')}
              style={{
                background: degradationState === 'ready' ? 'var(--wp-primary, #377A8B)' : 'transparent',
                color: degradationState === 'ready' ? '#FFFFFF' : 'inherit',
                borderRadius: 6,
                padding: '6px 14px',
                border: '1px solid rgba(0,0,0,0.1)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 12,
              }}
            >
              Ready
            </button>
            <button
              type="button"
              className={`screen-sync-state ${degradationState === 'offline' ? 'active' : ''}`}
              onClick={() => setDegradationState('offline')}
              style={{
                background: degradationState === 'offline' ? '#D97706' : 'transparent',
                color: degradationState === 'offline' ? '#FFFFFF' : 'inherit',
                borderRadius: 6,
                padding: '6px 14px',
                border: '1px solid rgba(0,0,0,0.1)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 12,
              }}
            >
              Offline
            </button>
            <button
              type="button"
              className={`screen-sync-state ${degradationState === 'unavailable' ? 'active' : ''}`}
              onClick={() => setDegradationState('unavailable')}
              style={{
                background: degradationState === 'unavailable' ? '#DC2626' : 'transparent',
                color: degradationState === 'unavailable' ? '#FFFFFF' : 'inherit',
                borderRadius: 6,
                padding: '6px 14px',
                border: '1px solid rgba(0,0,0,0.1)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 12,
              }}
            >
              Model unavailable
            </button>
          </div>

          <section className="wp-agent-chat" aria-label="Agent conversation">
            <header className="wp-agent-chat-head">
              <div className="wp-agent-chat-avatar" aria-hidden="true">
                <Bot size={24} />
              </div>
              <div>
                <h1 className="wp-agent-chat-title" style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
                  Waypoint Agent
                </h1>
                <p className="wp-agent-chat-status" style={{ fontSize: 12, color: 'var(--text-muted, #64748B)', margin: 0 }}>
                  {degradationState === 'ready' && 'Ready to assist with real time logistics optimization'}
                  {degradationState === 'offline' && 'Offline mode active, cached heuristics enabled'}
                  {degradationState === 'unavailable' && 'Degraded mode, fallback rules active'}
                </p>
              </div>
            </header>

            <div
              className="wp-agent-thread"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                padding: '16px 0',
                minHeight: 320,
                maxHeight: 520,
                overflowY: 'auto',
              }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '75%',
                      padding: '12px 16px',
                      borderRadius: 12,
                      background: msg.sender === 'user' ? '#377A8B' : 'rgba(55, 122, 139, 0.08)',
                      color: msg.sender === 'user' ? '#FFFFFF' : 'inherit',
                      fontSize: 14,
                      lineHeight: 1.5,
                      border: msg.sender === 'agent' ? '1px solid rgba(55, 122, 139, 0.2)' : 'none',
                    }}
                  >
                    <div>{msg.text}</div>
                    {msg.actionUrl && (
                      <div style={{ marginTop: 8 }}>
                        <a
                          href={msg.actionUrl}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 12,
                            fontWeight: 600,
                            color: msg.sender === 'user' ? '#E2E8F0' : '#377A8B',
                            textDecoration: 'underline',
                          }}
                        >
                          View related screen →
                        </a>
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: 10, color: '#94A3B8', marginTop: 4 }}>{msg.time}</span>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748B', fontSize: 13 }}>
                  <Sparkles size={16} className="animate-spin" />
                  <span>Evaluating constraints and knowledge base...</span>
                </div>
              )}
            </div>

            <div style={{ marginBottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {SUGGESTIONS.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => handleSend(sug)}
                  style={{
                    fontSize: 11,
                    padding: '6px 10px',
                    borderRadius: 8,
                    background: 'rgba(0,0,0,0.03)',
                    border: '1px solid rgba(0,0,0,0.08)',
                    cursor: 'pointer',
                    color: '#334155',
                  }}
                >
                  {sug}
                </button>
              ))}
            </div>

            <form
              className="wp-agent-composer"
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              style={{ display: 'flex', gap: 8 }}
            >
              <input
                className="wp-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Waypoint Agent about rules, vehicles, or outlets..."
                style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #CBD5E1' }}
              />
              <button
                type="button"
                className={`wp-btn wp-btn-outline ${isListening ? 'is-listening' : ''}`}
                onClick={toggleMic}
                aria-label="Ask with voice"
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: isListening ? '2px solid #DC2626' : '1px solid #CBD5E1',
                  background: isListening ? 'rgba(220, 38, 38, 0.1)' : 'transparent',
                  color: isListening ? '#DC2626' : 'inherit',
                  cursor: 'pointer',
                }}
              >
                <Mic size={18} />
              </button>
              <button
                type="submit"
                className="wp-btn wp-btn-primary"
                disabled={loading || !input.trim()}
                style={{
                  padding: '10px 16px',
                  borderRadius: 8,
                  background: '#377A8B',
                  color: '#FFFFFF',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <ArrowUp size={18} />
              </button>
            </form>
          </section>
        </div>
      </main>
    </AppShell>
  );
}
