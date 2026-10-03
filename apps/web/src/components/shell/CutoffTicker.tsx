'use client';

import React from 'react';
import { useCutoffCountdown } from '@/hooks/useCutoffCountdown';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function CutoffTicker() {
  const { formatted, isPastCutoff, urgency, mounted } = useCutoffCountdown();

  if (!mounted) {
    return (
      <div
        title="16:00:00 SLST Daily Order Cutoff Freeze"
        suppressHydrationWarning
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '5px 12px',
          borderRadius: 8,
          background: 'var(--wp-subpanel, #F8F8F7)',
          border: '1px solid var(--wp-border, rgba(0,0,0,0.08))',
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--wp-muted, #6E838A)',
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '0.02em',
        }}
      >
        <Clock size={15} color="var(--wp-muted, #6E838A)" />
        <span suppressHydrationWarning>16:00 SLST Cutoff</span>
      </div>
    );
  }

  let bg = 'var(--wp-subpanel, #F8F8F7)';
  let border = 'var(--wp-border, rgba(0,0,0,0.08))';
  let color = 'var(--wp-heading, #1A1C1C)';
  let iconColor = 'var(--wp-primary, #377A8B)';

  if (urgency === 'critical') {
    bg = 'rgba(220, 38, 38, 0.12)';
    border = 'rgba(220, 38, 38, 0.3)';
    color = '#DC2626';
    iconColor = '#DC2626';
  } else if (urgency === 'warning') {
    bg = 'rgba(217, 119, 6, 0.12)';
    border = 'rgba(217, 119, 6, 0.3)';
    color = '#D97706';
    iconColor = '#D97706';
  } else if (isPastCutoff) {
    bg = 'rgba(110, 131, 138, 0.12)';
    border = 'rgba(110, 131, 138, 0.25)';
    color = 'var(--wp-muted, #6E838A)';
    iconColor = 'var(--wp-muted, #6E838A)';
  }

  return (
    <div
      title="16:00:00 SLST Daily Order Cutoff Freeze"
      suppressHydrationWarning
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '5px 12px',
        borderRadius: 8,
        background: bg,
        border: `1px solid ${border}`,
        fontSize: 12,
        fontWeight: 600,
        color: color,
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '0.02em',
      }}
    >
      {urgency === 'critical' ? (
        <AlertTriangle size={15} color={iconColor} className="animate-pulse" />
      ) : isPastCutoff ? (
        <CheckCircle2 size={15} color={iconColor} />
      ) : (
        <Clock size={15} color={iconColor} />
      )}

      <span suppressHydrationWarning>
        {isPastCutoff ? (
          'Orders Frozen (Past 16:00)'
        ) : (
          <>
            <span style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--wp-muted, #6E838A)', marginRight: 4 }}>
              Cutoff in
            </span>
            <strong>{formatted}</strong>
          </>
        )}
      </span>
    </div>
  );
}
