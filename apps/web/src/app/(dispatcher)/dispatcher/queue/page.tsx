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
    const controller = new AbortController();
    fetch('/api/dispatcher/orders', { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if ((err as Error)?.name !== 'AbortError') {
          setLoading(false);
        }
      });
    return () => {
      controller.abort();
    };
  }, []);

  const totalOrders = orders.length;
  const reeferOrders = orders.filter((o) => o.tempRequirement === 'chilled' || o.tempRequirement === 'reefer').length;
  const vanOnlyOrders = orders.filter((o) => o.parkingConstraint === 'van_only').length;
  const mallWindowOrders = orders.filter((o) => o.dockType === 'mall' || o.window?.includes('05:00')).length;
  const allocatedOrders = orders.filter((o) => o.status === 'allocated' || o.status === 'in_transit' || o.status === 'delivered').length;

  return (
    <div data-wp-day-scope>
      {/* Cutoff Timeline and Late Order Banner */}
      <div className="wp-cutoff-banner" style={{ marginBottom: '1.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
            <span className="wp-state-text wp-state-info">Demand Staged</span>
            <span className="wp-subtext" style={{ fontSize: '0.8rem' }}>{totalOrders} orders in intake registry</span>
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
            <span className="wp-label" style={{ fontSize: '0.7rem' }}>Allocated vs Staged</span>
            <div className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--wp-heading)' }}>
              {allocatedOrders} / {totalOrders}
            </div>
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
          <p className="wp-kpi-value">{totalOrders}</p>
          <span className="wp-subtext" style={{ fontSize: '0.75rem', marginTop: '0.4rem' }}>100% Demand Ingested</span>
        </div>
        <div className="wp-kpi">
          <span className="wp-label">Reefer / Chilled</span>
          <p className="wp-kpi-value" style={{ color: 'var(--wp-info)' }}>{reeferOrders}</p>
          <span className="wp-subtext" style={{ fontSize: '0.75rem', marginTop: '0.4rem' }}>Strict Temperature Control</span>
        </div>
        <div className="wp-kpi">
          <span className="wp-label">Van Only Restricted</span>
          <p className="wp-kpi-value" style={{ color: 'var(--wp-primary)' }}>{vanOnlyOrders}</p>
          <span className="wp-subtext" style={{ fontSize: '0.75rem', marginTop: '0.4rem' }}>Narrow Urban Alleyways</span>
        </div>
        <div className="wp-kpi">
          <span className="wp-label">Mall Bay Windows</span>
          <p className="wp-kpi-value">{mallWindowOrders}</p>
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
