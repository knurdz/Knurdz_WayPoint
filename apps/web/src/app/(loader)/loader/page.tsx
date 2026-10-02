"use client";

import React, { useState } from "react";
import Link from "next/link";

interface ManifestLine {
  id: string;
  sku: string;
  name: string;
  stopNumber: number;
  stopName: string;
  qty: string;
  temp: string;
  isAlert?: boolean;
  verified: boolean;
}

const initialLines: ManifestLine[] = [
  {
    id: "l1",
    sku: "SKU_FZ_VEG_01",
    name: "Frozen Farm Vegetables 1kg",
    stopNumber: 4,
    stopName: "Stop 4 · OUT010 Fresh Colombo 03",
    qty: "12 Cases",
    temp: "18C Frozen",
    verified: false,
  },
  {
    id: "l2",
    sku: "SKU_CH_YOG_02",
    name: "Chilled Greek Yogurt 500g",
    stopNumber: 4,
    stopName: "Stop 4 · OUT010 Fresh Colombo 03",
    qty: "8 Cases",
    temp: "4C Chilled",
    verified: false,
  },
  {
    id: "l3",
    sku: "SKU_AM_RICE_05",
    name: "Ambient Organic Brown Rice 5kg",
    stopNumber: 3,
    stopName: "Stop 3 · OUT008 Fresh Colombo 04",
    qty: "20 Sacks",
    temp: "Ambient",
    verified: false,
  },
  {
    id: "l4",
    sku: "SKU_CH_MILK_04",
    name: "Fresh Pasteurised Milk 1L",
    stopNumber: 2,
    stopName: "Stop 2 · OUT003 Kandy Central",
    qty: "15 Cases (3 short flagged)",
    temp: "4C Chilled",
    isAlert: true,
    verified: false,
  },
  {
    id: "l5",
    sku: "SKU_AM_FLOUR_01",
    name: "Bakers Choice Flour 25kg",
    stopNumber: 1,
    stopName: "Stop 1 · OUT001 Fresh Galle Rd",
    qty: "10 Bags",
    temp: "Ambient",
    verified: false,
  },
  {
    id: "l6",
    sku: "SKU_CH_BUTTER_03",
    name: "Salted Table Butter 200g",
    stopNumber: 1,
    stopName: "Stop 1 · OUT001 Fresh Galle Rd",
    qty: "6 Cartons",
    temp: "4C Chilled",
    verified: false,
  },
];

export default function LoaderPage() {
  const [lines, setLines] = useState<ManifestLine[]>(initialLines);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedSku, setScannedSku] = useState("");
  const [scanFeedback, setScanFeedback] = useState<string | null>(null);

  const toggleVerify = (id: string) => {
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, verified: !l.verified } : l))
    );
  };

  const handleSimulateScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedSku) return;

    try {
      const res = await fetch("/api/loader/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku: scannedSku, bayId: "Bay 04", vehicleId: "VEH004" }),
      });

      if (res.ok) {
        const data = await res.json();
        setLines((prev) =>
          prev.map((l) => (l.sku === scannedSku ? { ...l, verified: true } : l))
        );
        setScanFeedback(`✓ Verified: ${data.item.name}`);
        setScannedSku("");
      } else {
        const err = await res.json();
        setScanFeedback(`⚠ ${err.error || "Invalid barcode"}`);
      }
    } catch {
      setScanFeedback("Scanner network error");
    }
  };

  const verifiedCount = lines.filter((l) => l.verified).length;
  const progressPct = Math.round((verifiedCount / lines.length) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header */}
      <div className="store-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div className="store-page-meta" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
            <span className="wp-state wp-state-success">Cold Seal Active</span>
            <span className="font-mono store-outlet-id">VEH004</span>
          </div>
          <h1 className="wp-headline-md store-page-title" style={{ margin: 0 }}>
            Bay 04 Load Sequence
          </h1>
          <p className="wp-subtext store-page-subtitle" style={{ margin: "0.25rem 0 0" }}>
            Peliyagoda · Trip 1 · reverse LIFO · window 05:00 to 07:30
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button
            type="button"
            className="wp-btn wp-btn-outline"
            onClick={() => setIsScannerOpen(true)}
            style={{ fontSize: "0.75rem", padding: "0.45rem 0.85rem" }}
          >
            Scan Barcode
          </button>
          <Link href="/loader/shortfall" className="wp-btn wp-btn-outline" style={{ fontSize: "0.75rem", padding: "0.45rem 0.85rem" }}>
            Report Shortfall
          </Link>
          <Link href="/loader/signoff" className="wp-btn wp-btn-primary" style={{ fontSize: "0.75rem", padding: "0.45rem 0.85rem" }}>
            Departure signoff
          </Link>
        </div>
      </div>

      {/* KPI Row */}
      <div className="wp-kpi-row store-kpi-row">
        <div className="wp-kpi">
          <span className="wp-label">Verified</span>
          <p className="wp-kpi-value font-mono">
            {verifiedCount}/{lines.length}
          </p>
          <div className="wp-meter dock-progress-meter" style={{ height: "4px", marginTop: "0.35rem" }}>
            <div className="wp-meter-fill ok" style={{ width: `${progressPct}%` }}></div>
          </div>
          <span className="wp-subtext store-kpi-caption" style={{ fontSize: "0.75rem" }}>
            {progressPct}% lines loaded
          </span>
        </div>

        <div className="wp-kpi">
          <span className="wp-label">Shortfall</span>
          <p className="wp-kpi-value" style={{ color: "var(--wp-error, #ef4444)" }}>
            3
          </p>
          <span className="wp-subtext store-kpi-caption" style={{ fontSize: "0.75rem" }}>
            Milk cases · Stop 2
          </span>
        </div>

        <div className="wp-kpi">
          <span className="wp-label">Stops</span>
          <p className="wp-kpi-value">4</p>
          <span className="wp-subtext store-kpi-caption" style={{ fontSize: "0.75rem" }}>
            Load last stop first
          </span>
        </div>

        <div className="wp-kpi">
          <span className="wp-label">Window</span>
          <p className="wp-kpi-value font-mono" style={{ fontSize: "1.45rem" }}>
            05:00
          </p>
          <span className="wp-subtext store-kpi-caption" style={{ fontSize: "0.75rem" }}>
            Closes 07:30 SLST
          </span>
        </div>
      </div>

      {/* Load Sequence Panel */}
      <section className="dock-sequence-panel wp-panel" style={{ padding: "1.25rem" }}>
        <div className="store-panel-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div>
            <span className="wp-label">Reverse Load</span>
            <h2 className="wp-headline-sm store-panel-title" style={{ margin: "0.25rem 0 0" }}>
              Stops in LIFO order
            </h2>
          </div>
          <span className="wp-subtext store-panel-count" style={{ fontSize: "0.75rem" }}>
            {lines.length} lines total
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {lines.map((line) => (
            <article
              key={line.id}
              style={{
                padding: "1rem",
                border: line.verified
                  ? "1px solid var(--wp-success, #22c55e)"
                  : line.isAlert
                  ? "1px solid var(--wp-warning, #f59e0b)"
                  : "1px solid var(--wp-border-color, #e2e8f0)",
                background: line.verified ? "var(--wp-card-bg, #f0fdf4)" : "var(--wp-panel-bg)",
                borderRadius: "var(--wp-radius-sm, 6px)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <input
                  type="checkbox"
                  checked={line.verified}
                  onChange={() => toggleVerify(line.id)}
                  style={{ width: "1.2rem", height: "1.2rem", cursor: "pointer" }}
                />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span className="wp-label" style={{ fontSize: "0.7rem" }}>
                      {line.stopName}
                    </span>
                    {line.isAlert && (
                      <span className="mc-pill mc-pill-warn" style={{ fontSize: "0.65rem" }}>
                        Dock Shortfall
                      </span>
                    )}
                  </div>
                  <strong style={{ display: "block", fontSize: "0.95rem", margin: "0.15rem 0" }}>
                    {line.name}
                  </strong>
                  <span className="font-mono wp-subtext" style={{ fontSize: "0.75rem" }}>
                    {line.sku} · {line.qty}
                  </span>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <span
                  className={`wp-badge ${
                    line.temp.includes("Frozen")
                      ? "wp-badge-info"
                      : line.temp.includes("Chilled")
                      ? "wp-badge-success"
                      : ""
                  }`}
                  style={{ fontSize: "0.7rem" }}
                >
                  {line.temp}
                </span>
                <span className="wp-subtext" style={{ display: "block", fontSize: "0.72rem", marginTop: "0.25rem" }}>
                  {line.verified ? "Verified Loaded" : "Pending Scan"}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Barcode Scanner Modal Simulator */}
      {isScannerOpen && (
        <div className="wp-command-backdrop" style={{ display: "block" }}>
          <div className="wp-command-dialog" style={{ padding: "1.5rem" }}>
            <h2 className="wp-headline-sm" style={{ margin: "0 0 0.5rem" }}>
              Laser Barcode &amp; QR Scanner
            </h2>
            <p className="wp-subtext">Scan cargo tote or case barcode on loading bay 04 conveyor.</p>

            {scanFeedback && (
              <div
                style={{
                  padding: "0.6rem 0.85rem",
                  background: scanFeedback.startsWith("✓") ? "#f0fdf4" : "#fef2f2",
                  borderRadius: "4px",
                  fontSize: "0.85rem",
                  margin: "0.75rem 0",
                }}
              >
                {scanFeedback}
              </div>
            )}

            <form onSubmit={handleSimulateScan} style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div className="wp-field">
                <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.8rem" }}>
                  Scan Barcode SKU
                </label>
                <input
                  className="wp-input font-mono"
                  placeholder="e.g. SKU_FZ_VEG_01"
                  value={scannedSku}
                  onChange={(e) => setScannedSku(e.target.value)}
                  autoFocus
                  style={{ width: "100%", padding: "0.5rem" }}
                />
              </div>

              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", fontSize: "0.75rem" }}>
                <span className="wp-subtext">Quick test SKUs:</span>
                {lines.map((l) => (
                  <button
                    key={l.sku}
                    type="button"
                    className="mc-link"
                    style={{ background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                    onClick={() => setScannedSku(l.sku)}
                  >
                    {l.sku}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <button type="submit" className="wp-btn wp-btn-primary" style={{ flex: 1 }}>
                  Confirm Scan
                </button>
                <button type="button" className="wp-btn wp-btn-outline" onClick={() => setIsScannerOpen(false)}>
                  Close Scanner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
