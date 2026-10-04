'use client';

import React from 'react';
import Link from 'next/link';
import {
  Wifi,
  Truck,
  MapPin,
  Container,
} from 'lucide-react';

export default function DriverHomePage() {
  return (
    <div>
      <div className="screen-page-header">
        <div>
          <span className="wp-label">DRV 01</span>
          <h1 className="wp-headline-md" style={{ margin: '0.35rem 0 0' }}>Good morning, Kamal</h1>
          <p className="wp-subtext">Today assignment · Peliyagoda depot · Fresh Colombo</p>
        </div>
        <span className="wp-offline-banner online" id="network-banner" aria-live="polite">
          <Wifi size={14} />
          <span>Online</span>
        </span>
      </div>

      <article className="wp-panel screen-panel">
        <div className="wp-flex-between" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <span className="font-mono wp-label">Route R025229</span>
            <h2 className="wp-headline-sm" style={{ margin: '0.25rem 0' }}>VEH037 · 4 stops · reefer van</h2>
            <span className="wp-chassis-chip wp-chassis-chip--van_freezer">Van + Freezer</span>
          </div>
          <Link href="/driver/pod" className="wp-btn wp-btn-primary">
            Capture POD · OUT002
          </Link>
        </div>

        <div className="driver-home-route">
          <div className="driver-home-stops">
            <div className="driver-home-stop is-done">
              <span className="driver-home-stop-seq">1</span>
              <div>
                <strong>OUT001 · Fresh Galle Rd</strong>
                <span className="wp-access-chip wp-access-chip--van_only" style={{ marginTop: '0.2rem' }}>
                  <Truck size={12} /> van_only
                </span>
                <p className="wp-subtext" style={{ margin: '0.2rem 0 0', fontSize: '0.75rem' }}>Delivered 05:32</p>
              </div>
              <span className="wp-badge wp-badge-success">Done</span>
            </div>

            <div className="driver-home-stop is-now">
              <span className="driver-home-stop-seq">2</span>
              <div>
                <strong>OUT002 · Duplication Rd</strong>
                <span className="wp-access-chip wp-access-chip--van_only" style={{ marginTop: '0.2rem' }}>
                  <Truck size={12} /> van_only
                </span>
                <p className="wp-subtext" style={{ margin: '0.2rem 0 0', fontSize: '0.75rem' }}>14 min · window closes 08:00</p>
              </div>
              <span className="wp-badge wp-badge-info">Now</span>
            </div>

            <div className="driver-home-stop">
              <span className="driver-home-stop-seq">3</span>
              <div>
                <strong>OUT003 · Marine Drive</strong>
                <span className="wp-access-chip wp-access-chip--street" style={{ marginTop: '0.2rem' }}>
                  <MapPin size={12} /> street
                </span>
                <p className="wp-subtext" style={{ margin: '0.2rem 0 0', fontSize: '0.75rem' }}>Planned 06:40</p>
              </div>
            </div>

            <div className="driver-home-stop">
              <span className="driver-home-stop-seq">4</span>
              <div>
                <strong>OUT010 · Colombo 03</strong>
                <span className="wp-access-chip wp-access-chip--rear_dock" style={{ marginTop: '0.2rem' }}>
                  <Container size={12} /> rear_dock
                </span>
                <p className="wp-subtext" style={{ margin: '0.2rem 0 0', fontSize: '0.75rem' }}>Last stop · 07:15</p>
              </div>
            </div>
          </div>

          <div className="wp-corridor-map wp-corridor-map--compact">
            <svg viewBox="0 0 600 280" className="wp-corridor-map__svg" role="img" aria-label="Route map VEH037 approaching OUT002">
              <rect width="600" height="280" fill="#EEF3F6" />
              <path d="M40,180 Q200,160 360,170 T560,185" fill="none" stroke="#C5D0D8" strokeWidth="5" strokeLinecap="round" />
              <path d="M60,180 L180,175" stroke="#16A34A" strokeWidth="4" />
              <path d="M180,175 Q280,168 360,172" stroke="#377a8b" strokeWidth="4" />
              <path d="M360,172 Q480,178 540,185" stroke="#CBD5E1" strokeWidth="4" strokeDasharray="6 5" />
              <circle cx="180" cy="175" r="8" fill="#16A34A" />
              <circle cx="300" cy="170" r="10" fill="#377a8b">
                <animate attributeName="r" values="8;14;8" dur="2s" repeatCount="indefinite" />
              </circle>
              <text x="300" y="155" fill="#377a8b" fontFamily="JetBrains Mono" fontSize="9" fontWeight="700" textAnchor="middle">VEH037</text>
              <circle cx="420" cy="176" r="7" fill="#94A3B8" />
              <circle cx="520" cy="184" r="7" fill="#94A3B8" />
            </svg>
          </div>
        </div>

        <div className="screen-page-actions" style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem' }}>
          <Link href="/driver/route" className="wp-btn wp-btn-primary">
            Open full route
          </Link>
          <Link href="/driver/sync" className="wp-btn wp-btn-outline">
            Sync queue <span className="font-mono">3</span>
          </Link>
        </div>
      </article>

      <aside className="wp-panel screen-panel" style={{ marginTop: '1.25rem' }}>
        <span className="wp-label">Shift notes</span>
        <div className="screen-list" style={{ marginTop: '0.75rem' }}>
          <div className="screen-list-item"><span>Depot</span><strong>Peliyagoda</strong></div>
          <div className="screen-list-item"><span>Brand</span><strong>Fresh · Colombo</strong></div>
          <div className="screen-list-item"><span>Connectivity</span><span className="mc-status-chip mc-status-chip-ok">Automated status</span></div>
        </div>
      </aside>
    </div>
  );
}
