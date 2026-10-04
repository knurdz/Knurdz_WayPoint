'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  WifiOff,
  Database,
  Search,
  Truck,
  MapPin,
  AlertTriangle,
  Phone,
  MessageCircle,
  CornerUpRight,
  X,
} from 'lucide-react';
import { formatAccessType } from '@/lib/formatters';

interface StopData {
  id: string;
  seq: number;
  deliveryId: string;
  outletId: string;
  outletName: string;
  accessChip: string;
  accessType: 'van_only' | 'street' | 'rear_dock';
  status: 'done' | 'active' | 'later';
  statusLabel: string;
  statusBadgeClass: string;
  meta: string;
  receiver: string;
  handoverTime?: string;
  windowSlack?: string;
  windowCloses?: string;
  cargo: {
    name: string;
    sub: string;
    img: string;
  }[];
  criticalNote?: string;
}

const STOPS: StopData[] = [
  {
    id: 'stop-1',
    seq: 1,
    deliveryId: 'DEL-88401',
    outletId: 'OUT001',
    outletName: 'Fresh Galle Rd',
    accessChip: 'Van Only',
    accessType: 'van_only',
    status: 'done',
    statusLabel: 'Delivered',
    statusBadgeClass: 'wp-badge-success',
    meta: 'POD signed 05:32 · 1,840 kg',
    receiver: 'Nimal Perera',
    handoverTime: '05:32 SLST',
    cargo: [],
  },
  {
    id: 'stop-2',
    seq: 2,
    deliveryId: 'DEL-88402',
    outletId: 'OUT002',
    outletName: 'Duplication Rd',
    accessChip: 'Van Only',
    accessType: 'van_only',
    status: 'active',
    statusLabel: 'In Transit',
    statusBadgeClass: 'wp-badge-info',
    meta: '14 min · window closes 08:00',
    receiver: 'Anjali Jayawardena',
    windowSlack: '1h 42m',
    windowCloses: '08:00',
    cargo: [
      {
        name: 'Bread',
        sub: '80 bundles · ambient',
        img: '/assets/products/bakery-bread.jpg',
      },
      {
        name: 'Rice',
        sub: '45 sacks · 2,100 kg',
        img: '/assets/products/organic-rice.jpg',
      },
    ],
  },
  {
    id: 'stop-3',
    seq: 3,
    deliveryId: 'DEL-88403',
    outletId: 'OUT003',
    outletName: 'Marine Drive',
    accessChip: 'Street Access',
    accessType: 'street',
    status: 'later',
    statusLabel: 'Scheduled',
    statusBadgeClass: '',
    meta: '6.7 km after OUT002 · chilled',
    receiver: 'Rohan Wickramasinghe',
    criticalNote: 'Critical stop · 6 min slack',
    cargo: [
      {
        name: 'Yogurt',
        sub: 'Hold at +4°C',
        img: '/assets/products/greek-yogurt.jpg',
      },
      {
        name: 'Dairy',
        sub: 'Dock 09:30 window',
        img: '/assets/products/butter-cheese.jpg',
      },
    ],
  },
  {
    id: 'stop-4',
    seq: 4,
    deliveryId: 'DEL-88404',
    outletId: 'OUT010',
    outletName: 'Colombo 03 · Produce',
    accessChip: 'Van Only',
    accessType: 'van_only',
    status: 'later',
    statusLabel: 'Scheduled',
    statusBadgeClass: '',
    meta: 'Last stop · 26.4 km from depot',
    receiver: 'Sunil Silva',
    cargo: [
      {
        name: 'Produce',
        sub: 'Ambient crates',
        img: '/assets/products/fresh-produce.jpg',
      },
      {
        name: 'Milk',
        sub: 'Chilled totes',
        img: '/assets/products/milk-bottle.jpg',
      },
    ],
  },
];

export default function DriverRoutePage() {
  const [filter, setFilter] = useState<'all' | 'active' | 'done' | 'later'>('all');
  const [search, setSearch] = useState('');
  const [openStopId, setOpenStopId] = useState<string>('stop-2');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filteredStops = STOPS.filter((stop) => {
    if (filter === 'active' && stop.status !== 'active') return false;
    if (filter === 'done' && stop.status !== 'done') return false;
    if (filter === 'later' && stop.status !== 'later') return false;
    if (search) {
      const q = search.toLowerCase();
      const match =
        stop.deliveryId.toLowerCase().includes(q) ||
        stop.outletId.toLowerCase().includes(q) ||
        stop.outletName.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="route-main">
      <div className="store-page-header">
        <div>
          <div className="store-page-meta">
            <span className="wp-state wp-state-success">Route Active</span>
            <span className="font-mono store-outlet-id">VEH037</span>
          </div>
          <h1 className="wp-headline-md store-page-title">Route R025229</h1>
          <p className="wp-subtext store-page-subtitle">Coastal corridor · Nissan Cabstar · 1 of 4 stops delivered</p>
        </div>
        <div className="route-tools">
          <Link href="/driver/sync" className="wp-offline-banner stale" title="Open offline sync">
            <WifiOff size={14} />
            <span>Offline: 3 queued</span>
          </Link>
          <span className="cab-pill">
            <Database size={13} />
            Sync <strong className="font-mono" id="sync-queue-count">3</strong>
          </span>
          <Link href="/driver/pod" className="wp-btn wp-btn-primary">
            Capture POD
          </Link>
          <button
            type="button"
            className="wp-btn wp-btn-outline"
            onClick={() => setDrawerOpen(true)}
          >
            Stop Details
          </button>
        </div>
      </div>

      <div className="route-layout">
        {/* Left Column: Delivery Run Sheet */}
        <section className="dock-sequence-panel route-sheet" id="route-sheet" aria-label="Delivery run sheet">
          <div className="store-panel-head">
            <div>
              <span className="wp-label">Run sheet</span>
              <h2 className="wp-headline-sm store-panel-title">Stops on this corridor</h2>
            </div>
            <span className="wp-subtext store-panel-count">4 stops</span>
          </div>

          <div className="cab-search">
            <Search size={14} />
            <input
              type="search"
              id="cab-search"
              className="wp-input"
              placeholder="Search delivery or outlet"
              aria-label="Search delivery or outlet"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="cab-chips" role="group" aria-label="Filter stops">
            <button
              type="button"
              className={`cab-chip ${filter === 'all' ? 'is-on' : ''}`}
              onClick={() => setFilter('all')}
              aria-pressed={filter === 'all'}
            >
              All
            </button>
            <button
              type="button"
              className={`cab-chip ${filter === 'active' ? 'is-on' : ''}`}
              onClick={() => setFilter('active')}
              aria-pressed={filter === 'active'}
            >
              Active
            </button>
            <button
              type="button"
              className={`cab-chip ${filter === 'done' ? 'is-on' : ''}`}
              onClick={() => setFilter('done')}
              aria-pressed={filter === 'done'}
            >
              Done
            </button>
            <button
              type="button"
              className={`cab-chip ${filter === 'later' ? 'is-on' : ''}`}
              onClick={() => setFilter('later')}
              aria-pressed={filter === 'later'}
            >
              Later
            </button>
          </div>

          <div className="cab-stops">
            {filteredStops.map((stop) => {
              const isOpen = openStopId === stop.id;
              const isNow = stop.status === 'active';
              const isDone = stop.status === 'done';

              return (
                <article
                  key={stop.id}
                  className={`cab-stop ${isDone ? 'is-done' : ''} ${isNow ? 'is-now' : ''} ${isOpen ? 'is-open' : ''}`}
                >
                  <button
                    type="button"
                    className="cab-stop-head"
                    aria-expanded={isOpen}
                    onClick={() => setOpenStopId(isOpen ? '' : stop.id)}
                  >
                    <span className="cab-seq">{stop.seq}</span>
                    <span className="cab-stop-copy">
                      <span className="wp-label">{stop.deliveryId}</span>
                      <strong>{stop.outletId} · {stop.outletName}</strong>
                      <span className={`wp-access-chip wp-access-chip--${stop.accessType}`} style={{ marginTop: '0.2rem' }}>
                        {stop.accessType === 'van_only' ? <Truck size={12} /> : <MapPin size={12} />}
                        <span>{formatAccessType(stop.accessType) || stop.accessChip}</span>
                      </span>
                      <span className="cab-stop-meta">{stop.meta}</span>
                      {stop.criticalNote && (
                        <span className="decision-critical-chip">
                          <AlertTriangle size={12} /> {stop.criticalNote}
                        </span>
                      )}
                    </span>
                    <span className={`wp-badge ${stop.statusBadgeClass}`}>
                      {stop.statusLabel}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="cab-stop-body">
                      {stop.cargo.length > 0 && (
                        <div className="cab-cargo">
                          {stop.cargo.map((item) => (
                            <figure key={`${stop.id}-cargo-${item.name}-${item.sub}`}>
                              <img src={item.img} alt={item.name} />
                              <figcaption>
                                <strong>{item.name}</strong>
                                <span>{item.sub}</span>
                              </figcaption>
                            </figure>
                          ))}
                        </div>
                      )}

                      {stop.windowSlack && (
                        <div className="cab-slack">
                          <div className="cab-slack-top">
                            <span className="wp-label">Window slack</span>
                            <strong className="font-mono">{stop.windowSlack}</strong>
                          </div>
                          <div className="cab-meter" aria-hidden="true">
                            <span style={{ width: '68%' }}></span>
                          </div>
                          <div className="cab-slack-ends">
                            <span>Now 06:18</span>
                            <span>Closes {stop.windowCloses}</span>
                          </div>
                        </div>
                      )}

                      <div className="cab-facts">
                        <div className="cab-fact">
                          <span className="wp-label">Receiver</span>
                          <strong>{stop.receiver}</strong>
                        </div>
                        {stop.handoverTime ? (
                          <div className="cab-fact">
                            <span className="wp-label">Handover</span>
                            <strong>{stop.handoverTime}</strong>
                          </div>
                        ) : (
                          <div className="cab-fact">
                            <span className="wp-label">Access</span>
                            <strong>Van bay · 3.2 m</strong>
                          </div>
                        )}
                      </div>

                      {isNow && (
                        <div className="cab-receiver">
                          <span className="wp-avatar" style={{ background: '#E0F2FE', color: 'var(--wp-info)' }}>
                            AJ
                          </span>
                          <div>
                            <span className="wp-label">Store receiver</span>
                            <p style={{ margin: 0, fontWeight: 600 }}>{stop.receiver}</p>
                          </div>
                          <div className="cab-receiver-actions">
                            <button type="button" className="wp-icon-btn" aria-label="Call receiver">
                              <Phone size={14} />
                            </button>
                            <button type="button" className="wp-icon-btn" aria-label="Message receiver">
                              <MessageCircle size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        {/* Right Column: Live Navigation Corridor Map */}
        <aside className="route-map-panel" aria-label="Live navigation">
          <div className="store-panel-head">
            <div>
              <span className="wp-label">Colombo coastal corridor</span>
              <h2 className="wp-headline-sm store-panel-title">Next turn · OUT002</h2>
            </div>
            <span className="wp-subtext store-panel-count">14 min</span>
          </div>

          <div className="wp-corridor-map cab-map">
            <svg
              viewBox="0 0 1200 420"
              className="wp-corridor-map__svg cab-map-svg"
              preserveAspectRatio="xMidYMid slice"
              role="img"
              aria-label="Coastal corridor map"
            >
              <defs>
                <pattern id="cabGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#D7E2EA" strokeWidth="0.75" />
                </pattern>
              </defs>
              <rect width="1200" height="420" fill="#EEF3F6" />
              <rect width="1200" height="420" fill="url(#cabGrid)" opacity="0.55" />
              <path d="M0,300 Q280,250 520,275 T1200,320 L1200,420 L0,420 Z" fill="#D5E6EE" />
              <path d="M80,190 Q360,170 600,188 T1080,200" fill="none" stroke="#C5D0D8" strokeWidth="8" strokeLinecap="round" />
              <path d="M120,190 L300,182" stroke="#16A34A" strokeWidth="6" fill="none" strokeLinecap="round" />
              <path d="M300,182 Q410,174 520,168" stroke="#377a8b" strokeWidth="6" fill="none" strokeLinecap="round" />
              <path d="M520,168 Q720,178 950,198" stroke="#CBD5E1" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray="8 6" />
              <g transform="translate(120, 190)">
                <rect x="-16" y="-16" width="32" height="32" rx="6" fill="#1A1C1C" />
                <text x="0" y="4" fill="#FFFFFF" fontFamily="JetBrains Mono, monospace" fontSize="10" fontWeight="700" textAnchor="middle">DEP</text>
                <text x="0" y="-26" fill="#1A1C1C" fontFamily="Rubik, sans-serif" fontSize="12" fontWeight="700" textAnchor="middle">Peliyagoda Depot</text>
              </g>
              <g transform="translate(300, 182)">
                <circle r="12" fill="#16A34A" />
                <path d="M-4,0 L-1,4 L5,-4" stroke="#FFF" strokeWidth="2" fill="none" />
                <text x="0" y="-22" fill="#16A34A" fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight="700" textAnchor="middle">OUT001 · Done</text>
              </g>
              <g transform="translate(410, 176)">
                <circle r="18" fill="#377a8b" opacity="0.16" />
                <circle r="9" fill="#377a8b" stroke="#fff" strokeWidth="2" />
                <rect x="-30" y="-38" width="60" height="18" rx="4" fill="#1A1C1C" />
                <text x="0" y="-26" fill="#FFFFFF" fontFamily="JetBrains Mono, monospace" fontSize="10" fontWeight="700" textAnchor="middle">VEH037</text>
              </g>
              <g transform="translate(520, 168)">
                <circle r="18" fill="none" stroke="#377a8b" strokeWidth="2" opacity="0.45">
                  <animate attributeName="r" values="12;24;12" dur="2.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.55;0.1;0.55" dur="2.2s" repeatCount="indefinite" />
                </circle>
                <circle r="12" fill="#377a8b" />
                <circle r="5" fill="#FFFFFF" />
                <text x="0" y="-28" fill="#377a8b" fontFamily="JetBrains Mono, monospace" fontSize="12" fontWeight="700" textAnchor="middle">OUT002 · Target</text>
                <text x="0" y="34" fill="#64748B" fontFamily="Nunito Sans, sans-serif" fontSize="11" textAnchor="middle">Duplication Rd</text>
              </g>
              <g transform="translate(740, 182)">
                <circle r="9" fill="#94A3B8" />
                <text x="0" y="-18" fill="#475569" fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight="600" textAnchor="middle">OUT003</text>
              </g>
              <g transform="translate(980, 200)">
                <circle r="9" fill="#94A3B8" />
                <text x="0" y="-18" fill="#475569" fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight="600" textAnchor="middle">OUT010</text>
              </g>
            </svg>
          </div>

          <div className="route-next">
            <span className="route-next-icon" aria-hidden="true">
              <CornerUpRight size={18} />
            </span>
            <div>
              <span className="wp-label">In 400 m</span>
              <strong>Keep right onto Duplication Rd</strong>
              <p style={{ margin: 0 }}>Van bay on the left · clearance 3.2 m</p>
            </div>
            <span className="route-next-eta">14 min</span>
          </div>
        </aside>
      </div>

      {/* Stop Detail Drawer */}
      {drawerOpen && (
        <div className="wp-drawer-backdrop" style={{ display: 'block' }}>
          <div className="wp-drawer-bottom">
            <div className="wp-drawer-grabber"></div>
            <div className="wp-drawer-header">
              <div>
                <span className="wp-label">Stop 2 · OUT002 Fresh Duplication Rd</span>
                <h2 className="wp-headline-sm" style={{ margin: '0.25rem 0 0' }}>Current Stop Details</h2>
              </div>
              <button
                type="button"
                className="wp-icon-btn"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close drawer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="wp-drawer-body">
              <div className="wp-split wp-split-subpanel">
                <div>
                  <span className="wp-label" style={{ fontSize: '0.65rem' }}>Window Deadline</span>
                  <p className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0.2rem 0 0' }}>08:00 AM SLST</p>
                  <span className="wp-subtext" style={{ fontSize: '0.75rem' }}>1h 42m slack remaining</span>
                </div>
                <div>
                  <span className="wp-label" style={{ fontSize: '0.65rem' }}>Road Access Rule</span>
                  <p className="wp-meta-inline" style={{ margin: '0.2rem 0 0' }}>Van only street loading</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0', padding: '0.75rem', background: '#FDFCFB', border: '1px solid var(--wp-border-sub)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <img src="/assets/products/bakery-bread.jpg" className="wp-product-thumb" alt="Bread" />
                  <img src="/assets/products/organic-rice.jpg" className="wp-product-thumb" alt="Rice" />
                </div>
                <div>
                  <strong style={{ fontSize: '0.85rem', display: 'block' }}>Order DEL-88402 (2,100 kg · 5.4 m³)</strong>
                  <p className="wp-subtext" style={{ margin: '0.15rem 0 0', fontSize: '0.8rem' }}>
                    80 Bakery Bread Bundles &amp; 45 Dry Pulse Sacks · Ambient cargo ready for curbside offload
                  </p>
                </div>
              </div>

              <div className="wp-panel" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
                <span className="wp-label" style={{ display: 'block', marginBottom: '0.75rem' }}>Stop 2 Navigation Detail</span>
                <h3 className="wp-title-md" style={{ margin: '0 0 0.25rem' }}>No. 42 Duplication Road, Colombo 03</h3>
                <p className="wp-subtext" style={{ fontSize: '0.8rem', margin: '0 0 1.25rem' }}>Fresh Supermarket Retail Store Entrance</p>

                <div className="wp-subpanel" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
                  <span className="wp-label" style={{ fontSize: '0.65rem' }}>Dock Constraints &amp; Access</span>
                  <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.15rem', fontSize: '0.8rem', lineHeight: 1.5, color: 'var(--wp-subtext)' }}>
                    <li>Street curb unloading bay restricted to vans only.</li>
                    <li>Clearance limitation: 3.2m height.</li>
                    <li>Store staff buzzer active at side door.</li>
                  </ul>
                </div>

                <div className="wp-subpanel" style={{ padding: '1rem' }}>
                  <div className="wp-flex-between">
                    <div>
                      <span className="wp-label" style={{ fontSize: '0.65rem' }}>Store Receiver Contact</span>
                      <p className="font-laro" style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0.2rem 0 0' }}>Anjali Jayawardena</p>
                    </div>
                    <Link href="/driver/pod" className="wp-btn wp-btn-primary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.75rem' }}>
                      Proceed to POD
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
