'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { MapPin, Clock, Phone, AlertCircle, Camera, MessageSquareWarning, Package, CheckCircle2 } from 'lucide-react';
import { formatAccessType } from '@/lib/formatters';

interface StopItem {
  id: string;
  name: string;
  quantity: number | string;
  unit: string;
  category: string;
}

interface LoadedDriverStop {
  id: string;
  orderId?: string;
  seq: number;
  deliveryCode: string;
  outletCode: string;
  outletName: string;
  access: string;
  status: string;
  meta: string;
  windowCloses: string;
  cargo: { name: string; qty: string }[];
}

function DriverStopContent() {
  const searchParams = useSearchParams();
  const paramStopId = searchParams.get('stopId') || '';
  const paramDeliveryCode = searchParams.get('deliveryCode') || '';

  const [stop, setStop] = useState<LoadedDriverStop>({
    id: paramStopId || 'stop-1',
    orderId: 'ORD_92301',
    seq: 1,
    deliveryCode: paramDeliveryCode || 'DEL_88401',
    outletCode: 'OUT001',
    outletName: 'Fresh Galle Rd',
    access: 'van_only',
    status: 'In Transit',
    meta: '06:15 SLST · window closes 07:30',
    windowCloses: '07:30 SLST',
    cargo: [
      { name: 'Dairy Pasteurized Milk 1L', qty: '42 cases' },
      { name: 'Traditional Buffalo Curd', qty: '18 trays' },
      { name: 'Vanilla Bean Ice Cream', qty: '6 tubs' },
    ],
  });

  useEffect(() => {
    fetch('/api/driver/route')
      .then((res) => res.json())
      .then((data) => {
        if (!data.error && data.stops && data.stops.length > 0) {
          const match =
            data.stops.find(
              (s: any) =>
                (paramStopId && s.id === paramStopId) ||
                (paramDeliveryCode && s.deliveryCode === paramDeliveryCode),
            ) ||
            data.stops.find((s: any) => s.status !== 'Delivered') ||
            data.stops[0];

          if (match) {
            setStop({
              id: match.id,
              orderId: match.orderId,
              seq: match.seq,
              deliveryCode: match.deliveryCode,
              outletCode: match.outletCode,
              outletName: match.outletName,
              access: match.access,
              status: match.status,
              meta: match.meta,
              windowCloses: match.windowCloses,
              cargo: match.cargo || [],
            });
          }
        }
      })
      .catch((err) => console.error('Failed to load driver route stop details', err));
  }, [paramStopId, paramDeliveryCode]);

  const podUrl = `/driver/pod?stopId=${encodeURIComponent(stop.id)}&deliveryCode=${encodeURIComponent(stop.deliveryCode)}&orderId=${encodeURIComponent(stop.orderId || '')}`;
  const issueUrl = `/driver/issue?stopId=${encodeURIComponent(stop.id)}&deliveryCode=${encodeURIComponent(stop.deliveryCode)}&outletCode=${encodeURIComponent(stop.outletCode)}&outletName=${encodeURIComponent(stop.outletName)}`;

  return (
    <main className="wp-main">
      <div className="screen-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <span className="wp-label" style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>
            DRV 03 · Stop {stop.seq} · {stop.deliveryCode}
          </span>
          <h1 className="wp-headline-md" style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 700 }}>
            {stop.outletCode} {stop.outletName}
          </h1>
          <p className="wp-subtext" style={{ margin: '2px 0 0', color: '#64748B', fontSize: 13 }}>
            {stop.meta}
          </p>
        </div>
        <Link
          href={podUrl}
          className="wp-btn wp-btn-primary"
          style={{
            padding: '8px 16px',
            fontSize: 13,
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
              <strong>Physical constraint:</strong> {formatAccessType(stop.access) || stop.access} · 3.2 m clearance
            </li>
            <li>
              <strong>Delivery window:</strong> Closes at {stop.windowCloses} (strict morning curfew)
            </li>
            <li>
              <strong>Site receiver:</strong> Anjali at receiving bay desk
            </li>
            <li>
              <strong>Phone contact:</strong> 077 123 4567
            </li>
            <li>
              <strong>Parking instruction:</strong> Use designated commercial unloading bay; avoid blocking bus corridor
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
              Standard unloading target: 15 minutes. Temperature probe verification required for chilled cases.
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
            Cargo Quantities & Manifest Items
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {stop.cargo.map((item, idx) => (
              <div
                key={`${item.name}-${idx}`}
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
                    Item {idx + 1} · {stop.deliveryCode}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 15, fontWeight: 700, fontFamily: 'monospace', color: '#377A8B' }}>
                    {item.qty}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
            <Link
              href={podUrl}
              className="wp-btn wp-btn-primary"
              style={{
                flex: 1,
                padding: '10px 16px',
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
              href={issueUrl}
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
          href={podUrl}
          style={{
            flex: 1,
            height: 48,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            background: 'var(--wp-primary)',
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
          href={issueUrl}
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

export default function DriverStopPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading Stop Details...</div>}>
      <DriverStopContent />
    </Suspense>
  );
}
