'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Truck, Building2, Container, MapPin, Clock, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';

type OutletAccessType = 'van_only' | 'mall_dock' | 'rear_dock' | 'street';

interface OutletProfile {
  id: string;
  name: string;
  location: string;
  brand: string;
  temp: string;
  vehicle: string;
  clearance: string;
  window: string;
  district: string;
  depot: string;
  coordinates: string;
  contact: string;
  note: string;
}

const OUTLET_DATA: Record<OutletAccessType, OutletProfile> = {
  van_only: {
    id: 'OUT001',
    name: 'Fresh Galle Rd',
    location: 'Colombo 03',
    brand: 'Fresh',
    temp: 'Chilled reefer only',
    vehicle: 'Reefer van only, no rigid truck',
    clearance: '3.2 m curb bay',
    window: '05:00 to 07:30',
    district: 'Colombo',
    depot: 'Peliyagoda Hub',
    coordinates: '6.9034 N, 79.8540 E',
    contact: 'Anjali (Receiving Desk, 077 123 4567)',
    note: 'Narrow street approach. Heavy rigid chassis cannot execute turning radius. Assign VEH037 or VEH002 only.',
  },
  mall_dock: {
    id: 'OUT003',
    name: 'Colombo City Centre',
    location: 'Colombo 02',
    brand: 'Style & Tech',
    temp: 'Ambient',
    vehicle: 'Any chassis with mall security permit',
    clearance: 'Basement B2 clearance 3.8 m',
    window: '09:00 to 11:00 SLST (strict)',
    district: 'Colombo',
    depot: 'Peliyagoda Hub',
    coordinates: '6.9167 N, 79.8553 E',
    contact: 'Security Dock Master (011 234 5678)',
    note: 'Strict dock schedule. Vehicles arriving outside 09:00 to 11:00 will be turned away by mall operations.',
  },
  rear_dock: {
    id: 'OUT008',
    name: 'Kandy City Fresh',
    location: 'Peradeniya Rd',
    brand: 'Fresh',
    temp: 'Chilled & Frozen',
    vehicle: 'Medium rigid truck or reefer truck',
    clearance: 'Standard 4.2 m roll up bay',
    window: '05:30 to 08:00',
    district: 'Kandy',
    depot: 'Kandy Depot',
    coordinates: '7.2906 N, 80.6337 E',
    contact: 'Kamal (Warehouse Bay 2, 071 987 6543)',
    note: 'Reverse loading sequence mandatory at depot. Last stop crates must be loaded closest to rear roll up shutter.',
  },
  street: {
    id: 'OUT012',
    name: 'Negombo Coastal Outlet',
    location: 'Main St, Negombo',
    brand: 'Fresh & Ambient',
    temp: 'Ambient with cool box',
    vehicle: 'Truck, reefer truck, or van',
    clearance: 'Open street curb',
    window: '05:30 to 08:00',
    district: 'Gampaha',
    depot: 'Peliyagoda Hub',
    coordinates: '7.2083 N, 79.8358 E',
    contact: 'Ravi (Store Supervisor, 076 555 1234)',
    note: 'Parallel street curb unload. Maximum 15 minute parking window permitted before morning traffic restrictions.',
  },
};

export default function DispatcherOutletPage() {
  const [selectedType, setSelectedType] = useState<OutletAccessType>('van_only');
  const current = OUTLET_DATA[selectedType];

  return (
    <main className="wp-main">
      <div className="screen-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <span className="wp-label" style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>
            DISP 09 · {current.id}
          </span>
          <h1 className="wp-headline-md" style={{ margin: '4px 0 8px', fontSize: 24, fontWeight: 700 }}>
            {current.name} · {current.location}
          </h1>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 9999,
                background: 'rgba(55, 122, 139, 0.1)',
                color: '#377A8B',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <Truck size={14} /> {selectedType}
            </span>
            <span style={{ fontSize: 12, color: '#64748B' }}>Depot: {current.depot}</span>
          </div>
        </div>
        <Link
          href="/dispatcher/allocation"
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
          Assign on board <ArrowRight size={14} />
        </Link>
      </div>

      <div
        className="wp-outlet-switcher"
        role="tablist"
        aria-label="Outlet access type"
        style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}
      >
        <button
          type="button"
          className={`wp-outlet-type-btn ${selectedType === 'van_only' ? 'active' : ''}`}
          onClick={() => setSelectedType('van_only')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 8,
            border: selectedType === 'van_only' ? '2px solid #377A8B' : '1px solid #CBD5E1',
            background: selectedType === 'van_only' ? 'rgba(55, 122, 139, 0.08)' : '#FFFFFF',
            color: selectedType === 'van_only' ? '#377A8B' : '#475569',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          <Truck size={16} /> van_only
        </button>

        <button
          type="button"
          className={`wp-outlet-type-btn ${selectedType === 'mall_dock' ? 'active' : ''}`}
          onClick={() => setSelectedType('mall_dock')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 8,
            border: selectedType === 'mall_dock' ? '2px solid #6D28D9' : '1px solid #CBD5E1',
            background: selectedType === 'mall_dock' ? 'rgba(109, 40, 217, 0.08)' : '#FFFFFF',
            color: selectedType === 'mall_dock' ? '#6D28D9' : '#475569',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          <Building2 size={16} /> mall_dock
        </button>

        <button
          type="button"
          className={`wp-outlet-type-btn ${selectedType === 'rear_dock' ? 'active' : ''}`}
          onClick={() => setSelectedType('rear_dock')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 8,
            border: selectedType === 'rear_dock' ? '2px solid #B45309' : '1px solid #CBD5E1',
            background: selectedType === 'rear_dock' ? 'rgba(180, 83, 9, 0.08)' : '#FFFFFF',
            color: selectedType === 'rear_dock' ? '#B45309' : '#475569',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          <Container size={16} /> rear_dock
        </button>

        <button
          type="button"
          className={`wp-outlet-type-btn ${selectedType === 'street' ? 'active' : ''}`}
          onClick={() => setSelectedType('street')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 8,
            border: selectedType === 'street' ? '2px solid #0D9488' : '1px solid #CBD5E1',
            background: selectedType === 'street' ? 'rgba(13, 148, 136, 0.08)' : '#FFFFFF',
            color: selectedType === 'street' ? '#0D9488' : '#475569',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          <MapPin size={16} /> street
        </button>
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
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, marginBottom: 16 }}>
            {selectedType} Physical Specifications
          </h2>

          <dl style={{ display: 'grid', gridTemplateColumns: '120px 1fr', rowGap: 10, fontSize: 13, margin: 0 }}>
            <dt style={{ color: '#64748B', fontWeight: 600 }}>Brand Segment</dt>
            <dd style={{ margin: 0, fontWeight: 500 }}>{current.brand}</dd>

            <dt style={{ color: '#64748B', fontWeight: 600 }}>Temperature</dt>
            <dd style={{ margin: 0, fontWeight: 500 }}>{current.temp}</dd>

            <dt style={{ color: '#64748B', fontWeight: 600 }}>Eligible Chassis</dt>
            <dd style={{ margin: 0, fontWeight: 500 }}>{current.vehicle}</dd>

            <dt style={{ color: '#64748B', fontWeight: 600 }}>Bay Clearance</dt>
            <dd style={{ margin: 0, fontWeight: 500 }}>{current.clearance}</dd>

            <dt style={{ color: '#64748B', fontWeight: 600 }}>Receiving Slot</dt>
            <dd style={{ margin: 0, fontWeight: 500, color: '#377A8B' }}>{current.window}</dd>

            <dt style={{ color: '#64748B', fontWeight: 600 }}>Administrative</dt>
            <dd style={{ margin: 0, fontWeight: 500 }}>{current.district} District</dd>
          </dl>

          <div
            style={{
              marginTop: 20,
              padding: 16,
              borderRadius: 8,
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              textAlign: 'center',
            }}
          >
            {selectedType === 'van_only' && (
              <svg viewBox="0 0 200 80" width="200" style={{ margin: '0 auto', display: 'block' }} aria-hidden="true">
                <rect x="10" y="40" width="50" height="28" rx="4" fill="#377A8B" />
                <rect x="70" y="50" width="120" height="8" fill="#CBD5E1" />
                <text x="35" y="58" fill="#FFF" fontSize="8" textAnchor="middle" fontWeight="700">VAN</text>
                <text x="130" y="45" fill="#64748B" fontSize="7" textAnchor="middle">3.2m curb</text>
              </svg>
            )}

            {selectedType === 'mall_dock' && (
              <svg viewBox="0 0 200 80" width="200" style={{ margin: '0 auto', display: 'block' }} aria-hidden="true">
                <rect x="60" y="15" width="80" height="50" rx="4" fill="#E2E8F0" stroke="#94A3B8" />
                <rect x="75" y="45" width="50" height="20" fill="#6D28D9" opacity="0.3" />
                <text x="100" y="38" fill="#6D28D9" fontSize="8" textAnchor="middle" fontWeight="700">DOCK B2</text>
                <text x="100" y="72" fill="#64748B" fontSize="7" textAnchor="middle">09:00 to 11:00</text>
              </svg>
            )}

            {selectedType === 'rear_dock' && (
              <svg viewBox="0 0 200 80" width="200" style={{ margin: '0 auto', display: 'block' }} aria-hidden="true">
                <rect x="20" y="25" width="100" height="40" rx="4" fill="#B45309" opacity="0.2" stroke="#B45309" />
                <rect x="120" y="35" width="60" height="20" rx="2" fill="#475569" />
                <text x="70" y="48" fill="#B45309" fontSize="7" textAnchor="middle" fontWeight="700">REAR BAY</text>
              </svg>
            )}

            {selectedType === 'street' && (
              <svg viewBox="0 0 200 80" width="200" style={{ margin: '0 auto', display: 'block' }} aria-hidden="true">
                <rect x="10" y="52" width="180" height="6" fill="#CBD5E1" />
                <rect x="40" y="38" width="70" height="22" rx="3" fill="#64748B" />
                <text x="75" y="52" fill="#FFF" fontSize="7" textAnchor="middle" fontWeight="700">PARALLEL</text>
              </svg>
            )}

            <p style={{ margin: '10px 0 0', fontSize: 12, color: '#475569' }}>
              {current.note}
            </p>
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
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, marginBottom: 16 }}>
            Operational Geolocation & Receiving
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ padding: 12, borderRadius: 8, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600, display: 'block' }}>GPS Coordinates</span>
              <span style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 700, color: '#0F172A' }}>
                {current.coordinates}
              </span>
            </div>

            <div style={{ padding: 12, borderRadius: 8, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600, display: 'block' }}>Primary Receiving Contact</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>
                {current.contact}
              </span>
            </div>

            <div style={{ padding: 12, borderRadius: 8, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600, display: 'block' }}>Historical SLA Compliance</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#059669' }}>98.6%</span>
                <span style={{ fontSize: 12, color: '#64748B' }}>Avg service: 14 minutes</span>
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              <Link
                href="/dispatcher/map"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 13,
                  color: '#377A8B',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Inspect on live network map <ExternalLink size={14} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
