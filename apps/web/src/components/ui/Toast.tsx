'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, duration = 4000 }: Omit<ToastMessage, 'id'>) => {
      const id = String(Date.now() + Math.random());
      setToasts((prev) => [...prev, { id, type, title, message, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <aside
        aria-label="Notifications"
        aria-live="polite"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          maxWidth: 380,
          width: '100%',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((t) => {
          let bg = '#FFFFFF';
          let border = '#E2E8F0';
          let iconColor = '#377A8B';
          let IconComp = Info;

          if (t.type === 'success') {
            border = '#059669';
            iconColor = '#059669';
            IconComp = CheckCircle2;
          } else if (t.type === 'warning') {
            border = '#D97706';
            iconColor = '#D97706';
            IconComp = AlertTriangle;
          } else if (t.type === 'error') {
            border = '#DC2626';
            iconColor = '#DC2626';
            IconComp = AlertCircle;
          }

          return (
            <div
              key={t.id}
              role="alert"
              style={{
                pointerEvents: 'auto',
                background: bg,
                border: `1px solid ${border}`,
                borderLeft: `4px solid ${iconColor}`,
                borderRadius: 8,
                padding: '12px 14px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
              }}
            >
              <IconComp size={18} style={{ color: iconColor, flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{t.title}</div>
                {t.message && (
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{t.message}</div>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                aria-label="Dismiss notification"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: 2,
                }}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </aside>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: () => {},
      removeToast: () => {},
    };
  }
  return context;
}
