'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight } from 'lucide-react';

interface ColdChainAlertProps {
  reeferDemand: number;
  reeferCapacity: number;
  depot: string;
}

export default function ColdChainAlert({
  reeferDemand = 24,
  reeferCapacity = 16,
  depot = 'Peliyagoda Hub',
}: ColdChainAlertProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        borderRadius: 10,
        background: 'rgba(217, 119, 6, 0.08)',
        border: '1px solid rgba(217, 119, 6, 0.25)',
        color: '#D97706',
        marginBottom: 24,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'rgba(217, 119, 6, 0.16)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <AlertTriangle size={18} />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--wp-heading, #1A1C1C)' }}>
            Cold Chain Capacity Alert · {depot}
          </div>
          <div style={{ fontSize: 12, color: 'var(--wp-subtext, #3E555C)' }}>
            {reeferDemand} chilled orders requested against {reeferCapacity} available reefer vehicles. High risk of DEF 02 deferrals.
          </div>
        </div>
      </div>

      <Link
        href="/dispatcher/allocation"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 14px',
          borderRadius: 8,
          background: '#D97706',
          color: '#FFFFFF',
          fontSize: 12,
          fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        <span>Prioritize Chilled Fleet</span>
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}
