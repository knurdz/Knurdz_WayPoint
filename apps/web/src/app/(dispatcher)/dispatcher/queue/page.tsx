'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import OrderQueueTable from '@/components/dispatcher/OrderQueueTable';
import { LayoutGrid, Clock } from 'lucide-react';

export default function OrderQueuePage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dispatcher/orders')
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* Cutoff Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 24px',
        borderRadius: 12,
        background: 'var(--wp-panel, #FFFFFF)',
        border: '1px solid var(--wp-border, rgba(0,0,0,0.08))',
        marginBottom: 24,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{
              padding: '2px 8px',
              borderRadius: 6,
              background: 'rgba(37, 99, 235, 0.1)',
              color: '#2563EB',
              fontSize: 11,
              fontWeight: 700,
            }}>
              Demand Staged
            </span>
            <span style={{ fontSize: 13, color: 'var(--wp-muted, #6E838A)' }}>
              142 orders in current operational cycle
            </span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: 'var(--wp-heading, #1A1C1C)' }}>
            Order Intake & Dispatch Queue
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 11, color: 'var(--wp-muted, #6E838A)', textTransform: 'uppercase' }}>
              Allocated vs Pending
            </span>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--wp-heading, #1A1C1C)' }}>
              138 / 142
            </div>
          </div>

          <Link
            href="/dispatcher/allocation"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              borderRadius: 8,
              background: 'var(--wp-primary, #377A8B)',
              color: '#FFFFFF',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <LayoutGrid size={16} />
            <span>Open Carrier Board</span>
          </Link>
        </div>
      </div>

      {/* Metric Summary Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
        marginBottom: 24,
      }}>
        <div style={{ background: 'var(--wp-panel, #FFFFFF)', border: '1px solid var(--wp-border, rgba(0,0,0,0.08))', borderRadius: 10, padding: '16px 20px' }}>
          <span style={{ fontSize: 12, color: 'var(--wp-muted, #6E838A)' }}>Total Inflow</span>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--wp-heading, #1A1C1C)', marginTop: 4 }}>142</div>
          <span style={{ fontSize: 11, color: 'var(--wp-subtext, #3E555C)' }}>100% Demand Ingested</span>
        </div>
        <div style={{ background: 'var(--wp-panel, #FFFFFF)', border: '1px solid var(--wp-border, rgba(0,0,0,0.08))', borderRadius: 10, padding: '16px 20px' }}>
          <span style={{ fontSize: 12, color: 'var(--wp-muted, #6E838A)' }}>Reefer / Chilled</span>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#2563EB', marginTop: 4 }}>48</div>
          <span style={{ fontSize: 11, color: 'var(--wp-subtext, #3E555C)' }}>Strict Temperature Control</span>
        </div>
        <div style={{ background: 'var(--wp-panel, #FFFFFF)', border: '1px solid var(--wp-border, rgba(0,0,0,0.08))', borderRadius: 10, padding: '16px 20px' }}>
          <span style={{ fontSize: 12, color: 'var(--wp-muted, #6E838A)' }}>Van Only Restricted</span>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#D97706', marginTop: 4 }}>26</div>
          <span style={{ fontSize: 11, color: 'var(--wp-subtext, #3E555C)' }}>Narrow Mountain Alleyways</span>
        </div>
        <div style={{ background: 'var(--wp-panel, #FFFFFF)', border: '1px solid var(--wp-border, rgba(0,0,0,0.08))', borderRadius: 10, padding: '16px 20px' }}>
          <span style={{ fontSize: 12, color: 'var(--wp-muted, #6E838A)' }}>Mall Bay Windows</span>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--wp-heading, #1A1C1C)', marginTop: 4 }}>18</div>
          <span style={{ fontSize: 11, color: 'var(--wp-subtext, #3E555C)' }}>Fixed Time Unloading Bays</span>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--wp-muted, #6E838A)' }}>
          Loading staged orders...
        </div>
      ) : (
        <OrderQueueTable initialOrders={orders} />
      )}
    </div>
  );
}
