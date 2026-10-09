'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Check,
  Map,
  Snowflake,
  LayoutDashboard,
} from 'lucide-react';

export default function DispatcherMissionControlPage() {
  const [day, setDay] = useState<'today' | 'tomorrow'>('today');
  const [cutoffTime, setCutoffTime] = useState('00:00:00');
  const [summary, setSummary] = useState({
    ordersToday: 14,
    confirmedOrders: 10,
    pendingDeferrals: 2,
    allocatedOrders: 10,
    deliveredOrders: 2,
    activeFleet: 32,
    totalFleet: 36,
    onTimeRatePct: 98.4,
    exceptionsCount: 3,
  });

  useEffect(() => {
    fetch('/api/dispatcher/summary')
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setSummary({
            ordersToday: data.ordersToday ?? 14,
            confirmedOrders: data.confirmedOrders ?? 10,
            pendingDeferrals: data.pendingDeferrals ?? 2,
            allocatedOrders: data.allocatedOrders ?? 10,
            deliveredOrders: data.deliveredOrders ?? 2,
            activeFleet: data.activeFleet ?? 32,
            totalFleet: data.totalFleet ?? 36,
            onTimeRatePct: data.onTimeRatePct ?? 98.4,
            exceptionsCount: data.exceptionsCount ?? 3,
          });
        }
      })
      .catch((err) => console.error('Failed to load dispatcher summary', err));
  }, []);

  useEffect(() => {
    function updateCountdown() {
      const now = new Date();
      const cutoff = new Date();
      cutoff.setHours(16, 0, 0, 0);
      if (now > cutoff) {
        cutoff.setDate(cutoff.getDate() + 1);
      }
      const diff = cutoff.getTime() - now.getTime();
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setCutoffTime(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    }
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mc-board" data-wp-day-scope>
      {/* Board Toolbar */}
      <div className="mc-board-toolbar">
        <div className="wp-day-switcher">
          <button
            type="button"
            className={`wp-day-btn ${day === 'today' ? 'active' : ''}`}
            onClick={() => setDay('today')}
            aria-pressed={day === 'today'}
          >
            Today <span className="wp-day-badge">Live ops</span>
          </button>
          <button
            type="button"
            className={`wp-day-btn ${day === 'tomorrow' ? 'active' : ''}`}
            onClick={() => setDay('tomorrow')}
            aria-pressed={day === 'tomorrow'}
          >
            Tomorrow <span className="wp-day-badge">Evening</span>
          </button>
        </div>

        <Link href="/dispatcher/map" className="wp-btn wp-btn-outline mc-board-toolbar__map">
          <Map size={15} />
          <span>Fleet map</span>
        </Link>
      </div>

      {day === 'today' ? (
        <div data-wp-day-panel="today" data-mc-board>
          {/* KPI row */}
          <div className="mc-stat-grid">
            <div className="mc-widget">
              <article className="mc-stat-card wp-panel">
                <div className="mc-stat-head">
                  <span className="mc-stat-label">Orders Today</span>
                  <span className="mc-pill mc-pill-up">
                    <TrendingUp size={12} /> Live
                  </span>
                </div>
                <p className="mc-stat-value">{summary.ordersToday}</p>
                <p className="mc-stat-foot">{summary.confirmedOrders} Confirmed · {summary.pendingDeferrals} Pending Deferrals</p>
              </article>
            </div>

            <div className="mc-widget">
              <article className="mc-stat-card wp-panel">
                <div className="mc-stat-head">
                  <span className="mc-stat-label">Active Fleet</span>
                  <span className="mc-pill mc-pill-ok">Ready</span>
                </div>
                <p className="mc-stat-value">{summary.activeFleet}</p>
                <p className="mc-stat-foot">28 Peliyagoda Hub · 4 Kandy Terminal</p>
              </article>
            </div>

            <div className="mc-widget">
              <article className="mc-stat-card wp-panel">
                <div className="mc-stat-head">
                  <span className="mc-stat-label">On Time Delivery SLA</span>
                  <span className="mc-pill mc-pill-up">
                    <Check size={12} /> Target 92%
                  </span>
                </div>
                <p className="mc-stat-value mc-stat-value-success">{summary.onTimeRatePct}%</p>
                <p className="mc-stat-foot">Contractual SLA benchmark</p>
              </article>
            </div>

            <div className="mc-widget">
              <Link href="/dispatcher/exceptions" className="mc-stat-card wp-panel mc-stat-card-alert" style={{ textDecoration: 'none' }}>
                <div className="mc-stat-head">
                  <span className="mc-stat-label">Exceptions</span>
                  <span className={`mc-pill ${summary.exceptionsCount > 0 ? 'mc-pill-danger' : 'mc-pill-ok'}`}>{summary.exceptionsCount} Active</span>
                </div>
                <p className={`mc-stat-value ${summary.exceptionsCount > 0 ? 'mc-stat-value-danger' : 'mc-stat-value-success'}`}>{summary.exceptionsCount}</p>
                <p className="mc-stat-foot">Dock shortfall · Sync triage · Mall window</p>
              </Link>
            </div>
          </div>

          {/* Main operations band */}
          <div className="mc-body">
            <div className="mc-main-col">
              {/* 7 Day SLA chart */}
              <div className="mc-widget">
                <section className="wp-panel mc-ops-card">
                  <div className="mc-card-head">
                    <div>
                      <span className="mc-card-eyebrow">Performance Trend</span>
                      <h2 className="mc-card-title">7 Day On Time SLA</h2>
                    </div>
                    <div className="mc-sla-legend">
                      <span className="mc-sla-legend-item">
                        <span className="mc-sla-legend-line"></span>On Time SLA
                      </span>
                      <span className="mc-sla-legend-item">
                        <span className="mc-sla-legend-target"></span>Target 92%
                      </span>
                    </div>
                  </div>
                  <div className="mc-sla-chart" role="img" aria-label="Seven day on time delivery SLA trend">
                    <svg viewBox="0 0 560 130" className="mc-sla-svg" preserveAspectRatio="xMidYMid meet">
                      <line x1="44" y1="18" x2="44" y2="98" stroke="var(--wp-border-sub)" />
                      <line x1="44" y1="98" x2="536" y2="98" stroke="var(--wp-border-sub)" />
                      <line x1="44" y1="74" x2="536" y2="74" stroke="var(--wp-muted)" strokeDasharray="5 4" strokeOpacity="0.45" />
                      <text x="40" y="78" fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="var(--wp-muted)" textAnchor="end">92%</text>
                      <text x="40" y="22" fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="var(--wp-muted)" textAnchor="end">95%</text>
                      <text x="40" y="100" fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="var(--wp-muted)" textAnchor="end">90%</text>
                      <path d="M50,84.8 L135,77.6 L220,63.2 L305,54.2 L390,47 L475,39.8 L536,34.4 L536,98 L50,98 Z" fill="var(--wp-primary-wash)" />
                      <path d="M50,84.8 L135,77.6 L220,63.2 L305,54.2 L390,47 L475,39.8 L536,34.4" fill="none" stroke="var(--wp-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="50" cy="84.8" r="3.5" fill="var(--wp-primary)" />
                      <circle cx="135" cy="77.6" r="3.5" fill="var(--wp-primary)" />
                      <circle cx="220" cy="63.2" r="3.5" fill="var(--wp-primary)" />
                      <circle cx="305" cy="54.2" r="3.5" fill="var(--wp-primary)" />
                      <circle cx="390" cy="47" r="3.5" fill="var(--wp-primary)" />
                      <circle cx="475" cy="39.8" r="3.5" fill="var(--wp-primary)" />
                      <circle cx="536" cy="34.4" r="4.5" fill="var(--wp-primary)" stroke="#fff" strokeWidth="2" />
                      <text x="50" y="114" fontFamily="'Nunito Sans', sans-serif" fontSize="9" fill="var(--wp-muted)" textAnchor="middle">Mon</text>
                      <text x="135" y="114" fontFamily="'Nunito Sans', sans-serif" fontSize="9" fill="var(--wp-muted)" textAnchor="middle">Tue</text>
                      <text x="220" y="114" fontFamily="'Nunito Sans', sans-serif" fontSize="9" fill="var(--wp-muted)" textAnchor="middle">Wed</text>
                      <text x="305" y="114" fontFamily="'Nunito Sans', sans-serif" fontSize="9" fill="var(--wp-muted)" textAnchor="middle">Thu</text>
                      <text x="390" y="114" fontFamily="'Nunito Sans', sans-serif" fontSize="9" fill="var(--wp-muted)" textAnchor="middle">Fri</text>
                      <text x="475" y="114" fontFamily="'Nunito Sans', sans-serif" fontSize="9" fill="var(--wp-muted)" textAnchor="middle">Sat</text>
                      <text x="536" y="114" fontFamily="'Nunito Sans', sans-serif" fontSize="9" fill="var(--wp-primary)" fontWeight="700" textAnchor="middle">Today</text>
                    </svg>
                  </div>
                </section>
              </div>

              {/* Dock Stage card */}
              <div className="mc-widget">
                <section className="wp-panel mc-ops-card">
                  <div className="mc-bay wp-canvas-inner">
                    <div className="mc-bay-head">
                      <div>
                        <span className="mc-card-eyebrow">Dock Stage</span>
                        <h3 className="mc-bay-title">Peliyagoda Bay 04 · Active Chassis</h3>
                      </div>
                      <Link href="/dispatcher/allocation" className="mc-link">Fleet Allocation</Link>
                    </div>
                    <div className="mc-bay-flatcar wp-flatcar">
                      <Link href="/loader/shortfall" className="wp-container-slot wp-container-filled wp-container-corrugated mc-bay-slot mc-bay-slot-hold">
                        <span className="wp-container-corner tl"></span><span className="wp-container-corner tr"></span>
                        <span className="wp-container-corner bl"></span><span className="wp-container-corner br"></span>
                        <div className="mc-bay-slot-main">
                          <div className="mc-bay-slot-brand">
                            <span className="mc-bay-slot-mark">WAYPOINT</span>
                            <span className="mc-bay-slot-type">Reefer</span>
                          </div>
                          <span className="font-mono mc-bay-slot-id">VEH004 · FSCU 423198</span>
                        </div>
                        <span className="mc-bay-slot-chip">Gate Hold</span>
                      </Link>
                      <Link href="/driver/route" className="wp-container-slot wp-container-filled wp-container-corrugated mc-bay-slot mc-bay-slot-route">
                        <span className="wp-container-corner tl"></span><span className="wp-container-corner tr"></span>
                        <span className="wp-container-corner bl"></span><span className="wp-container-corner br"></span>
                        <div className="mc-bay-slot-main">
                          <div className="mc-bay-slot-brand">
                            <span className="mc-bay-slot-mark">WAYPOINT</span>
                            <span className="mc-bay-slot-type">Route</span>
                          </div>
                          <span className="font-mono mc-bay-slot-id">VEH037 · R025229</span>
                        </div>
                        <span className="mc-bay-slot-chip">In Transit</span>
                      </Link>
                      <svg viewBox="0 0 540 80" className="mc-bay-chassis" aria-hidden="true">
                        <line x1="10" y1="68" x2="530" y2="68" stroke="#cbd5e1" strokeWidth="4" strokeDasharray="16 8" />
                        <rect x="24" y="24" width="492" height="14" rx="3" fill="#475569" />
                        <rect x="40" y="16" width="460" height="9" rx="2" fill="#64748b" />
                        <circle cx="70" cy="54" r="14" fill="#1e293b" />
                        <circle cx="70" cy="54" r="6" fill="#94a3b8" />
                        <circle cx="106" cy="54" r="14" fill="#1e293b" />
                        <circle cx="106" cy="54" r="6" fill="#94a3b8" />
                        <circle cx="434" cy="54" r="14" fill="#1e293b" />
                        <circle cx="434" cy="54" r="6" fill="#94a3b8" />
                        <circle cx="470" cy="54" r="14" fill="#1e293b" />
                        <circle cx="470" cy="54" r="6" fill="#94a3b8" />
                        <rect x="12" y="27" width="12" height="8" rx="2" fill="#334155" />
                        <rect x="516" y="27" width="12" height="8" rx="2" fill="#334155" />
                      </svg>
                    </div>
                    <p className="mc-bay-foot font-mono">6/7 docks active · Colombo coastal sequence · Priya Fernando loading checklist</p>
                  </div>
                </section>
              </div>

              {/* Cutoff Allocation meter */}
              <div className="mc-widget">
                <section className="wp-panel mc-ops-card">
                  <div className="mc-readiness-block">
                    <div className="mc-readiness-head">
                      <span className="mc-readiness-label">Cutoff Allocation</span>
                      <span className="mc-readiness-value font-mono">{summary.confirmedOrders} / {summary.ordersToday}</span>
                    </div>
                    <div className="mc-meter">
                      <div className="mc-meter-fill" style={{ width: `${summary.ordersToday > 0 ? Math.round((summary.confirmedOrders / summary.ordersToday) * 100) : 95}%` }}></div>
                    </div>
                    <span className="mc-readiness-foot">
                      {summary.pendingDeferrals} pending deferrals · Cutoff 16:00 SLST <span className="font-mono">{cutoffTime}</span>
                    </span>
                  </div>
                </section>
              </div>

              {/* Intake Split */}
              <div className="mc-widget">
                <section className="wp-panel mc-ops-card">
                  <div className="mc-readiness-block">
                    <div className="mc-readiness-head">
                      <span className="mc-readiness-label">{summary.ordersToday} Order Intake Split</span>
                      <Link href="/dispatcher/queue" className="mc-link">Order Queue</Link>
                    </div>
                    <div className="mc-stack-bar" role="img" aria-label="Order intake split">
                      <span className="mc-stack-seg mc-stack-seg-1" style={{ width: '25.8%' }} title="Reefer 48"></span>
                      <span className="mc-stack-seg mc-stack-seg-2" style={{ width: '50.5%' }} title="Ambient 94"></span>
                      <span className="mc-stack-seg mc-stack-seg-3" style={{ width: '14.0%' }} title="Van Only 26"></span>
                      <span className="mc-stack-seg mc-stack-seg-4" style={{ width: '9.7%' }} title="Mall Windows 18"></span>
                    </div>
                    <div className="mc-stack-legend">
                      <span><span className="mc-stack-dot mc-stack-dot-1"></span>Reefer 48</span>
                      <span><span className="mc-stack-dot mc-stack-dot-2"></span>Ambient 94</span>
                      <span><span className="mc-stack-dot mc-stack-dot-3"></span>Van 26</span>
                      <span><span className="mc-stack-dot mc-stack-dot-4"></span>Mall 18</span>
                    </div>
                  </div>
                </section>
              </div>

              {/* Fleet Load Utilization */}
              <div className="mc-widget">
                <section className="wp-panel mc-ops-card">
                  <div className="mc-readiness-block mc-readiness-fleet">
                    <span className="mc-readiness-label">Fleet Load Utilization</span>
                    <div className="mc-fleet-meters">
                      <div className="mc-fleet-meter">
                        <div className="mc-fleet-meter-head">
                          <span className="wp-meta-stack-primary is-chilled">
                            <Snowflake size={13} /> Chilled Reefer
                          </span>
                          <span className="font-mono">84%</span>
                        </div>
                        <div className="mc-meter"><div className="mc-meter-fill" style={{ width: '84%' }}></div></div>
                        <span className="mc-readiness-foot">16 / 19 trucks loaded</span>
                      </div>
                      <div className="mc-fleet-meter">
                        <div className="mc-fleet-meter-head">
                          <span className="wp-meta-stack-primary is-ambient">Ambient Dry</span>
                          <span className="font-mono">68%</span>
                        </div>
                        <div className="mc-meter"><div className="mc-meter-fill mc-meter-fill-soft" style={{ width: '68%' }}></div></div>
                        <span className="mc-readiness-foot">9 / 13 trucks loaded</span>
                      </div>
                      <div className="mc-fleet-meter">
                        <div className="mc-fleet-meter-head">
                          <span>Van Restrictive Access</span>
                          <span className="font-mono">92%</span>
                        </div>
                        <div className="mc-meter"><div className="mc-meter-fill warn" style={{ width: '92%' }}></div></div>
                        <span className="mc-readiness-foot">11 / 12 assigned · Colombo 03 corridor</span>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Right column rail */}
            <aside className="mc-rail">
              <div className="mc-widget">
                <section className="wp-panel mc-rail-card">
                  <div className="mc-card-head">
                    <div>
                      <span className="mc-card-eyebrow">Exception Triage</span>
                      <h2 className="mc-card-title">Open Incidents</h2>
                    </div>
                    <Link href="/driver/degradation" className="mc-link" style={{ marginRight: '0.75rem' }}>Degradation</Link>
                    <Link href="/dispatcher/exceptions" className="mc-link">View all</Link>
                  </div>
                  <div className="mc-priority-list">
                    <Link href="/dispatcher/exceptions" className="mc-priority-item" style={{ textDecoration: 'none' }}>
                      <div className="mc-priority-top">
                        <span className="mc-pill mc-pill-danger">Shortfall</span>
                        <span className="font-mono mc-priority-id">EX 0042</span>
                      </div>
                      <strong className="mc-priority-title">Pre Departure Shortfall</strong>
                      <span className="mc-priority-meta">OUT004 Fresh Cinnamon Gardens · VEH004 · Bay 04</span>
                      <span className="mc-status-chip mc-status-chip-danger">Critical</span>
                    </Link>
                    <Link href="/dispatcher/exceptions?state=conflict" className="mc-priority-item" style={{ textDecoration: 'none' }}>
                      <div className="mc-priority-top">
                        <span className="mc-pill mc-pill-warn">Sync Conflict</span>
                        <span className="font-mono mc-priority-id">EX 4092</span>
                      </div>
                      <strong className="mc-priority-title">Offline POD vs Server Replan</strong>
                      <span className="mc-priority-meta">OUT003 Fresh Marine Drive · VEH037 · Kamal Silva</span>
                      <span className="mc-status-chip mc-status-chip-warn">High</span>
                    </Link>
                    <Link href="/dispatcher/exceptions" className="mc-priority-item" style={{ textDecoration: 'none' }}>
                      <div className="mc-priority-top">
                        <span className="mc-pill mc-pill-info">Window Risk</span>
                        <span className="font-mono mc-priority-id">EX 0015</span>
                      </div>
                      <strong className="mc-priority-title">Mall Dock Window Breach</strong>
                      <span className="mc-priority-meta">OUT015 Style One Galle Face · Dock A003 · ETA +22 min</span>
                      <span className="mc-status-chip mc-status-chip-muted">Medium</span>
                    </Link>
                  </div>
                </section>
              </div>

              {/* Activity feed */}
              <div className="mc-widget">
                <section className="wp-panel mc-rail-card">
                  <div className="mc-card-head">
                    <div>
                      <span className="mc-card-eyebrow">Live Operations</span>
                      <h2 className="mc-card-title">Activity Feed</h2>
                    </div>
                    <span className="wp-status-pulse" aria-label="Live"></span>
                  </div>
                  <div className="mc-feed">
                    <div className="mc-feed-item">
                      <span className="mc-feed-dot mc-feed-dot-error"></span>
                      <div className="mc-feed-body">
                        <div className="mc-feed-head">
                          <strong>Dock Shortfall Reported</strong>
                          <span className="font-mono wp-subtext">05:42 SLST</span>
                        </div>
                        <p className="wp-subtext">Bay 04: 3 chilled cases missing on Stop 2 (OUT004 Colombo 07).</p>
                        <Link href="/dispatcher/exceptions" className="mc-feed-link">Triage Exception</Link>
                      </div>
                    </div>
                    <div className="mc-feed-item">
                      <span className="mc-feed-dot mc-feed-dot-info"></span>
                      <div className="mc-feed-body">
                        <div className="mc-feed-head">
                          <strong>Delivery Completed (Stop 1)</strong>
                          <span className="font-mono wp-subtext">05:32 SLST</span>
                        </div>
                        <p className="wp-subtext">Driver Kamal Silva delivered to OUT001 Fresh Galle Rd. Digital POD signed.</p>
                      </div>
                    </div>
                    <div className="mc-feed-item">
                      <span className="mc-feed-dot mc-feed-dot-success"></span>
                      <div className="mc-feed-body">
                        <div className="mc-feed-head">
                          <strong>Route Dispatched (R025229)</strong>
                          <span className="font-mono wp-subtext">05:00 SLST</span>
                        </div>
                        <p className="wp-subtext">VEH037 departed Peliyagoda Dock on Colombo coastal sequence.</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </aside>
          </div>

          {/* Fullwidth Stack: Active runs table & Hubs */}
          <div className="mc-fullwidth-stack">
            <div className="mc-widget">
              <section className="wp-panel mc-table-card">
                <div className="mc-card-head">
                  <div>
                    <span className="mc-card-eyebrow">Morning Dispatch Wave</span>
                    <h2 className="mc-card-title">Today Active Runs</h2>
                  </div>
                  <span className="mc-status-chip mc-status-chip-info">05:00 to 08:00 Window</span>
                </div>
                <div className="wp-table-wrap">
                  <table className="wp-table mc-dispatch-table">
                    <thead>
                      <tr>
                        <th>Run</th>
                        <th>Detail</th>
                        <th>Status</th>
                        <th style={{ width: 120 }}>Open</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong className="font-mono">VEH037 · R025229</strong></td>
                        <td>Kamal Silva · Stop 1 delivered · En route to OUT002 Duplication Rd</td>
                        <td><span className="mc-status-chip mc-status-chip-ok">In Transit</span></td>
                        <td><Link href="/driver/route" className="mc-table-link">Driver Route</Link></td>
                      </tr>
                      <tr>
                        <td><strong className="font-mono">Bay 04 · VEH004</strong></td>
                        <td>Priya Fernando · Pre departure checklist · 6/7 bays active at Peliyagoda</td>
                        <td><span className="mc-status-chip mc-status-chip-warn">Loading</span></td>
                        <td><Link href="/loader" className="mc-table-link">Warehouse Dock</Link></td>
                      </tr>
                      <tr>
                        <td><strong className="font-mono">Bay 04 Shortfall</strong></td>
                        <td>3 chilled cases missing at pick face · OUT004 Cinnamon Gardens</td>
                        <td><span className="mc-status-chip mc-status-chip-danger">Gate Hold</span></td>
                        <td><Link href="/loader/shortfall" className="mc-table-link">Shortfall</Link></td>
                      </tr>
                      <tr>
                        <td><strong className="font-mono">Validator</strong></td>
                        <td>VEH014 Trip 2 over weight cap · publish blocked</td>
                        <td><span className="mc-status-chip mc-status-chip-danger">Red</span></td>
                        <td><Link href="/dispatcher/validator" className="mc-table-link">Validator</Link></td>
                      </tr>
                      <tr>
                        <td><strong className="font-mono">Intake Split</strong></td>
                        <td>{Math.round(summary.ordersToday * 0.34)} reefer orders · {Math.round(summary.ordersToday * 0.66)} ambient · {summary.ordersToday} total intake</td>
                        <td><span className="mc-status-chip mc-status-chip-muted">Staged</span></td>
                        <td><Link href="/dispatcher/queue" className="mc-table-link">Order Queue</Link></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            {/* Hub Status Strip */}
            <div className="mc-widget">
              <section className="wp-panel mc-hub-strip">
                <div className="mc-hub-col">
                  <div className="mc-hub-head">
                    <strong>Peliyagoda Central DC</strong>
                    <span className="mc-status-chip mc-status-chip-ok">Primary</span>
                  </div>
                  <div className="mc-hub-metrics">
                    <span><strong className="font-mono">28</strong> vehicles</span>
                    <span><strong className="font-mono">118</strong> orders</span>
                    <span><strong className="font-mono">85%</strong> docks (6/7)</span>
                  </div>
                </div>
                <div className="mc-hub-divider" aria-hidden="true"></div>
                <div className="mc-hub-col">
                  <div className="mc-hub-head">
                    <strong>Kandy Regional Hub</strong>
                    <span className="mc-status-chip mc-status-chip-ok">Highland</span>
                  </div>
                  <div className="mc-hub-metrics">
                    <span><strong className="font-mono">4</strong> vehicles</span>
                    <span><strong className="font-mono">24</strong> orders</span>
                    <span><strong className="font-mono">50%</strong> docks (1/2)</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : (
        /* Tomorrow Planning Tab */
        <div data-wp-day-panel="tomorrow">
          <div className="wp-panel" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
            <span className="wp-label">Evening planning · Post cutoff 16:00 SLST</span>
            <h2 className="wp-headline-md" style={{ margin: '0.5rem 0' }}>
              Tomorrow: {summary.ordersToday} orders · {summary.pendingDeferrals} deferrals · {summary.activeFleet} trips available
            </h2>
            <p className="wp-subtext">
              Switch here after cutoff to plan tomorrow dispatch. Live exceptions and fleet map stay on Today.
            </p>
            <div className="mc-stat-grid" style={{ marginTop: '1.25rem' }}>
              <article className="mc-stat-card wp-panel">
                <span className="mc-stat-label">Total orders</span>
                <p className="mc-stat-value">{summary.ordersToday}</p>
              </article>
              <article className="mc-stat-card wp-panel">
                <span className="mc-stat-label">Chilled</span>
                <p className="mc-stat-value" style={{ color: 'var(--wp-info)' }}>{Math.round(summary.ordersToday * 0.34)}</p>
              </article>
              <article className="mc-stat-card wp-panel">
                <span className="mc-stat-label">Reefer trips</span>
                <p className="mc-stat-value">{Math.max(1, Math.round(summary.activeFleet * 0.3))}</p>
              </article>
              <article className="mc-stat-card wp-panel">
                <span className="mc-stat-label">Est deferrals</span>
                <p className="mc-stat-value" style={{ color: 'var(--wp-warning)' }}>{summary.pendingDeferrals}</p>
              </article>
            </div>
            <div style={{ marginTop: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
              <Link href="/dispatcher/queue" className="wp-btn wp-btn-primary">Open tomorrow queue</Link>
              <Link href="/dispatcher/allocation" className="wp-btn wp-btn-outline">Fleet allocation</Link>
              <Link href="/dispatcher/deferral" className="wp-btn wp-btn-outline">Plan deferrals</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
