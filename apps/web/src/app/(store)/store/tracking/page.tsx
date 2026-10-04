"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, Clock, MapPin, Truck, ArrowRight, ShieldCheck } from "lucide-react";

export default function StoreTrackingPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div className="screen-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <span className="wp-label">Delivery Tracking · OUT003 Galle Rd</span>
          <h1 className="wp-headline-md" style={{ margin: "0.35rem 0 0" }}>
            Order DEL 88401 Tracking
          </h1>
          <p className="wp-subtext">Store Manager: Anjali Jayawardena · Assigned Chassis: VEH037</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span className="mc-pill mc-pill-ok" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
            <CheckCircle2 size={14} />
            <span>Delivered 06:38 AM · POD Verified</span>
          </span>
          <Link href="/store/receipt" className="wp-btn wp-btn-primary" style={{ fontSize: "0.82rem", padding: "0.45rem 0.85rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
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
              <span className="wp-subtext" style={{ fontSize: "0.75rem" }}>Peliyagoda Hub → OUT003</span>
            </div>

            <div className="wp-corridor-map wp-corridor-map--compact" style={{ margin: "0.5rem 0 1rem" }}>
              <svg viewBox="0 0 600 220" style={{ width: "100%", height: "200px", display: "block", borderRadius: "8px" }}>
                <rect width="600" height="220" fill="#EEF3F6" />
                <path d="M40,140 Q200,120 360,130 T560,145" fill="none" stroke="#C5D0D8" strokeWidth="5" />
                <circle cx="280" cy="135" r="10" fill="#16a34a" />
                <text x="280" y="118" fill="#64748B" fontFamily="JetBrains Mono, monospace" fontSize="9" fontWeight="700" textAnchor="middle">
                  VEH037 (Delivered)
                </text>
                <circle cx="480" cy="140" r="8" fill="#0284c7" />
                <text x="480" y="125" fill="#1A1C1C" fontFamily="JetBrains Mono, monospace" fontSize="9" fontWeight="700" textAnchor="middle">
                  OUT003 Fresh Galle Rd
                </text>
              </svg>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid var(--wp-border-color, #e2e8f0)" }}>
              <div>
                <span className="wp-subtext" style={{ fontSize: "0.72rem" }}>Carrier & Driver</span>
                <p style={{ margin: "0.2rem 0 0", fontSize: "0.82rem", fontWeight: 600 }}>Kamal Silva (VEH037)</p>
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
              <span className="mc-pill mc-pill-info" style={{ fontSize: "0.72rem" }}>60 Total Units</span>
            </div>

            <div className="screen-list" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "0.6rem 0.75rem", background: "var(--wp-surface-hover, #f8fafc)", borderRadius: "6px" }}>
                <span style={{ fontSize: "0.82rem", fontWeight: 500 }}>Chilled Dairy Crates (Rule 02 Compliant)</span>
                <span className="font-mono" style={{ fontSize: "0.82rem", fontWeight: 700 }}>42 cases</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "0.6rem 0.75rem", background: "var(--wp-surface-hover, #f8fafc)", borderRadius: "6px" }}>
                <span style={{ fontSize: "0.82rem", fontWeight: 500 }}>Fresh Curd Trays</span>
                <span className="font-mono" style={{ fontSize: "0.82rem", fontWeight: 700 }}>18 trays</span>
              </div>
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
                <p className="wp-subtext" style={{ fontSize: "0.75rem", margin: "0.2rem 0 0" }}>Mon 29 Sep · 14:22 SLST · Auto verified</p>
              </div>
              <div className="screen-timeline-step is-done" style={{ paddingLeft: "1.25rem", borderLeft: "2px solid var(--wp-success)" }}>
                <strong style={{ fontSize: "0.85rem" }}>Loaded at Depot (Dock 04)</strong>
                <p className="wp-subtext" style={{ fontSize: "0.75rem", margin: "0.2rem 0 0" }}>Tue 30 Sep · 04:48 AM · Manifest signoff passed</p>
              </div>
              <div className="screen-timeline-step is-done" style={{ paddingLeft: "1.25rem", borderLeft: "2px solid var(--wp-success)" }}>
                <strong style={{ fontSize: "0.85rem" }}>In Transit via Route R025229</strong>
                <p className="wp-subtext" style={{ fontSize: "0.75rem", margin: "0.2rem 0 0" }}>Tue 30 Sep · 05:15 AM · Reefer at 3.2°C</p>
              </div>
              <div className="screen-timeline-step is-done" style={{ paddingLeft: "1.25rem", borderLeft: "2px solid var(--wp-success)" }}>
                <strong style={{ fontSize: "0.85rem", color: "var(--wp-success)" }}>Delivered to Store Dock</strong>
                <p className="wp-subtext" style={{ fontSize: "0.75rem", margin: "0.2rem 0 0" }}>Tue 30 Sep · 06:38 AM · POD signature received</p>
              </div>
            </div>

            <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--wp-border-color, #e2e8f0)", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ShieldCheck size={16} color="var(--wp-success)" />
                <span style={{ fontSize: "0.78rem", color: "var(--wp-text-main)" }}>Proof of Delivery cryptographic token verified</span>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <Link href="/store/receipt" className="wp-btn wp-btn-primary" style={{ flex: 1, textAlign: "center", justifyContent: "center", fontSize: "0.8rem", padding: "0.5rem" }}>
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
