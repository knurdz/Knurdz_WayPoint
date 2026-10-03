'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, Clock, Phone, AlertCircle, Camera, MessageSquareWarning, Package, CheckCircle2 } from 'lucide-react';

interface StopItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
}

const ITEMS: StopItem[] = [
  { id: 'SKU01', name: 'Dairy Pasteurized Milk 1L', quantity: 42, unit: 'cases', category: 'Chilled' },
  { id: 'SKU02', name: 'Traditional Buffalo Curd Clay Pots', quantity: 18, unit: 'trays', category: 'Chilled' },
  { id: 'SKU03', name: 'Vanilla Bean Ice Cream Tubs', quantity: 6, unit: 'tubs', category: 'Frozen' },
];

export default function DriverStopPage() {
  const [activeStopIndex, setActiveStopIndex] = useState(1);

  return (
    <main className="wp-main">
      <div className="screen-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <span className="wp-label" style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>
            DRV 03 · Stop 2 of 4
          </span>
          <h1 className="wp-headline-md" style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 700 }}>
            OUT001 Fresh Galle Rd
          </h1>
          <p className="wp-subtext" style={{ margin: '2px 0 0', color: '#64748B', fontSize: 13 }}>
            Scheduled Arrival: 06:15 SLST · Estimated Window: 05:00 to 07:30
          </p>
        </div>
        <Link
          href="/driver/pod"
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
          <Camera size={14} /> Capture POD
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        <section
          className="wp-panel screen-panel"
          style={{
            background: '#FFFFFF',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            padding: 20,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>
            Access & Bay Constraints
          </h2>

          <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8, fontSize: 14, color: '#334155' }}>
            <li>
              <strong>Physical constraint:</strong> van_only · curb unload · 3.2 m clearance
            </li>
            <li>
              <strong>Delivery window:</strong> 05:00 to 07:30 SLST (strict morning curfew)
            </li>
            <li>
              <strong>Site receiver:</strong> Anjali at rear receiving bay desk
            </li>
            <li>
              <strong>Phone contact:</strong> 077 123 4567
            </li>
            <li>
              <strong>Parking instruction:</strong> Do not block the bus lane; use designated morning delivery bay
            </li>
          </ul>

          <div
            style={{
              marginTop: 20,
              padding: 12,
              borderRadius: 8,
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              display: 'flex',
              gap: 10,
              alignItems: 'center',
            }}
          >
            <Clock size={18} color="#377A8B" />
            <span style={{ fontSize: 12, color: '#475569' }}>
              Standard unloading target: 15 minutes. Temperature probe verification required for dairy cases.
            </span>
          </div>
        </section>

        <section
          className="wp-panel screen-panel"
          style={{
            background: '#FFFFFF',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            padding: 20,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>
            Cargo Quantities & Crates
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ITEMS.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>
                    {item.id} · {item.category}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace', color: '#377A8B' }}>
                    {item.quantity}
                  </span>
                  <span style={{ fontSize: 12, color: '#64748B', marginLeft: 4 }}>{item.unit}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
            <Link
              href="/driver/pod"
              className="wp-btn wp-btn-primary"
              style={{
                flex: 1,
                padding: '10px 16px',
                background: '#377A8B',
                color: '#FFFFFF',
                borderRadius: 8,
                textAlign: 'center',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 13,
                display: 'inline-flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Camera size={16} /> Capture POD
            </Link>

            <Link
              href="/driver/issue"
              className="wp-btn wp-btn-outline"
              style={{
                flex: 1,
                padding: '10px 16px',
                background: '#FFFFFF',
                color: '#DC2626',
                border: '1px solid #DC2626',
                borderRadius: 8,
                textAlign: 'center',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 13,
                display: 'inline-flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <MessageSquareWarning size={16} /> Report Issue
            </Link>
          </div>
        </section>
      </div>

      <div
        className="wp-mobile-action-bar"
        style={{
          position: 'sticky',
          bottom: 12,
          marginTop: 24,
          padding: 12,
          borderRadius: 12,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          border: '1px solid #CBD5E1',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          gap: 10,
        }}
      >
        <Link
          href="/driver/pod"
          style={{
            flex: 1,
            height: 48,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            background: '#377A8B',
            color: '#FFFFFF',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 14,
            textDecoration: 'none',
          }}
        >
          <Camera size={18} /> Capture POD
        </Link>
        <Link
          href="/driver/issue"
          style={{
            flex: 1,
            height: 48,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            background: '#FFFFFF',
            border: '1px solid #DC2626',
            color: '#DC2626',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 14,
            textDecoration: 'none',
          }}
        >
          <MessageSquareWarning size={18} /> Report Issue
        </Link>
      </div>
    </main>
  );
}
