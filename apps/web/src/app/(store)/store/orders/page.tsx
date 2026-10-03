'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Route, PackageOpen, BellOff, Plus, Filter, Search, ArrowRight } from 'lucide-react';

interface StoreOrder {
  id: string;
  date: string;
  temp: 'Chilled' | 'Ambient' | 'Frozen';
  volume: number;
  status: 'In transit' | 'Delivered' | 'Deferred';
  actionUrl: string;
  actionLabel: string;
}

const ORDERS: StoreOrder[] = [
  {
    id: 'ORD009876',
    date: '30 Sep 2026',
    temp: 'Chilled',
    volume: 1.45,
    status: 'In transit',
    actionUrl: '/store/tracking',
    actionLabel: 'Track',
  },
  {
    id: 'ORD009850',
    date: '29 Sep 2026',
    temp: 'Ambient',
    volume: 3.20,
    status: 'Delivered',
    actionUrl: '/store/receipt',
    actionLabel: 'Receipt',
  },
  {
    id: 'ORD009801',
    date: '27 Sep 2026',
    temp: 'Chilled',
    volume: 2.10,
    status: 'Deferred',
    actionUrl: '/store/deferral',
    actionLabel: 'Notice',
  },
  {
    id: 'ORD009765',
    date: '25 Sep 2026',
    temp: 'Ambient',
    volume: 4.80,
    status: 'Delivered',
    actionUrl: '/store/receipt',
    actionLabel: 'Receipt',
  },
  {
    id: 'ORD009720',
    date: '23 Sep 2026',
    temp: 'Frozen',
    volume: 0.95,
    status: 'Delivered',
    actionUrl: '/store/receipt',
    actionLabel: 'Receipt',
  },
];

export default function StoreOrdersPage() {
  const [filter, setFilter] = useState<'All' | 'In transit' | 'Delivered' | 'Deferred'>('All');
  const [search, setSearch] = useState('');

  const filteredOrders = ORDERS.filter((order) => {
    const matchesFilter = filter === 'All' || order.status === filter;
    const matchesSearch =
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.temp.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <main className="wp-main">
      <div className="screen-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <span className="wp-label" style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>
            SM 02 · OUT001
          </span>
          <h1 className="wp-headline-md" style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 700 }}>
            Order History
          </h1>
          <p className="wp-subtext" style={{ margin: '2px 0 0', color: '#64748B', fontSize: 13 }}>
            Past shipments and current transit logs for Fresh Galle Rd
          </p>
        </div>
        <Link
          href="/store/order"
          className="wp-btn wp-btn-primary"
          style={{
            padding: '8px 16px',
            fontSize: 13,
            background: '#377A8B',
            color: '#FFFFFF',
            borderRadius: 8,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Plus size={16} /> Place Order
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['All', 'In transit', 'Delivered', 'Deferred'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: filter === tab ? '1px solid #377A8B' : '1px solid #CBD5E1',
                background: filter === tab ? '#377A8B' : '#FFFFFF',
                color: filter === tab ? '#FFFFFF' : '#475569',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: 220 }}>
          <input
            type="text"
            placeholder="Search order ID or temp..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px',
              borderRadius: 6,
              border: '1px solid #CBD5E1',
              fontSize: 12,
            }}
          />
        </div>
      </div>

      <section
        className="wp-panel screen-panel"
        style={{
          background: '#FFFFFF',
          borderRadius: 12,
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <div className="wp-table-wrap" style={{ overflowX: 'auto' }}>
          <table className="wp-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', color: '#64748B', fontSize: 12 }}>
                <th style={{ padding: '12px 16px' }}>Order ID</th>
                <th style={{ padding: '12px 16px' }}>Delivery Date</th>
                <th style={{ padding: '12px 16px' }}>Temperature</th>
                <th style={{ padding: '12px 16px' }}>Volume (m³)</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((ord) => (
                <tr key={ord.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontWeight: 700, color: '#0F172A' }}>
                    {ord.id}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#475569' }}>{ord.date}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600,
                        background:
                          ord.temp === 'Chilled'
                            ? 'rgba(55, 122, 139, 0.1)'
                            : ord.temp === 'Frozen'
                            ? 'rgba(109, 40, 217, 0.1)'
                            : 'rgba(100, 116, 139, 0.1)',
                        color:
                          ord.temp === 'Chilled'
                            ? '#377A8B'
                            : ord.temp === 'Frozen'
                            ? '#6D28D9'
                            : '#475569',
                      }}
                    >
                      {ord.temp}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontFamily: 'monospace' }}>{ord.volume.toFixed(2)}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: 9999,
                        fontSize: 11,
                        fontWeight: 700,
                        background:
                          ord.status === 'In transit'
                            ? 'rgba(37, 99, 235, 0.1)'
                            : ord.status === 'Delivered'
                            ? 'rgba(5, 150, 105, 0.1)'
                            : 'rgba(217, 119, 6, 0.1)',
                        color:
                          ord.status === 'In transit'
                            ? '#2563EB'
                            : ord.status === 'Delivered'
                            ? '#059669'
                            : '#D97706',
                      }}
                    >
                      {ord.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <Link
                      href={ord.actionUrl}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        color: '#377A8B',
                        fontWeight: 600,
                        textDecoration: 'none',
                        fontSize: 12,
                      }}
                    >
                      {ord.actionLabel} <ArrowRight size={12} />
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '32px 16px', textAlign: 'center', color: '#64748B' }}>
                    No matching orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
