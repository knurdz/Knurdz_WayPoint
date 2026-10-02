'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import KpiCard from '@/components/dispatcher/KpiCard';
import ColdChainAlert from '@/components/dispatcher/ColdChainAlert';
import {
  Map,
  ListOrdered,
  Truck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function DispatcherPage() {
  const [day, setDay] = useState<'today' | 'tomorrow'>('today');

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* Top Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            display: 'inline-flex',
            padding: 3,
            borderRadius: 8,
            background: 'var(--wp-subpanel, #F8F8F7)',
            border: '1px solid var(--wp-border, rgba(0,0,0,0.08))',
          }}>
            <button
              type="button"
              onClick={() => setDay('today')}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                border: 'none',
                background: day === 'today' ? 'var(--wp-primary, #377A8B)' : 'transparent',
                color: day === 'today' ? '#FFFFFF' : 'var(--wp-subtext, #3E555C)',
                fontWeight: 600,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Today (Live Ops)
            </button>
            <button
              type="button"
              onClick={() => setDay('tomorrow')}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                border: 'none',
                background: day === 'tomorrow' ? 'var(--wp-primary, #377A8B)' : 'transparent',
                color: day === 'tomorrow' ? '#FFFFFF' : 'var(--wp-subtext, #3E555C)',
                fontWeight: 600,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Tomorrow (Evening Batch)
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link
            href="/dispatcher/map"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid var(--wp-border, rgba(0,0,0,0.08))',
              background: 'var(--wp-panel, #FFFFFF)',
              color: 'var(--wp-subtext, #3E555C)',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <Map size={16} />
            <span>Fleet Map</span>
          </Link>

          <Link
            href="/dispatcher/queue"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 8,
              background: 'var(--wp-primary, #377A8B)',
              color: '#FFFFFF',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <ListOrdered size={16} />
            <span>Review Queue (142)</span>
          </Link>
        </div>
      </div>

      {/* Cold Chain Alert */}
      <ColdChainAlert reeferDemand={24} reeferCapacity={16} depot="Peliyagoda Hub" />

      {/* KPI Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 16,
        marginBottom: 28,
      }}>
        <KpiCard
          label="Orders Today"
          value="142"
          subtext="138 Confirmed · 4 Pending Deferrals"
          trend="+6.2%"
          trendUp={true}
        />
        <KpiCard
          label="Active Fleet Units"
          value="52 / 60"
          subtext="16 Chilled Reefer · 36 Ambient"
          trend="8 in Workshop"
          trendUp={false}
        />
        <KpiCard
          label="On Time Dispatch Rate"
          value="98.4%"
          subtext="Pre dawn window: 100% on schedule"
          trend="+0.8%"
          trendUp={true}
        />
        <KpiCard
          label="Weekly Fuel Quota"
          value="74.2%"
          subtext="Estimated 1,420 L remaining"
          trend="Budget Green"
          trendUp={true}
        />
      </div>

      {/* Two Column Depot Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
        gap: 20,
        marginBottom: 28,
      }}>
        {/* Peliyagoda Hub Card */}
        <div style={{
          background: 'var(--wp-panel, #FFFFFF)',
          border: '1px solid var(--wp-border, rgba(0,0,0,0.08))',
          borderRadius: 12,
          padding: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--wp-heading, #1A1C1C)' }}>
                Peliyagoda Hub (Western Province)
              </h3>
              <span style={{ fontSize: 12, color: 'var(--wp-muted, #6E838A)' }}>
                Primary depot for Colombo, Gampaha, Kalutara, Galle, Matara
              </span>
            </div>
            <span style={{
              padding: '3px 8px',
              borderRadius: 6,
              background: 'rgba(22, 163, 74, 0.1)',
              color: '#16A34A',
              fontSize: 11,
              fontWeight: 700,
            }}>
              Operational
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div style={{ padding: 12, borderRadius: 8, background: 'var(--wp-subpanel, #F8F8F7)' }}>
              <div style={{ fontSize: 11, color: 'var(--wp-muted, #6E838A)' }}>Assigned Orders</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--wp-heading, #1A1C1C)' }}>94</div>
            </div>
            <div style={{ padding: 12, borderRadius: 8, background: 'var(--wp-subpanel, #F8F8F7)' }}>
              <div style={{ fontSize: 11, color: 'var(--wp-muted, #6E838A)' }}>Available Fleet</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--wp-heading, #1A1C1C)' }}>36</div>
            </div>
            <div style={{ padding: 12, borderRadius: 8, background: 'var(--wp-subpanel, #F8F8F7)' }}>
              <div style={{ fontSize: 11, color: 'var(--wp-muted, #6E838A)' }}>Reefer Units</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#D97706' }}>12</div>
            </div>
          </div>

          <Link
            href="/dispatcher/allocation"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--wp-primary, #377A8B)',
              textDecoration: 'none',
            }}
          >
            <span>Open Peliyagoda Allocation Board</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Kandy Hub Card */}
        <div style={{
          background: 'var(--wp-panel, #FFFFFF)',
          border: '1px solid var(--wp-border, rgba(0,0,0,0.08))',
          borderRadius: 12,
          padding: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--wp-heading, #1A1C1C)' }}>
                Kandy Hub (Central & Hill Country)
              </h3>
              <span style={{ fontSize: 12, color: 'var(--wp-muted, #6E838A)' }}>
                Serving Kandy, Matale, Nuwara Eliya with van only mountain access
              </span>
            </div>
            <span style={{
              padding: '3px 8px',
              borderRadius: 6,
              background: 'rgba(22, 163, 74, 0.1)',
              color: '#16A34A',
              fontSize: 11,
              fontWeight: 700,
            }}>
              Operational
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div style={{ padding: 12, borderRadius: 8, background: 'var(--wp-subpanel, #F8F8F7)' }}>
              <div style={{ fontSize: 11, color: 'var(--wp-muted, #6E838A)' }}>Assigned Orders</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--wp-heading, #1A1C1C)' }}>48</div>
            </div>
            <div style={{ padding: 12, borderRadius: 8, background: 'var(--wp-subpanel, #F8F8F7)' }}>
              <div style={{ fontSize: 11, color: 'var(--wp-muted, #6E838A)' }}>Available Fleet</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--wp-heading, #1A1C1C)' }}>16</div>
            </div>
            <div style={{ padding: 12, borderRadius: 8, background: 'var(--wp-subpanel, #F8F8F7)' }}>
              <div style={{ fontSize: 11, color: 'var(--wp-muted, #6E838A)' }}>Van Units</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--wp-primary, #377A8B)' }}>10</div>
            </div>
          </div>

          <Link
            href="/dispatcher/allocation"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--wp-primary, #377A8B)',
              textDecoration: 'none',
            }}
          >
            <span>Open Kandy Allocation Board</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
