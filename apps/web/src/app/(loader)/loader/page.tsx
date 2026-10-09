'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ScanBarcode,
  BadgeCheck,
  AlertTriangle,
  Clock,
  X,
  CheckCircle2,
} from 'lucide-react';

interface DockLine {
  id: string;
  name: string;
  sku: string;
  qty: string;
  temp: string;
  tempBadgeClass: string;
  img: string;
  isShort?: boolean;
  shortLabel?: string;
  verified: boolean;
}

interface DockStop {
  step: number;
  label: string;
  title: string;
  window: string;
  isAlert?: boolean;
  lines: DockLine[];
}

const INITIAL_STOPS: DockStop[] = [
  {
    step: 1,
    label: 'Load first',
    title: 'Stop 4 · OUT010 Fresh Colombo 03',
    window: '05:00 to 07:30',
    lines: [
      {
        id: 's4-1',
        name: 'Frozen Farm Vegetables 1kg',
        sku: 'SKU-FZ-VEG-01',
        qty: '12 Cases',
        temp: '−18°C Frozen',
        tempBadgeClass: 'wp-badge-info',
        img: '/assets/products/frozen-veg.jpg',
        verified: false,
      },
      {
        id: 's4-2',
        name: 'Chilled Greek Yogurt 500g',
        sku: 'SKU-CH-YOG-02',
        qty: '8 Cases',
        temp: '+4°C Chilled',
        tempBadgeClass: 'wp-badge-success',
        img: '/assets/products/greek-yogurt.jpg',
        verified: false,
      },
    ],
  },
  {
    step: 2,
    label: 'Mid compartment',
    title: 'Stop 3 · OUT008 Fresh Colombo 04',
    window: '05:00 to 07:30',
    lines: [
      {
        id: 's3-1',
        name: 'Ambient Organic Brown Rice 5kg',
        sku: 'SKU-AM-RICE-05',
        qty: '20 Sacks',
        temp: 'Ambient',
        tempBadgeClass: '',
        img: '/assets/products/organic-rice.jpg',
        verified: false,
      },
    ],
  },
  {
    step: 3,
    label: 'Forward · short',
    title: 'Stop 2 · OUT004 Fresh Colombo 07',
    window: '05:00 to 07:30',
    isAlert: true,
    lines: [
      {
        id: 's2-1',
        name: 'Pasteurized Fresh Milk 1L',
        sku: 'SKU-CH-MILK-1L',
        qty: '12 / 15 Cases',
        temp: 'Chilled',
        tempBadgeClass: 'wp-badge-info',
        img: '/assets/products/milk-bottle.jpg',
        isShort: true,
        shortLabel: 'Short −3',
        verified: false,
      },
    ],
  },
  {
    step: 4,
    label: 'Load last',
    title: 'Stop 1 · OUT001 Fresh Galle Rd',
    window: '05:00 to 07:30',
    lines: [
      {
        id: 's1-1',
        name: 'Chilled Dairy & Meat Selection',
        sku: 'DEL-88401',
        qty: '4,850 kg',
        temp: 'Reefer',
        tempBadgeClass: 'wp-badge-info',
        img: '/assets/products/chilled-meat.jpg',
        verified: false,
      },
      {
        id: 's1-2',
        name: 'Ambient Bakery Carts',
        sku: 'DEL-88402',
        qty: '2,100 kg',
        temp: 'Ambient',
        tempBadgeClass: '',
        img: '/assets/products/bakery-bread.jpg',
        verified: false,
      },
    ],
  },
];

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

function LoaderDockContent() {
  const searchParams = useSearchParams();
  const tripId = searchParams.get('tripId') || 'TRIP_001';
  const vehicleId = searchParams.get('vehicleId') || 'VEH037';

  const [stops, setStops] = useState<DockStop[]>(INITIAL_STOPS);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannedInput, setScannedInput] = useState('');
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/loader/runs?tripId=${encodeURIComponent(tripId)}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (data.trip && data.trip.stops && Array.isArray(data.trip.stops) && data.trip.stops.length > 0) {
          setStops(data.trip.stops);
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('Failed to load trip stops', err);
        }
      });
    return () => controller.abort();
  }, [tripId]);

  const totalLines = stops.reduce((acc, s) => acc + s.lines.length, 0);
  const verifiedCount = stops.reduce(
    (acc, s) => acc + s.lines.filter((l) => l.verified).length,
    0
  );
  const progressPct = totalLines > 0 ? Math.round((verifiedCount / totalLines) * 100) : 0;

  const toggleCheck = (lineId: string) => {
    setStops((prev) =>
      prev.map((stop) => ({
        ...stop,
        lines: stop.lines.map((line) =>
          line.id === lineId ? { ...line, verified: !line.verified } : line
        ),
      }))
    );
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedInput.trim()) return;

    let found = false;
    setStops((prev) =>
      prev.map((stop) => ({
        ...stop,
        lines: stop.lines.map((line) => {
          if (
            line.sku.toLowerCase() === scannedInput.trim().toLowerCase() ||
            line.name.toLowerCase().includes(scannedInput.trim().toLowerCase())
          ) {
            found = true;
            return { ...line, verified: true };
          }
          return line;
        }),
      }))
    );

    if (found) {
      setScanMessage(`Barcode matched: ${scannedInput.toUpperCase()} verified successfully!`);
    } else {
      setScanMessage(`No pending SKU matched: ${scannedInput}`);
    }
    setScannedInput('');
  };

  return (
    <div className="dock-main">
      <div className="store-page-header">
        <div>
          <div className="store-page-meta">
            <span className="wp-state wp-state-success">Cold Seal Active</span>
            <span className="font-mono store-outlet-id">{vehicleId}</span>
          </div>
          <h1 className="wp-headline-md store-page-title">Bay 04 Load Sequence: {vehicleId}</h1>
          <p className="wp-subtext store-page-subtitle">Peliyagoda · {tripId} · reverse LIFO staging · window 05:00 to 07:30</p>
        </div>
        <div className="dock-page-actions">
          <button
            type="button"
            className="wp-btn wp-btn-outline"
            onClick={() => setScannerOpen(true)}
          >
            <ScanBarcode size={15} />
            <span>Scan Barcode</span>
          </button>
          <Link href={`/loader/signoff?tripId=${encodeURIComponent(tripId)}&vehicleId=${encodeURIComponent(vehicleId)}`} className="wp-btn wp-btn-primary">
            <BadgeCheck size={15} />
            <span>Departure signoff</span>
          </Link>
        </div>
      </div>

      <div className="wp-kpi-row store-kpi-row">
        <div className="wp-kpi">
          <span className="wp-label">Verified</span>
          <p className="wp-kpi-value">{verifiedCount}/{totalLines}</p>
          <div className="wp-meter dock-progress-meter">
            <div className="wp-meter-fill" style={{ width: `${progressPct}%` }}></div>
          </div>
          <span className="wp-subtext store-kpi-caption">Lines checked on this trip</span>
        </div>
        <div className="wp-kpi">
          <span className="wp-label">Shortfall</span>
          <p className="wp-kpi-value" style={{ color: 'var(--wp-error)' }}>−3</p>
          <span className="wp-subtext store-kpi-caption">Milk cases · Stop 2</span>
        </div>
        <div className="wp-kpi">
          <span className="wp-label">Stops</span>
          <p className="wp-kpi-value">4</p>
          <span className="wp-subtext store-kpi-caption">Load last stop first</span>
        </div>
        <div className="wp-kpi">
          <span className="wp-label">Window</span>
          <p className="wp-kpi-value" style={{ fontSize: '1.45rem' }}>05:00</p>
          <span className="wp-subtext store-kpi-caption">Closes 07:30 SLST</span>
        </div>
      </div>

      <div className="dock-layout">
        <section className="dock-sequence-panel" aria-label="Load sequence">
          <div className="store-panel-head">
            <div>
              <span className="wp-label">Reverse Load</span>
              <h2 className="wp-headline-sm store-panel-title">Stops in LIFO order</h2>
            </div>
            <span className="wp-subtext store-panel-count">6 lines</span>
          </div>

          <div id="dock-load-list" className="dock-load-list">
            {stops.map((stop) => (
              <article key={stop.step} className={`dock-stop ${stop.isAlert ? 'is-alert' : ''}`}>
                <header className="dock-stop-header">
                  <span className="dock-step">{stop.step}</span>
                  <div className="dock-stop-copy">
                    <span className="wp-label">{stop.label}</span>
                    <strong>{stop.title}</strong>
                  </div>
                  <span className="wp-window-pill">
                    <Clock size={12} /> {stop.window}
                  </span>
                </header>

                {stop.lines.map((line) => (
                  <div key={line.id} className={`dock-load-line ${line.isShort ? 'is-short' : ''}`}>
                    <input
                      type="checkbox"
                      id={line.id}
                      checked={line.verified}
                      onChange={() => toggleCheck(line.id)}
                      aria-label={`Verify ${line.name}`}
                    />
                    <img src={line.img} className="wp-product-thumb" alt={line.name} />
                    <div className="dock-load-copy">
                      <span className="dock-load-name">{line.name}</span>
                      <span className="font-mono dock-load-sku">{line.sku}</span>
                    </div>
                    <div className="dock-load-meta">
                      <span className="font-mono dock-load-qty">{line.qty}</span>
                      {line.isShort ? (
                        <span className="wp-flag wp-flag-error">{line.shortLabel}</span>
                      ) : (
                        <span className={`wp-badge ${line.tempBadgeClass}`}>{line.temp}</span>
                      )}
                    </div>
                  </div>
                ))}
              </article>
            ))}
          </div>
        </section>

        <aside className="dock-side" aria-label="Bay notes">
          <div className="dock-side-card">
            <span className="wp-label">Open issue</span>
            <h2 className="wp-headline-sm store-panel-title">3 milk cases missing</h2>
            <p className="wp-subtext dock-side-copy">Stop 2, OUT004 Colombo 07. Chilled bay count is 12 of 15 cases.</p>
            <Link href="/loader/shortfall" className="wp-btn wp-btn-primary">
              <AlertTriangle size={15} />
              <span>Report Shortfall</span>
            </Link>
          </div>

          <div className="dock-side-card">
            <span className="wp-label">Compartments</span>
            <h2 className="wp-headline-sm store-panel-title">Hino 700 · 16T</h2>
            <ul className="dock-temp-list">
              <li><span>Frozen</span><strong>12 cases</strong></li>
              <li><span>Chilled</span><strong>20 cases + 4,850 kg</strong></li>
              <li><span>Ambient</span><strong>20 sacks + 2,100 kg</strong></li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Barcode Scanner Modal */}
      {scannerOpen && (
        <div className="wp-drawer-backdrop" style={{ display: 'block' }}>
          <div className="wp-dialog" style={{ maxWidth: 440, margin: '10vh auto', padding: '1.5rem', background: 'var(--wp-panel)', borderRadius: 'var(--radius-md)' }}>
            <div className="wp-flex-between" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ScanBarcode size={20} color="var(--wp-primary)" />
                <h3 className="wp-title-md" style={{ margin: 0 }}>Simulate Dock Scan</h3>
              </div>
              <button
                type="button"
                className="wp-icon-btn"
                onClick={() => setScannerOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleBarcodeSubmit}>
              <p className="wp-subtext" style={{ fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                Type or scan SKU code (e.g. SKU-FZ-VEG-01, SKU-CH-YOG-02, SKU-AM-RICE-05):
              </p>
              <input
                type="text"
                className="wp-input"
                placeholder="Enter or scan SKU..."
                value={scannedInput}
                onChange={(e) => setScannedInput(e.target.value)}
                autoFocus
                style={{ width: '100%', marginBottom: '1rem' }}
              />

              {scanMessage && (
                <div style={{ padding: '0.5rem 0.75rem', marginBottom: '1rem', background: 'var(--wp-subpanel)', borderRadius: 4, fontSize: '0.75rem' }}>
                  {scanMessage}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="wp-btn wp-btn-outline"
                  onClick={() => setScannerOpen(false)}
                >
                  Done
                </button>
                <button type="submit" className="wp-btn wp-btn-primary">
                  Verify SKU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoaderDockPage() {
  return (
    <Suspense fallback={<div style={{ padding: "3rem", textAlign: "center" }}>Loading warehouse dock staging sequence...</div>}>
      <LoaderDockContent />
    </Suspense>
  );
}
