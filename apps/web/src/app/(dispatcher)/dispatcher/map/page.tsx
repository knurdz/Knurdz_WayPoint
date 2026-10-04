'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Volume2, VolumeX, Radio, AlertTriangle, Map, Compass } from 'lucide-react';
import { MapVehicle } from '@/app/api/dispatcher/map/route';
import { useFullDuplexVoice } from '@/hooks/useFullDuplexVoice';

const SriLankaFleetMap = dynamic(
  () => import('@/components/map/SriLankaFleetMap'),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          height: '480px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--wp-panel-bg, #f8fafc)',
          color: 'var(--wp-text-muted, #64748b)',
          fontSize: '0.85rem',
        }}
      >
        Initializing Sri Lanka Geographic Fleet Telemetry...
      </div>
    ),
  },
);

export default function DispatcherLiveMapPage() {
  const [vehicles, setVehicles] = useState<MapVehicle[]>([]);
  const [selectedId, setSelectedId] = useState<string>('VEH037');
  const [loading, setLoading] = useState(true);
  const [mapMode, setMapMode] = useState<'geographic' | 'schematic'>('geographic');
  const [chassisFilter, setChassisFilter] = useState<'all' | 'fridge' | 'van' | 'truck'>('all');
  const { speak, isSpeaking, cancelSpeech } = useFullDuplexVoice();

  const loadMapData = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch('/api/dispatcher/map', { signal });
      if (res.ok) {
        const data = await res.json();
        setVehicles(data.vehicles || []);
      }
    } catch (err: unknown) {
      if ((err as Error)?.name !== 'AbortError') {
        console.error('Failed to load map data', err);
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadMapData(controller.signal);
    const interval = setInterval(() => {
      loadMapData();
    }, 5000); // Polling telemetry updates every 5s
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [loadMapData]);

  const selectedVeh = vehicles.find((v) => v.id === selectedId) || vehicles[0];

  const handleVoiceBriefing = () => {
    if (!selectedVeh) return;
    if (isSpeaking) {
      cancelSpeech();
      return;
    }
    const tempInfo =
      selectedVeh.chilledTempC !== undefined
        ? `Cold chain is ${selectedVeh.coldChainStatus} at ${selectedVeh.chilledTempC} degrees Celsius.`
        : 'Dry freight chassis.';
    const briefingText = `Dispatch Briefing for ${selectedVeh.name}: Driver ${selectedVeh.driverName} on route ${selectedVeh.routeId}. Current position is ${selectedVeh.location} at speed ${selectedVeh.speedKmH} kilometers per hour. Completed ${selectedVeh.completedStops} of ${selectedVeh.totalStops} stops. ${tempInfo}`;
    speak(briefingText);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div className="screen-page-header">
        <div>
          <span className="wp-label">DISP 08 · Real-Time Sri Lanka Fleet Telemetry</span>
          <h1 className="wp-headline-md" style={{ margin: '0.35rem 0 0' }}>
            {selectedVeh
              ? `${selectedVeh.name} · ${selectedVeh.routeId} · ${selectedVeh.completedStops} / ${selectedVeh.totalStops} stops`
              : 'Fleet Live Map'}
          </h1>
          <p className="wp-subtext">
            Real-time GPS telemetry & predictive route interpolation across Sri Lanka
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Map View Mode Switcher */}
          <div
            style={{
              display: 'inline-flex',
              padding: '2px',
              borderRadius: '6px',
              background: 'var(--wp-border-color, #e2e8f0)',
              gap: '2px',
            }}
          >
            <button
              type="button"
              onClick={() => setMapMode('geographic')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: mapMode === 'geographic' ? '#ffffff' : 'transparent',
                color: mapMode === 'geographic' ? 'var(--wp-primary)' : 'inherit',
                boxShadow: mapMode === 'geographic' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <Compass size={13} /> Sri Lanka Map
            </button>
            <button
              type="button"
              onClick={() => setMapMode('schematic')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: mapMode === 'schematic' ? '#ffffff' : 'transparent',
                color: mapMode === 'schematic' ? 'var(--wp-primary)' : 'inherit',
                boxShadow: mapMode === 'schematic' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <Map size={13} /> Corridor Schematic
            </button>
          </div>

          <button
            type="button"
            onClick={() => setChassisFilter((prev) => (prev === 'truck' ? 'all' : 'truck'))}
            className={`wp-chassis-chip wp-chassis-chip--truck ${chassisFilter === 'truck' ? 'active' : ''}`}
            style={{
              cursor: 'pointer',
              border: chassisFilter === 'truck' ? '2px solid #0f172a' : '1px solid transparent',
              background: chassisFilter === 'truck' ? '#334155' : undefined,
              color: chassisFilter === 'truck' ? '#ffffff' : undefined,
            }}
          >
            Dry truck
          </button>
          <button
            type="button"
            onClick={() => setChassisFilter((prev) => (prev === 'fridge' ? 'all' : 'fridge'))}
            className={`wp-chassis-chip wp-chassis-chip--truck_freezer ${chassisFilter === 'fridge' ? 'active' : ''}`}
            style={{
              cursor: 'pointer',
              border: chassisFilter === 'fridge' ? '2px solid #0284c7' : '1px solid transparent',
              background: chassisFilter === 'fridge' ? '#0284c7' : undefined,
              color: chassisFilter === 'fridge' ? '#ffffff' : undefined,
            }}
          >
            ❄ Blue reefer
          </button>
          <button
            type="button"
            onClick={() => setChassisFilter((prev) => (prev === 'van' ? 'all' : 'van'))}
            className={`wp-chassis-chip wp-chassis-chip--van_freezer ${chassisFilter === 'van' ? 'active' : ''}`}
            style={{
              cursor: 'pointer',
              border: chassisFilter === 'van' ? '2px solid #10b981' : '1px solid transparent',
              background: chassisFilter === 'van' ? '#10b981' : undefined,
              color: chassisFilter === 'van' ? '#ffffff' : undefined,
            }}
          >
            Vans
          </button>
          <Link
            href="/driver/route"
            className="wp-btn wp-btn-outline"
            style={{ fontSize: '0.75rem', padding: '0.45rem 0.85rem', marginLeft: '0.5rem' }}
          >
            Driver view
          </Link>
        </div>
      </div>


      <div
        className="wp-fleet-map-layout"
        style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr', gap: '1.25rem' }}
      >
        {/* Map Stage: Geographic Sri Lanka Map or Schematic Corridor */}
        <section
          className="wp-panel screen-panel"
          style={{ padding: 0, overflow: 'hidden', position: 'relative', minHeight: '480px' }}
        >
          {mapMode === 'geographic' ? (
            <SriLankaFleetMap
              vehicles={vehicles}
              selectedVehicleId={selectedId}
              onSelectVehicle={setSelectedId}
              activeChassisFilter={chassisFilter}
              onFilterChange={setChassisFilter}
            />
          ) : (
            <div className="wp-corridor-map" style={{ width: '100%', height: '100%', minHeight: '440px' }}>
              <svg
                viewBox="0 0 800 420"
                style={{ width: '100%', height: '100%', display: 'block' }}
                role="img"
                aria-label="Fleet map showing all active vehicles on Colombo coastal corridor"
              >
                <defs>
                  <pattern id="fleetGrid" width="32" height="32" patternUnits="userSpaceOnUse">
                    <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#D7E2EA" strokeWidth="0.75" />
                  </pattern>
                </defs>
                <rect width="800" height="420" fill="#EEF3F6" />
                <rect width="800" height="420" fill="url(#fleetGrid)" opacity="0.55" />
                <path d="M0,300 Q200,260 400,280 T800,310 L800,420 L0,420 Z" fill="#D5E6EE" />
                <path
                  d="M60,200 Q280,180 520,195 T760,210"
                  fill="none"
                  stroke="#C5D0D8"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <path d="M80,200 L240,190" stroke="#16A34A" strokeWidth="4" fill="none" />
                <path d="M240,190 Q400,185 560,200" stroke="#377a8b" strokeWidth="4" fill="none" />
                <path
                  d="M560,200 Q680,210 760,215"
                  stroke="#CBD5E1"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray="8 6"
                />

                {/* Animated corridor breadcrumbs behind vehicles */}
                {vehicles.map((v) =>
                  (v.breadcrumbs || []).map((b, idx) => (
                    <circle
                      key={`${v.id}-crumb-${idx}`}
                      cx={b.x}
                      cy={b.y}
                      r={2.5}
                      fill={v.color}
                      opacity={b.opacity}
                    />
                  ))
                )}

                {/* Vehicles on corridor */}
                {vehicles.map((v) => {
                  const isSelected = selectedId === v.id;
                  const isBreach = v.coldChainStatus === 'breach';
                  return (
                    <g
                      key={v.id}
                      className={`wp-fleet-map-vehicle ${isSelected ? 'is-selected' : ''}`}
                      transform={`translate(${v.x}, ${v.y})`}
                      onClick={() => setSelectedId(v.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      {isSelected && (
                        <circle r="20" fill="none" stroke={isBreach ? '#ef4444' : '#377a8b'} strokeWidth="2" opacity="0.6">
                          <animate attributeName="r" values="14;24;14" dur="2s" repeatCount="indefinite" />
                        </circle>
                      )}
                      {isBreach && !isSelected && (
                        <circle r="18" fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.8">
                          <animate attributeName="r" values="12;20;12" dur="1.2s" repeatCount="indefinite" />
                        </circle>
                      )}
                      {v.markerType === 'circle' ? (
                        <circle r="12" fill={v.color} />
                      ) : (
                        <rect
                          x="-14"
                          y="-10"
                          width="28"
                          height="20"
                          rx="4"
                          fill={v.color}
                          opacity={v.id === 'VEH005' ? 0.6 : 1}
                        />
                      )}
                      <text
                        fill="#fff"
                        fontFamily="JetBrains Mono, monospace"
                        fontSize="7"
                        fontWeight="700"
                        textAnchor="middle"
                        y="3"
                      >
                        {v.code}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </section>


        {/* Sidebar Roster & Details */}
        <aside className="wp-panel screen-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 className="wp-headline-sm" style={{ margin: 0 }}>Fleet roster</h2>
            <span style={{ fontSize: '0.72rem', color: 'var(--wp-text-muted)' }}>
              {vehicles.length} Units Online
            </span>
          </div>

          <p
            className="decision-note wp-subtext"
            style={{ margin: '0.35rem 0 0.75rem', fontSize: '0.72rem', padding: '0.5rem 0.65rem' }}
          >
            Critical stop OUT003 · learned dwell 22 min · 6 min slack
          </p>

          <div
            className="wp-fleet-list"
            style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
          >
            {vehicles.map((v) => {
              const isSelected = selectedId === v.id;
              const markerLetter = v.chassis === 'truck' ? 'T' : v.chassis === 'van_freezer' ? 'V' : 'R';
              return (
                <button
                  key={v.id}
                  type="button"
                  className={`wp-fleet-list-item ${isSelected ? 'active' : ''}`}
                  onClick={() => setSelectedId(v.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.6rem 0.75rem',
                    border: isSelected ? '2px solid var(--wp-primary)' : '1px solid var(--wp-border-color, #e2e8f0)',
                    borderRadius: 'var(--wp-radius-sm, 6px)',
                    background: isSelected ? 'var(--wp-active-bg, rgba(14, 165, 233, 0.08))' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  <span
                    className={`wp-fleet-list-marker wp-fleet-list-marker--${v.chassis}`}
                    style={{
                      width: '1.5rem',
                      height: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      background: v.color,
                      color: '#fff',
                    }}
                  >
                    {markerLetter}
                  </span>
                  <span style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <strong className="font-mono" style={{ fontSize: '0.8rem' }}>
                        {v.name}
                      </strong>
                      {v.hasFridge && (
                        <span
                          style={{
                            fontSize: '0.62rem',
                            padding: '0.1rem 0.35rem',
                            borderRadius: '4px',
                            background: '#e0f2fe',
                            color: '#0284c7',
                            fontWeight: 700,
                          }}
                        >
                          ❄ Blue Reefer
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: '0.62rem',
                          padding: '0.1rem 0.35rem',
                          borderRadius: '4px',
                          background:
                            v.loadStatus === 'full'
                              ? '#fee2e2'
                              : v.loadStatus === 'half'
                              ? '#fef3c7'
                              : '#f1f5f9',
                          color:
                            v.loadStatus === 'full'
                              ? '#991b1b'
                              : v.loadStatus === 'half'
                              ? '#92400e'
                              : '#475569',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}
                      >
                        {v.loadStatus ?? 'HALF'} ({v.loadPct ?? 50}%)
                      </span>
                      {v.chilledTempC !== undefined && (
                        <span
                          style={{
                            fontSize: '0.65rem',
                            padding: '0.1rem 0.35rem',
                            borderRadius: '4px',
                            background:
                              v.coldChainStatus === 'breach'
                                ? '#fee2e2'
                                : v.coldChainStatus === 'warning'
                                ? '#fef3c7'
                                : '#dcfce7',
                            color:
                              v.coldChainStatus === 'breach'
                                ? '#991b1b'
                                : v.coldChainStatus === 'warning'
                                ? '#92400e'
                                : '#166534',
                            fontWeight: 700,
                          }}
                        >
                          {v.chilledTempC}°C
                        </span>
                      )}
                    </div>
                    <span className="wp-subtext" style={{ display: 'block', fontSize: '0.72rem' }}>
                      {v.statusText}
                    </span>
                  </span>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: v.isOnline ? 'var(--wp-success, #22c55e)' : 'var(--wp-muted, #94a3b8)',
                    }}
                    title={v.isOnline ? 'Online' : 'Offline'}
                  />
                </button>
              );
            })}
          </div>

          {selectedVeh && (
            <div style={{ marginTop: '1.25rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem',
                }}
              >
                <h3 className="wp-headline-sm" style={{ fontSize: '0.9rem', margin: 0 }}>
                  {selectedVeh.name} Stops ({selectedVeh.stops.length})
                </h3>

                {/* One click vocal vehicle briefing */}
                <button
                  type="button"
                  onClick={handleVoiceBriefing}
                  className="wp-btn wp-btn-outline"
                  style={{
                    padding: '0.3rem 0.6rem',
                    fontSize: '0.72rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                  title="Speak vehicle briefing aloud"
                >
                  {isSpeaking ? <VolumeX size={13} color="#ea580c" /> : <Volume2 size={13} />}
                  <span>{isSpeaking ? 'Halt Voice' : 'Voice Briefing'}</span>
                </button>
              </div>

              {/* Vehicle Live Telemetry Strip */}
              <div
                style={{
                  padding: '0.5rem 0.65rem',
                  borderRadius: '6px',
                  background: 'var(--wp-panel-bg)',
                  border: '1px solid var(--wp-border-color, #e2e8f0)',
                  marginBottom: '0.75rem',
                  fontSize: '0.74rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--wp-text-muted)' }}>Location:</span>
                  <span style={{ fontWeight: 600 }}>{selectedVeh.location}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--wp-text-muted)' }}>Speed / Heading:</span>
                  <span style={{ fontWeight: 600 }}>{selectedVeh.speedKmH} km/h · {selectedVeh.heading || 0}° N</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--wp-text-muted)' }}>Chassis / Fridge:</span>
                  <span style={{ fontWeight: 600, color: selectedVeh.hasFridge ? '#0284c7' : 'inherit' }}>
                    {selectedVeh.chassisLabel} {selectedVeh.hasFridge ? '(Blue Reefer ❄)' : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--wp-text-muted)' }}>Load Capacity:</span>
                  <span
                    style={{
                      fontWeight: 700,
                      color:
                        selectedVeh.loadStatus === 'full'
                          ? '#ef4444'
                          : selectedVeh.loadStatus === 'half'
                          ? '#f59e0b'
                          : '#64748b',
                    }}
                  >
                    {(selectedVeh.loadStatus ?? 'HALF').toUpperCase()} ({selectedVeh.loadPct ?? 50}% · {selectedVeh.weightKg ?? 1500}kg / {selectedVeh.maxWeightKg ?? 2000}kg)
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--wp-text-muted)' }}>Telemetry Mode:</span>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: selectedVeh.telemetrySource === 'LIVE_GPS' ? '#dcfce7' : '#e0f2fe',
                      color: selectedVeh.telemetrySource === 'LIVE_GPS' ? '#15803d' : '#0369a1',
                    }}
                  >
                    {selectedVeh.telemetryBadge || (selectedVeh.telemetrySource === 'LIVE_GPS' ? 'Satellite GPS' : 'Predictive Interpolation')}
                  </span>
                </div>

                {selectedVeh.chilledTempC !== undefined && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--wp-text-muted)' }}>Thermal Status:</span>
                    <span
                      style={{
                        fontWeight: 700,
                        color:
                          selectedVeh.coldChainStatus === 'breach'
                            ? '#b91c1c'
                            : selectedVeh.coldChainStatus === 'warning'
                            ? '#b45309'
                            : '#15803d',
                      }}
                    >
                      {selectedVeh.chilledTempC}°C ({selectedVeh.coldChainStatus})
                    </span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {selectedVeh.stops.map((stop) => (
                  <div
                    key={stop.stopNumber}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.45rem 0.6rem',
                      background: 'var(--wp-panel-bg)',
                      border: '1px solid var(--wp-border-color, #e2e8f0)',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                    }}
                  >
                    <span>
                      <strong>#{stop.stopNumber}</strong> {stop.outletName}
                    </span>
                    <span
                      className={`mc-status-chip ${
                        stop.status === 'Delivered'
                          ? 'mc-status-chip-ok'
                          : stop.status === 'EnRoute'
                          ? 'mc-status-chip-info'
                          : 'mc-status-chip-muted'
                      }`}
                    >
                      {stop.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: '1rem' }}>
            <Link href="/store" className="mc-link" style={{ fontSize: '0.78rem' }}>
              Outlet detail →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
