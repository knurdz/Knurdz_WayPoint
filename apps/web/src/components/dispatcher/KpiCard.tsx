'use client';

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string | number;
  subtext: string;
  trend?: string;
  trendUp?: boolean;
}

export default function KpiCard({
  label,
  value,
  subtext,
  trend,
  trendUp = true,
}: KpiCardProps) {
  return (
    <article
      style={{
        background: 'var(--wp-panel, #FFFFFF)',
        border: '1px solid var(--wp-border, rgba(0,0,0,0.08))',
        borderRadius: 12,
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--wp-muted, #6E838A)' }}>
          {label}
        </span>
        {trend && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 12,
              background: trendUp ? 'rgba(22, 163, 74, 0.12)' : 'rgba(220, 38, 38, 0.12)',
              color: trendUp ? '#16A34A' : '#DC2626',
            }}
          >
            {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend}
          </span>
        )}
      </div>

      <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--wp-heading, #1A1C1C)', lineHeight: 1.1 }}>
        {value}
      </div>

      <div style={{ fontSize: 12, color: 'var(--wp-subtext, #3E555C)' }}>
        {subtext}
      </div>
    </article>
  );
}
