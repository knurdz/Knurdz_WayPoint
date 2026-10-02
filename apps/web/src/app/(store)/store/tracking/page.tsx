"use client";

import React, { useState } from "react";
import Link from "next/link";

type SyncState = "offline" | "queued" | "syncing" | "synced" | "resolved";

export default function StoreTrackingPage() {
  const [state, setState] = useState<SyncState>("offline");

  const pillText: Record<SyncState, string> = {
    offline: "ETA frozen · Driver offline",
    queued: "ETA frozen · Actions queued",
    syncing: "Updating delivery status...",
    synced: "Delivered 06:38 AM · POD received",
    resolved: "Delivered · Planning updated",
  };

  const pillClass: Record<SyncState, string> = {
    offline: "mc-pill mc-pill-muted",
    queued: "mc-pill mc-pill-muted",
    syncing: "mc-pill mc-pill-info",
    synced: "mc-pill mc-pill-ok",
    resolved: "mc-pill mc-pill-ok",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div className="screen-page-header">
        <div>
          <span className="wp-label">SM 07 · DEL 88401 · OUT003</span>
          <h1 className="wp-headline-md" style={{ margin: "0.35rem 0 0" }}>
            Delivery tracking
          </h1>
          <p className="wp-subtext">Anjali Jayawardena · Fresh Galle Rd · VEH037</p>
        </div>
        <span className={pillClass[state]}>{pillText[state]}</span>
      </div>

      {/* Sync State Switcher */}
      <div className="screen-sync-states" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {(["offline", "queued", "syncing", "synced", "resolved"] as const).map((s) => (
          <button
            key={s}
            type="button"
            className={`wp-btn ${state === s ? "wp-btn-primary" : "wp-btn-outline"}`}
            style={{ fontSize: "0.75rem", padding: "0.35rem 0.75rem" }}
            onClick={() => setState(s)}
          >
            {s.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Dual Layout: Desktop and Mobile Mockup */}
      <div className="deg-store-dual" style={{ display: "grid", gridTemplateColumns: "1.6fr 1.2fr", gap: "1.5rem" }}>
        {/* Desktop View */}
        <section className="wp-panel screen-panel" style={{ padding: "1.25rem" }}>
          <span className="wp-label">Desktop 1280 View</span>

          <div className="wp-corridor-map wp-corridor-map--compact" style={{ margin: "0.75rem 0 1rem", opacity: state === "offline" ? 0.65 : 1 }}>
            <svg viewBox="0 0 600 220" style={{ width: "100%", height: "200px", display: "block" }}>
              <rect width="600" height="220" fill="#EEF3F6" />
              <path d="M40,140 Q200,120 360,130 T560,145" fill="none" stroke="#C5D0D8" strokeWidth="5" />
              <circle cx="280" cy="135" r="10" fill={state === "synced" || state === "resolved" ? "#16a34a" : "#94A3B8"} />
              <text x="280" y="118" fill="#64748B" fontFamily="JetBrains Mono, monospace" fontSize="9" fontWeight="700" textAnchor="middle">
                VEH037
              </text>
              <circle cx="480" cy="140" r="8" fill="#0284c7" />
              <text x="480" y="125" fill="#1A1C1C" fontFamily="JetBrains Mono, monospace" fontSize="9" fontWeight="700" textAnchor="middle">
                OUT003
              </text>
            </svg>
          </div>

          <div className="screen-timeline" style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
            <div className="screen-timeline-step is-done" style={{ paddingLeft: "1.25rem", borderLeft: "2px solid var(--wp-success)" }}>
              <strong>Order confirmed</strong>
              <p className="wp-subtext" style={{ fontSize: "0.75rem", margin: 0 }}>Mon 29 Sep · 14:22 SLST</p>
            </div>
            <div className="screen-timeline-step is-done" style={{ paddingLeft: "1.25rem", borderLeft: "2px solid var(--wp-success)" }}>
              <strong>Loaded at depot</strong>
              <p className="wp-subtext" style={{ fontSize: "0.75rem", margin: 0 }}>Tue 30 Sep · 04:48 AM</p>
            </div>
            <div
              className={`screen-timeline-step ${state === "offline" || state === "queued" ? "is-now" : "is-done"}`}
              style={{
                paddingLeft: "1.25rem",
                borderLeft: state === "offline" || state === "queued" ? "2px solid var(--wp-warning)" : "2px solid var(--wp-success)",
              }}
            >
              <strong>In transit · VEH037</strong>
              <p className="wp-subtext" style={{ fontSize: "0.75rem", margin: 0 }}>
                {state === "offline" || state === "queued" ? "ETA frozen · last update 6:12 AM" : "Arrived 06:35 AM"}
              </p>
            </div>
            <div
              className={`screen-timeline-step ${state === "synced" || state === "resolved" ? "is-done" : ""}`}
              style={{
                paddingLeft: "1.25rem",
                borderLeft: state === "synced" || state === "resolved" ? "2px solid var(--wp-success)" : "2px solid var(--wp-border-color)",
              }}
            >
              <strong>Delivered</strong>
              <p className="wp-subtext" style={{ fontSize: "0.75rem", margin: 0 }}>
                {state === "synced" || state === "resolved" ? "Delivered 06:38 AM · POD received" : "Pending POD"}
              </p>
            </div>
          </div>

          <div className="screen-list" style={{ marginTop: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--wp-border-color)" }}>
              <span>Dairy cases</span>
              <span className="font-mono">42 cases</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0" }}>
              <span>Curd trays</span>
              <span className="font-mono">18 trays</span>
            </div>
          </div>
        </section>

        {/* Mobile Mockup View */}
        <section aria-label="Mobile store view" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <p className="deg-store-mobile-label" style={{ fontSize: "0.75rem", color: "var(--wp-muted)", marginBottom: "0.5rem" }}>
            Mobile 375
          </p>

          <div
            className="deg-phone-frame"
            style={{
              width: "300px",
              minHeight: "480px",
              border: "8px solid #1e293b",
              borderRadius: "32px",
              padding: "1rem",
              background: "var(--wp-panel-bg)",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
              position: "relative",
            }}
          >
            <div
              className="deg-phone-notch"
              style={{
                width: "90px",
                height: "14px",
                background: "#1e293b",
                borderRadius: "0 0 10px 10px",
                margin: "-1rem auto 1rem",
              }}
            ></div>

            <div style={{ textAlign: "center", marginBottom: "1rem" }}>
              <span
                className={`wp-badge ${
                  state === "offline"
                    ? "wp-flag-warning"
                    : state === "syncing"
                    ? "wp-badge-info"
                    : "wp-badge-success"
                }`}
                style={{ fontSize: "0.7rem" }}
              >
                {state === "offline" ? "Driver offline" : state === "syncing" ? "Updating..." : "Delivered"}
              </span>
              <h2 className="wp-headline-sm" style={{ margin: "0.5rem 0 0.2rem" }}>
                DEL 88401
              </h2>
              <p className="wp-subtext" style={{ fontSize: "0.75rem" }}>
                {state === "offline" ? "ETA frozen · 6:12 AM" : "Delivered 6:38 AM"}
              </p>
            </div>

            <div style={{ padding: "0.75rem", background: "var(--wp-card-bg, #f8fafc)", borderRadius: "8px", fontSize: "0.78rem" }}>
              <p style={{ margin: 0 }}>
                {state === "offline" && "Driver offline, last update 6:12 AM. ETA frozen while reconnecting."}
                {state === "queued" && "No change while driver queues actions in offline cache."}
                {state === "syncing" && "Replaying cached IndexedDB actions to server."}
                {state === "synced" && "Delivered 06:38 AM. Proof of delivery received."}
                {state === "resolved" && "Your order was delivered. Planning was updated after sync."}
              </p>
            </div>

            <div style={{ marginTop: "1.5rem" }}>
              <Link
                href="/store/receipt"
                className="wp-btn wp-btn-primary"
                style={{ width: "100%", textAlign: "center", display: "block", fontSize: "0.75rem", padding: "0.5rem" }}
              >
                Confirm receipt
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
