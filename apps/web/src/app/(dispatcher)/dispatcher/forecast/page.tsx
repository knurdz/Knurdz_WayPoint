'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TrendingUp, AlertTriangle, Calendar, ArrowRight, BarChart2, ShieldAlert } from 'lucide-react';

interface DayForecast {
  day: string;
  peliyagoda: number;
  kandy: number;
  reeferRequired: number;
  reeferAvailable: number;
  event?: string;
}

const FORECAST_DAYS: DayForecast[] = [
  { day: 'Mon', peliyagoda: 54, kandy: 22, reeferRequired: 8, reeferAvailable: 9, event: 'Festival Peak' },
  { day: 'Tue', peliyagoda: 42, kandy: 18, reeferRequired: 6, reeferAvailable: 9 },
  { day: 'Wed', peliyagoda: 46, kandy: 19, reeferRequired: 7, reeferAvailable: 9 },
  { day: 'Thu', peliyagoda: 51, kandy: 21, reeferRequired: 8, reeferAvailable: 9 },
  { day: 'Fri', peliyagoda: 68, kandy: 32, reeferRequired: 11, reeferAvailable: 9, event: 'Payday Surge' },
  { day: 'Sat', peliyagoda: 62, kandy: 28, reeferRequired: 10, reeferAvailable: 9 },
  { day: 'Sun', peliyagoda: 35, kandy: 14, reeferRequired: 5, reeferAvailable: 9 },
];

export default function DispatcherForecastPage() {
  const [selectedDay, setSelectedDay] = useState<string>('Fri');
  const activeData = FORECAST_DAYS.find((d) => d.day === selectedDay) || FORECAST_DAYS[4];
  const maxVolume = 100;

  return (
    <main className="wp-main">
      <div className="screen-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <span className="wp-label" style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>
            DISP 10 · Predictive Planning
          </span>
          <h1 className="wp-headline-md" style={{ margin: '4px 0 6px', fontSize: 24, fontWeight: 700 }}>
            Next Week Demand Forecast
          </h1>
          <p className="wp-subtext" style={{ margin: 0, color: '#64748B', fontSize: 13 }}>
            Simulated Datathon volume by depot and temperature compartment · ISO week 40
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: 9999,
              background: 'rgba(217, 119, 6, 0.1)',
              color: '#D97706',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Payday Fri
          </span>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: 9999,
              background: 'rgba(37, 99, 235, 0.1)',
              color: '#2563EB',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Festival Mon
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 24 }}>
        <article
          className="wp-panel wp-chart-card"
          style={{
            background: '#FFFFFF',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            padding: 20,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Volume m³</span>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: '2px 0 0' }}>Peliyagoda vs Kandy</h2>
            </div>
            <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: '#377A8B' }}></span>
                Peliyagoda
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: '#94A3B8' }}></span>
                Kandy
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 200, paddingTop: 20, borderBottom: '1px solid #E2E8F0' }}>
            {FORECAST_DAYS.map((d) => {
              const isSelected = d.day === selectedDay;
              const pHeight = Math.round((d.peliyagoda / maxVolume) * 160);
              const kHeight = Math.round((d.kandy / maxVolume) * 160);

              return (
                <div
                  key={d.day}
                  onClick={() => setSelectedDay(d.day)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 160 }}>
                    <div
                      title={`Peliyagoda: ${d.peliyagoda} m³`}
                      style={{
                        width: 16,
                        height: `${pHeight}px`,
                        background: isSelected ? '#377A8B' : '#64748B',
                        borderRadius: '3px 3px 0 0',
                        transition: 'all 0.2s ease',
                      }}
                    />
                    <div
                      title={`Kandy: ${d.kandy} m³`}
                      style={{
                        width: 16,
                        height: `${kHeight}px`,
                        background: isSelected ? '#0D9488' : '#CBD5E1',
                        borderRadius: '3px 3px 0 0',
                        transition: 'all 0.2s ease',
                      }}
                    />
                  </div>
                  <span
                    style={{
                      marginTop: 8,
                      fontSize: 12,
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? '#0F172A' : '#64748B',
                    }}
                  >
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 12, fontSize: 12, color: '#64748B', display: 'flex', justifyContent: 'space-between' }}>
            <span>Selected: <strong>{activeData.day}</strong> ({activeData.event || 'Standard Operation'})</span>
            <span>Total: <strong>{activeData.peliyagoda + activeData.kandy} m³</strong></span>
          </div>
        </article>

        <article
          className="wp-panel screen-panel"
          style={{
            background: '#FFFFFF',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            padding: 20,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Reefer Trips Required</h2>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, margin: '16px 0 8px' }}>
              <span style={{ fontSize: 36, fontWeight: 800, color: activeData.reeferRequired > activeData.reeferAvailable ? '#D97706' : '#059669' }}>
                {activeData.reeferRequired}
              </span>
              <span style={{ fontSize: 14, color: '#64748B' }}>
                trips ({activeData.reeferAvailable} fleet chassis available)
              </span>
            </div>

            {activeData.reeferRequired > activeData.reeferAvailable ? (
              <div
                style={{
                  padding: 12,
                  borderRadius: 8,
                  background: 'rgba(217, 119, 6, 0.08)',
                  border: '1px solid rgba(217, 119, 6, 0.2)',
                  color: '#B45309',
                  fontSize: 13,
                  display: 'flex',
                  gap: 8,
                  alignItems: 'flex-start',
                }}
              >
                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>
                  Capacity deficit of {activeData.reeferRequired - activeData.reeferAvailable} reefer trips. High value ambient orders will be prioritized; plan deferrals early.
                </span>
              </div>
            ) : (
              <div
                style={{
                  padding: 12,
                  borderRadius: 8,
                  background: 'rgba(5, 150, 105, 0.08)',
                  border: '1px solid rgba(5, 150, 105, 0.2)',
                  color: '#059669',
                  fontSize: 13,
                }}
              >
                Fleet capacity adequate for projected chilled demand on this day.
              </div>
            )}
          </div>

          <div style={{ marginTop: 24 }}>
            <Link
              href="/dispatcher/deferral"
              className="wp-btn wp-btn-outline"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 16px',
                borderRadius: 8,
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                color: '#334155',
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Plan Deferrals <ArrowRight size={14} />
            </Link>
          </div>
        </article>
      </div>

      <section
        style={{
          background: '#FFFFFF',
          borderRadius: 12,
          border: '1px solid #E2E8F0',
          padding: 20,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 14px' }}>
          Compartment Demand Breakdown for {activeData.day}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          <div style={{ padding: 14, borderRadius: 8, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Fresh (Chilled 2°C to 4°C)</span>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#377A8B', marginTop: 4 }}>
              {Math.round((activeData.peliyagoda + activeData.kandy) * 0.42)} m³
            </div>
            <span style={{ fontSize: 11, color: '#64748B' }}>Strict reefer van requirement</span>
          </div>

          <div style={{ padding: 14, borderRadius: 8, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Ambient (Style & Tech)</span>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', marginTop: 4 }}>
              {Math.round((activeData.peliyagoda + activeData.kandy) * 0.50)} m³
            </div>
            <span style={{ fontSize: 11, color: '#64748B' }}>Box truck or rigid freight</span>
          </div>

          <div style={{ padding: 14, borderRadius: 8, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Frozen (-18°C)</span>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#6D28D9', marginTop: 4 }}>
              {Math.round((activeData.peliyagoda + activeData.kandy) * 0.08)} m³
            </div>
            <span style={{ fontSize: 11, color: '#64748B' }}>Ice cream eutectic compartments</span>
          </div>
        </div>
      </section>
    </main>
  );
}
