'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import OrderQueueTable from '@/components/dispatcher/OrderQueueTable';
import { LayoutGrid, Clock } from 'lucide-react';

export default function OrderQueuePage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [day, setDay] = useState<'today' | 'tomorrow'>('today');

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
    <div data-wp-day-scope>
      {/* Cutoff Timeline and Late Order Banner */}
      <div className="wp-cutoff-banner" style={{ marginBottom: '1.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
            <span className="wp-state-text wp-state-info">Demand Staged</span>
            <span className="wp-subtext" style={{ fontSize: '0.8rem' }}>142 orders today</span>
          </div>
          <h1 className="wp-headline-md" style={{ margin: 0 }}>Order Intake &amp; Dispatch Queue</h1>
          <div className="wp-day-switcher" style={{ marginTop: '0.75rem' }}>
            <button
              type="button"
              className={`wp-day-btn ${day === 'today' ? 'active' : ''}`}
              onClick={() => setDay('today')}
              aria-pressed={day === 'today'}
            >
              Today <span className="wp-day-badge">Live</span>
            </button>
            <button
              type="button"
              className={`wp-day-btn ${day === 'tomorrow' ? 'active' : ''}`}
              onClick={() => setDay('tomorrow')}
              aria-pressed={day === 'tomorrow'}
            >
              Tomorrow planning <span className="wp-day-badge">Evening</span>
            </button>
          </div>
        </div>
        <div className="wp-cutoff-banner__actions">
          <div className="wp-cutoff-banner__metric">
            <span className="wp-label" style={{ fontSize: '0.7rem' }}>Allocated vs Pending</span>
            <div className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--wp-heading)' }}>138 / 142</div>
          </div>
          <Link href="/dispatcher/allocation" className="wp-btn wp-btn-primary">
            <LayoutGrid size={15} />
            <span>Allocation Board</span>
          </Link>
          <Link href="/dispatcher/deferral" className="wp-btn wp-btn-outline">
            <Clock size={15} />
            <span>Deferral Panel</span>
          </Link>
        </div>
      </div>

      {/* Metric Summary Row */}
      <div className="wp-kpi-row" style={{ marginBottom: '1.75rem' }}>
        <div className="wp-kpi">
          <span className="wp-label">Total Inflow</span>
          <p className="wp-kpi-value">142</p>
          <span className="wp-subtext" style={{ fontSize: '0.75rem', marginTop: '0.4rem' }}>100% Demand Ingested</span>
        </div>
        <div className="wp-kpi">
          <span className="wp-label">Reefer / Chilled</span>
          <p className="wp-kpi-value" style={{ color: 'var(--wp-info)' }}>48</p>
          <span className="wp-subtext" style={{ fontSize: '0.75rem', marginTop: '0.4rem' }}>Strict Temperature Control</span>
        </div>
        <div className="wp-kpi">
          <span className="wp-label">Van Only Restricted</span>
          <p className="wp-kpi-value" style={{ color: 'var(--wp-primary)' }}>26</p>
          <span className="wp-subtext" style={{ fontSize: '0.75rem', marginTop: '0.4rem' }}>Narrow Urban Alleyways</span>
        </div>
        <div className="wp-kpi">
          <span className="wp-label">Mall Bay Windows</span>
          <p className="wp-kpi-value">18</p>
          <span className="wp-subtext" style={{ fontSize: '0.75rem', marginTop: '0.4rem' }}>Fixed Time Unloading</span>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--wp-muted)' }}>
          Loading staged orders...
        </div>
      ) : (
        <OrderQueueTable initialOrders={orders} />
      )}
    </div>
  );
}
