"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface DeliveryItem {
  id: string;
  code: string;
  cargoType: string;
  goods: string;
  weightKg: number;
  status: string;
  statusBadge: string;
  eta: string;
  actionLabel: string;
  link: string;
  canConfirm: boolean;
}

interface StoreSummary {
  outletCode: string;
  outletName: string;
  location: string;
  status: string;
  kpis: {
    coolroomPct: number;
    coolroomWeightKg: number;
    coolroomMaxKg: number;
    nextVanMinutes: number;
    nextVanVehicle: string;
    nextVanDistanceKm: number;
    dockStatus: string;
    dockLimit: string;
    todayOpen: number;
    awaitingReceipt: number;
  };
  deliveries: DeliveryItem[];
}

export default function StorePortalPage() {
  const [data, setData] = useState<StoreSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [receiptSuccess, setReceiptSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadStoreSummary() {
      try {
        const res = await fetch("/api/store/summary");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to fetch store summary", err);
      } finally {
        setLoading(false);
      }
    }
    loadStoreSummary();
  }, []);

  const handleConfirmReceipt = (deliveryId: string) => {
    setConfirmingId(deliveryId);
    setTimeout(() => {
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          deliveries: prev.deliveries.map((d) =>
            d.id === deliveryId
              ? {
                  ...d,
                  status: "Verified",
                  statusBadge: "Verified",
                  canConfirm: false,
                  actionLabel: "Receipt signed",
                }
              : d
          ),
        };
      });
      setConfirmingId(null);
      setReceiptSuccess("Delivery receipt successfully confirmed and signed digitally.");
    }, 400);
  };

  if (loading || !data) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>Loading Store Portal...</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Top Header */}
      <div className="store-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div className="store-page-meta" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
            <span className="wp-state wp-state-success">{data.status}</span>
            <span className="font-mono store-outlet-id">{data.outletCode}</span>
          </div>
          <h1 className="wp-headline-md store-page-title" style={{ margin: 0 }}>
            {data.outletName}
          </h1>
          <p className="wp-subtext store-page-subtitle" style={{ margin: "0.25rem 0 0" }}>
            {data.location}
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link href="/store/order" className="wp-btn wp-btn-outline" style={{ fontSize: "0.75rem", padding: "0.45rem 0.85rem" }}>
            Full order form
          </Link>
          <Link href="/store/order" className="wp-btn wp-btn-primary" style={{ fontSize: "0.75rem", padding: "0.45rem 0.85rem" }}>
            + New Order
          </Link>
        </div>
      </div>

      {receiptSuccess && (
        <div
          style={{
            padding: "0.75rem 1rem",
            background: "var(--wp-card-bg, #f0fdf4)",
            border: "1px solid var(--wp-success, #22c55e)",
            borderRadius: "var(--wp-radius-sm, 6px)",
            fontSize: "0.85rem",
          }}
        >
          ✓ {receiptSuccess}
        </div>
      )}

      {/* KPI Row */}
      <div className="wp-kpi-row store-kpi-row">
        <div className="wp-kpi">
          <span className="wp-label">Coolroom</span>
          <p className="wp-kpi-value" style={{ color: "var(--wp-info)" }}>
            {data.kpis.coolroomPct}%
          </p>
          <div className="wp-meter" style={{ height: "4px", marginTop: "0.35rem" }}>
            <div className="wp-meter-fill ok" style={{ width: `${data.kpis.coolroomPct}%` }}></div>
          </div>
          <span className="wp-subtext store-kpi-caption" style={{ fontSize: "0.75rem" }}>
            {data.kpis.coolroomWeightKg} / {data.kpis.coolroomMaxKg} kg
          </span>
        </div>

        <div className="wp-kpi">
          <span className="wp-label">Next Van</span>
          <p className="wp-kpi-value" style={{ color: "var(--wp-primary)" }}>
            {data.kpis.nextVanMinutes} min
          </p>
          <span className="wp-subtext store-kpi-caption" style={{ fontSize: "0.75rem" }}>
            {data.kpis.nextVanVehicle} · {data.kpis.nextVanDistanceKm} km
          </span>
        </div>

        <div className="wp-kpi">
          <span className="wp-label">Dock</span>
          <p className="wp-kpi-value" style={{ color: "var(--wp-success)" }}>
            {data.kpis.dockStatus}
          </p>
          <span className="wp-subtext store-kpi-caption" style={{ fontSize: "0.75rem" }}>
            {data.kpis.dockLimit}
          </span>
        </div>

        <div className="wp-kpi">
          <span className="wp-label">Today</span>
          <p className="wp-kpi-value">{data.kpis.todayOpen} open</p>
          <span className="wp-subtext store-kpi-caption" style={{ fontSize: "0.75rem" }}>
            {data.kpis.awaitingReceipt} awaiting receipt
          </span>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="store-portal-layout" style={{ display: "grid", gridTemplateColumns: "1.4fr 1.6fr", gap: "1.25rem" }}>
        {/* Deliveries List */}
        <section className="store-delivery-panel wp-panel" style={{ padding: "1.25rem" }} aria-label="Today deliveries">
          <div className="store-panel-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div>
              <span className="wp-label">Today Deliveries</span>
              <h2 className="wp-headline-sm store-panel-title" style={{ margin: "0.25rem 0 0" }}>
                Order runs for {data.outletCode}
              </h2>
            </div>
            <span className="wp-subtext store-panel-count" style={{ fontSize: "0.75rem" }}>
              {data.deliveries.length} runs
            </span>
          </div>

          <div className="store-delivery-list" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {data.deliveries.map((del) => (
              <article
                key={del.id}
                className="store-delivery-row"
                style={{
                  padding: "0.85rem",
                  border: "1px solid var(--wp-border-color, #e2e8f0)",
                  borderRadius: "var(--wp-radius-sm, 6px)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <div className="store-delivery-main" style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <strong className="font-mono store-delivery-id">{del.code}</strong>
                    <span
                      className={`wp-meta-stack-primary ${del.cargoType === "Chilled" ? "is-chilled" : "is-ambient"}`}
                      style={{ fontSize: "0.7rem", padding: "0.15rem 0.45rem", borderRadius: "4px" }}
                    >
                      {del.cargoType}
                    </span>
                  </div>
                  <span className="store-delivery-goods" style={{ fontSize: "0.8rem", color: "var(--wp-muted)" }}>
                    {del.goods}
                  </span>
                  <span className="font-mono store-delivery-metric" style={{ fontSize: "0.75rem" }}>
                    {del.weightKg} kg
                  </span>
                </div>

                <div className="store-delivery-side" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.35rem" }}>
                  <span
                    className={`wp-badge ${
                      del.status === "In Transit"
                        ? "wp-badge-info"
                        : del.status === "Delivered" || del.status === "Verified"
                        ? "wp-badge-success"
                        : "wp-flag wp-flag-warning"
                    }`}
                  >
                    {del.statusBadge}
                  </span>

                  {del.canConfirm ? (
                    <button
                      type="button"
                      className="wp-btn wp-btn-primary store-delivery-btn"
                      style={{ fontSize: "0.7rem", padding: "0.3rem 0.6rem" }}
                      disabled={confirmingId === del.id}
                      onClick={() => handleConfirmReceipt(del.id)}
                    >
                      {confirmingId === del.id ? "Confirming..." : "Confirm Receipt"}
                    </button>
                  ) : (
                    <Link href={del.link} className="wp-subtext store-delivery-action-label" style={{ fontSize: "0.75rem" }}>
                      {del.actionLabel}
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Live Vector Approach Map */}
        <section className="route-map-stage store-map-stage wp-panel" style={{ padding: "1.25rem" }} aria-label="Approaching delivery">
          <div className="route-map-stage-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div>
              <span className="wp-label">Live Approach</span>
              <h2 className="wp-headline-sm store-panel-title" style={{ margin: "0.25rem 0 0" }}>
                DEL 88401 en route
              </h2>
            </div>
            <div className="route-map-meta-row" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span className="route-map-meta route-map-meta-info" style={{ fontSize: "0.75rem" }}>
                ETA 06:18 SLST
              </span>
              <span className="wp-state-text wp-state-success">Dock clear</span>
            </div>
          </div>

          <div className="route-map-canvas-wrap" style={{ border: "1px solid var(--wp-border-color, #e2e8f0)", borderRadius: "var(--wp-radius-sm, 6px)", overflow: "hidden" }}>
            <div className="wp-vector-map route-map-canvas store-map-canvas" style={{ width: "100%", height: "260px" }}>
              <svg viewBox="0 0 600 260" className="wp-map-svg" style={{ width: "100%", height: "100%", display: "block" }}>
                <path d="M0,0 L200,0 Q240,130 260,260 L0,260 Z" fill="#D5E6EE" />
                <path d="M200,0 L600,0 L600,260 L260,260 Q240,130 200,0 Z" fill="#EEF3F6" />
                <line x1="300" y1="10" x2="300" y2="250" stroke="#CBD5E1" strokeWidth="6" />
                <line x1="420" y1="10" x2="420" y2="250" stroke="#CBD5E1" strokeWidth="4" strokeDasharray="6 3" />
                <line x1="300" y1="30" x2="520" y2="30" stroke="#CBD5E1" strokeWidth="3" />
                <polyline points="480,30 300,30 300,180" stroke="#0284c7" strokeWidth="4" fill="none" />
                
                {/* Store destination pin */}
                <g transform="translate(300, 180)">
                  <circle cx="0" cy="0" r="12" fill="#16A34A" />
                  <circle cx="0" cy="0" r="6" fill="#FFFFFF" />
                  <text x="18" y="4" fill="#16A34A" fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight="bold">
                    OUT001 Fresh (Store)
                  </text>
                </g>

                {/* Moving vehicle pin with pulse */}
                <g transform="translate(300, 85)">
                  <circle cx="0" cy="0" r="18" fill="none" stroke="#0284c7" strokeWidth="2" opacity="0.6">
                    <animate attributeName="r" values="12;22;12" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="0" cy="0" r="10" fill="#0284c7" />
                  <text x="16" y="4" fill="#0284c7" fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight="bold">
                    VEH037 (3.8 km)
                  </text>
                </g>
              </svg>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
