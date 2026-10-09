"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, MapPin, Truck, ArrowRight, ShieldCheck } from "lucide-react";
import type { MapVehicle } from "@/app/api/dispatcher/map/route";

const SriLankaFleetMap = dynamic(
  () => import("@/components/map/SriLankaFleetMap"),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          height: "260px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--wp-panel-bg, #f8fafc)",
          color: "var(--wp-text-muted, #64748b)",
          fontSize: "0.85rem",
          borderRadius: "8px",
        }}
      >
        Connecting to Sri Lanka Live Fleet Telemetry...
      </div>
    ),
  }
);

interface OrderItem {
  id: string;
  sku: string;
  description: string;
  quantity: number;
  weightKg: number;
}

interface ReceiptDetails {
  orderId: string;
  deliveryCode: string;
  outletId: string;
  tempRequirement: string;
  weightKg: number;
  status: string;
  items: OrderItem[];
  vehicleId: string;
  driverName: string;
  isDelivered: boolean;
}

function StoreTrackingContent() {
  const searchParams = useSearchParams();
  const rawOrderId = searchParams.get("orderId") || "ORD_92301";
  const [vehicles, setVehicles] = useState<MapVehicle[]>([]);
  const [receipt, setReceipt] = useState<ReceiptDetails | null>(null);

  // Dynamic relative dates
  const { yesterdayStr, todayStr } = useMemo(() => {
    const now = new Date();
    const yesterday = new Date(Date.now() - 86400000);
    const fmt = (d: Date) => d.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" });
    return {
      yesterdayStr: fmt(yesterday),
      todayStr: fmt(now),
    };
  }, []);

  useEffect(() => {
    fetch("/api/dispatcher/map")
      .then((res) => res.json())
      .then((data) => {
        if (data.vehicles) {
          setVehicles(data.vehicles);
        }
      })
      .catch((err) => console.error("Store tracking fleet fetch error:", err));

    fetch(`/api/store/receipt?orderId=${encodeURIComponent(rawOrderId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error && data.orderId) {
          setReceipt(data);
        }
      })
      .catch((err) => console.error("Store tracking receipt fetch error:", err));
  }, [rawOrderId]);

  const displayOrderId = receipt?.orderId || rawOrderId;
  const vehicleId = receipt?.vehicleId || "VEH037";
  const driverName = receipt?.driverName || "Kamal Silva";
  const outletId = receipt?.outletId || "OUT001";
  const isDelivered = receipt?.isDelivered ?? true;

  const items = receipt?.items && receipt.items.length > 0 ? receipt.items : [
    { id: "1", sku: "SKU-CH-MILK-1L", description: "Chilled Dairy Crates (Rule 02 Compliant)", quantity: 42, weightKg: 420 },
    { id: "2", sku: "SKU-CH-YOG-02", description: "Fresh Curd Trays", quantity: 18, weightKg: 180 },
  ];

  const totalUnits = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div className="screen-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <span className="wp-label">Delivery Tracking · {outletId} / Colombo Fresh</span>
          <h1 className="wp-headline-md" style={{ margin: "0.35rem 0 0" }}>
            Order {displayOrderId} Tracking
          </h1>
          <p className="wp-subtext">Store Manager: Anjali Jayawardena · Assigned Transport: {vehicleId} ({driverName})</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span className={`mc-pill ${isDelivered ? "mc-pill-ok" : "mc-pill-info"}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
            <CheckCircle2 size={14} />
            <span>{isDelivered ? "Delivered / POD Ready" : "In Transit"}</span>
          </span>
          <Link href={`/store/receipt?orderId=${encodeURIComponent(displayOrderId)}`} className="wp-btn wp-btn-primary" style={{ fontSize: "0.82rem", padding: "0.45rem 0.85rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            <span>Confirm Receipt</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Main Responsive Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.5rem" }}>
        {/* Left Column: Corridor Map & Manifest */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <section className="wp-panel" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <MapPin size={16} style={{ color: "var(--wp-primary)" }} />
                <strong style={{ fontSize: "0.9rem" }}>Delivery Corridor & Transit Route</strong>
              </div>
              <span className="wp-subtext" style={{ fontSize: "0.75rem" }}>Peliyagoda Hub → {outletId}</span>
            </div>

            <div style={{ margin: "0.5rem 0 1rem", minHeight: "280px", borderRadius: "8px", overflow: "hidden" }}>
              <SriLankaFleetMap
                vehicles={vehicles}
                selectedVehicleId={vehicleId}
                onSelectVehicle={() => {}}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid var(--wp-border-color, #e2e8f0)" }}>
              <div>
                <span className="wp-subtext" style={{ fontSize: "0.72rem" }}>Carrier & Driver</span>
                <p style={{ margin: "0.2rem 0 0", fontSize: "0.82rem", fontWeight: 600 }}>{driverName} ({vehicleId})</p>
              </div>
              <div>
                <span className="wp-subtext" style={{ fontSize: "0.72rem" }}>Arrival Timestamp</span>
                <p style={{ margin: "0.2rem 0 0", fontSize: "0.82rem", fontWeight: 600, color: "var(--wp-success)" }}>06:38 AM SLST</p>
              </div>
            </div>
          </section>

          {/* Manifest Breakdown */}
          <section className="wp-panel" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Truck size={16} style={{ color: "var(--wp-primary)" }} />
                <strong style={{ fontSize: "0.9rem" }}>Order Manifest Details</strong>
              </div>
              <span className="mc-pill mc-pill-info" style={{ fontSize: "0.72rem" }}>{totalUnits} Total Units</span>
            </div>

            <div className="screen-list" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {items.map((item) => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.6rem 0.75rem", background: "var(--wp-surface-hover, #f8fafc)", borderRadius: "6px" }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 500 }}>{item.description} ({item.sku})</span>
                  <span className="font-mono" style={{ fontSize: "0.82rem", fontWeight: 700 }}>{item.quantity} cases</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Delivery Milestones Timeline & Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <section className="wp-panel" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
              <Clock size={16} style={{ color: "var(--wp-primary)" }} />
              <strong style={{ fontSize: "0.9rem" }}>Delivery Milestones</strong>
            </div>

            <div className="screen-timeline" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="screen-timeline-step is-done" style={{ paddingLeft: "1.25rem", borderLeft: "2px solid var(--wp-success)" }}>
                <strong style={{ fontSize: "0.85rem" }}>Order Confirmed & Allocated</strong>
                <p className="wp-subtext" style={{ fontSize: "0.75rem", margin: "0.2rem 0 0" }}>{yesterdayStr} · 14:22 SLST · Auto verified</p>
              </div>
              <div className="screen-timeline-step is-done" style={{ paddingLeft: "1.25rem", borderLeft: "2px solid var(--wp-success)" }}>
                <strong style={{ fontSize: "0.85rem" }}>Loaded at Depot (Dock 04)</strong>
                <p className="wp-subtext" style={{ fontSize: "0.75rem", margin: "0.2rem 0 0" }}>{todayStr} · 04:48 AM · Manifest signoff passed</p>
              </div>
              <div className="screen-timeline-step is-done" style={{ paddingLeft: "1.25rem", borderLeft: "2px solid var(--wp-success)" }}>
                <strong style={{ fontSize: "0.85rem" }}>In Transit via Scheduled Route</strong>
                <p className="wp-subtext" style={{ fontSize: "0.75rem", margin: "0.2rem 0 0" }}>{todayStr} · 05:15 AM · Reefer maintained at 3.2°C</p>
              </div>
              <div className="screen-timeline-step is-done" style={{ paddingLeft: "1.25rem", borderLeft: "2px solid var(--wp-success)" }}>
                <strong style={{ fontSize: "0.85rem", color: "var(--wp-success)" }}>Delivered to Store Dock</strong>
                <p className="wp-subtext" style={{ fontSize: "0.75rem", margin: "0.2rem 0 0" }}>{todayStr} · 06:38 AM · POD signature received</p>
              </div>
            </div>

            <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--wp-border-color, #e2e8f0)", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ShieldCheck size={16} color="var(--wp-success)" />
                <span style={{ fontSize: "0.78rem", color: "var(--wp-text-main)" }}>Proof of Delivery cryptographic token verified</span>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <Link href={`/store/receipt?orderId=${encodeURIComponent(displayOrderId)}`} className="wp-btn wp-btn-primary" style={{ flex: 1, textAlign: "center", justifyContent: "center", fontSize: "0.8rem", padding: "0.5rem" }}>
                  Sign Receipt Confirmation
                </Link>
                <Link href="/store/orders" className="wp-btn wp-btn-outline" style={{ fontSize: "0.8rem", padding: "0.5rem 0.85rem" }}>
                  All Orders
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function StoreTrackingPage() {
  return (
    <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>Loading transit telemetry...</div>}>
      <StoreTrackingContent />
    </Suspense>
  );
}
