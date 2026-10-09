'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Wifi,
  Truck,
  MapPin,
  Container,
  CheckCircle2,
  Clock,
  Loader2,
} from 'lucide-react';

interface DriverStop {
  id: string;
  seq: number;
  deliveryCode: string;
  outletCode: string;
  outletName: string;
  access: string;
  status: 'Delivered' | 'In Transit' | 'Pending';
  meta: string;
}

interface DriverRouteData {
  routeId: string;
  vehicleId: string;
  driverName: string;
  status: string;
  corridor: string;
  stops: DriverStop[];
}

export default function DriverHomePage() {
  const [data, setData] = useState<DriverRouteData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/driver/route', { signal: controller.signal })
      .then((res) => res.json())
      .then((json) => {
        if (!json.error) {
          setData(json);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('Failed to load driver home data', err);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, []);

  const stops = data?.stops || [];
  const nextPendingStop = stops.find((s) => s.status !== 'Delivered') || stops[0];

  return (
    <div>
      <div className="screen-page-header">
        <div>
          <span className="wp-label">DRV 01</span>
          <h1 className="wp-headline-md" style={{ margin: '0.35rem 0 0' }}>
            Good morning, {data?.driverName || 'Kamal'}
          </h1>
          <p className="wp-subtext">Active assignment · Peliyagoda depot · {data?.vehicleId || 'VEH037'}</p>
        </div>
        <span className="wp-offline-banner online" id="network-banner" aria-live="polite">
          <Wifi size={14} />
          <span>Online</span>
        </span>
      </div>

      <article className="wp-panel screen-panel">
        <div className="wp-flex-between" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <span className="font-mono wp-label">Route {data?.routeId || 'R025229'}</span>
            <h2 className="wp-headline-sm" style={{ margin: '0.25rem 0' }}>
              {data?.vehicleId || 'VEH037'} · {stops.length} stops · reefer van
            </h2>
            <span className="wp-chassis-chip wp-chassis-chip--van_freezer">Van + Freezer</span>
          </div>
          {nextPendingStop && (
            <Link
              href={`/driver/pod?stopId=${encodeURIComponent(nextPendingStop.id)}&deliveryCode=${encodeURIComponent(nextPendingStop.deliveryCode)}`}
              className="wp-btn wp-btn-primary"
            >
              Capture POD · {nextPendingStop.outletCode}
            </Link>
          )}
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--wp-muted)' }}>
            <Loader2 className="animate-spin" size={20} style={{ margin: '0 auto 8px' }} />
            <p>Loading active stops manifest...</p>
          </div>
        ) : (
          <div className="driver-home-route">
            <div className="driver-home-stops">
              {stops.map((stop) => {
                const isDone = stop.status === 'Delivered';
                const isNow = stop.status === 'In Transit';

                return (
                  <div
                    key={stop.id}
                    className={`driver-home-stop ${isDone ? 'is-done' : isNow ? 'is-now' : ''}`}
                  >
                    <span className="driver-home-stop-seq">{stop.seq}</span>
                    <div style={{ flex: 1 }}>
                      <strong>{stop.outletCode} · {stop.outletName}</strong>
                      <span className="wp-access-chip wp-access-chip--van_only" style={{ marginTop: '0.2rem' }}>
                        <Truck size={12} /> {stop.access}
                      </span>
                      <p className="wp-subtext" style={{ margin: '0.2rem 0 0', fontSize: '0.75rem' }}>
                        {stop.meta}
                      </p>
                    </div>
                    {isDone ? (
                      <span className="wp-badge wp-badge-success">Done</span>
                    ) : isNow ? (
                      <Link
                        href={`/driver/pod?stopId=${encodeURIComponent(stop.id)}&deliveryCode=${encodeURIComponent(stop.deliveryCode)}`}
                        className="wp-badge wp-badge-info"
                        style={{ textDecoration: 'none' }}
                      >
                        Capture POD
                      </Link>
                    ) : (
                      <Link
                        href={`/driver/pod?stopId=${encodeURIComponent(stop.id)}&deliveryCode=${encodeURIComponent(stop.deliveryCode)}`}
                        className="wp-badge wp-badge-muted"
                        style={{ textDecoration: 'none' }}
                      >
                        Start
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="wp-corridor-map wp-corridor-map--compact">
              <svg viewBox="0 0 600 280" className="wp-corridor-map__svg" role="img" aria-label="Route map approaching stops">
                <rect width="600" height="280" fill="#EEF3F6" />
                <path d="M40,180 Q200,160 360,170 T560,185" fill="none" stroke="#C5D0D8" strokeWidth="5" strokeLinecap="round" />
                <path d="M60,180 L180,175" stroke="#16A34A" strokeWidth="4" />
                <path d="M180,175 Q280,168 360,172" stroke="#377a8b" strokeWidth="4" />
                <path d="M360,172 Q480,178 540,185" stroke="#CBD5E1" strokeWidth="4" strokeDasharray="6 5" />
                <circle cx="180" cy="175" r="8" fill="#16A34A" />
                <circle cx="300" cy="170" r="10" fill="#377a8b">
                  <animate attributeName="r" values="8;14;8" dur="2s" repeatCount="indefinite" />
                </circle>
                <text x="300" y="155" fill="#377a8b" fontFamily="JetBrains Mono" fontSize="9" fontWeight="700" textAnchor="middle">
                  {data?.vehicleId || 'VEH037'}
                </text>
                <circle cx="420" cy="176" r="7" fill="#94A3B8" />
              </svg>
            </div>
          </div>
        )}
      </article>

      <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Link href="/driver/route" className="wp-btn wp-btn-primary" style={{ padding: '0.6rem 1.25rem' }}>
          Full Route Manifest →
        </Link>
        <Link href="/driver/sync" className="wp-btn wp-btn-outline" style={{ padding: '0.6rem 1.25rem' }}>
          Offline Outbox Status
        </Link>
      </div>
    </div>
  );
}
