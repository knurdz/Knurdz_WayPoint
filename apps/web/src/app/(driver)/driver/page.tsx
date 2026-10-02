"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface StopItem {
  id: string;
  seq: number;
  deliveryCode: string;
  outletCode: string;
  outletName: string;
  access: string;
  status: "Delivered" | "In Transit" | "Pending";
  meta: string;
  receiverName: string;
  handoverTime?: string;
  cargo?: { name: string; qty: string }[];
  windowSlack?: string;
  windowCloses?: string;
  volumeM3?: number;
}

export default function DriverPage() {
  const [stops, setStops] = useState<StopItem[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "done" | "later">("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string>("stop_2");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDriverRoute() {
      try {
        const res = await fetch("/api/driver/route");
        if (res.ok) {
          const data = await res.json();
          setStops(data.stops || []);
        }
      } catch (err) {
        console.error("Failed to load driver route", err);
      } finally {
        setLoading(false);
      }
    }
    loadDriverRoute();
  }, []);

  const filteredStops = stops.filter((s) => {
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "active"
        ? s.status === "In Transit"
        : filter === "done"
        ? s.status === "Delivered"
        : s.status === "Pending";

    const matchesSearch =
      s.outletName.toLowerCase().includes(search.toLowerCase()) ||
      s.deliveryCode.toLowerCase().includes(search.toLowerCase()) ||
      s.outletCode.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header */}
      <div className="store-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div className="store-page-meta" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
            <span className="wp-state wp-state-success">Route Active</span>
            <span className="font-mono store-outlet-id">VEH037</span>
          </div>
          <h1 className="wp-headline-md store-page-title" style={{ margin: 0 }}>
            Route R025229
          </h1>
          <p className="wp-subtext store-page-subtitle" style={{ margin: "0.25rem 0 0" }}>
            Coastal corridor · Nissan Cabstar · 1 of 4 stops delivered
          </p>
        </div>

        <div className="route-tools" style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link href="/driver/sync" className="wp-offline-banner stale" style={{ textDecoration: "none", fontSize: "0.75rem", padding: "0.35rem 0.65rem" }}>
            Offline: 3 queued
          </Link>
          <span className="cab-pill" style={{ fontSize: "0.75rem", padding: "0.35rem 0.65rem", background: "var(--wp-panel-bg)", border: "1px solid var(--wp-border-color)", borderRadius: "4px" }}>
            Sync <strong className="font-mono">3</strong>
          </span>
          <Link href="/driver/pod" className="wp-btn wp-btn-primary" style={{ fontSize: "0.75rem", padding: "0.45rem 0.85rem" }}>
            Capture POD
          </Link>
        </div>
      </div>

      <div className="route-layout" style={{ display: "grid", gridTemplateColumns: "1.7fr 1.3fr", gap: "1.25rem" }}>
        {/* Run Sheet Column */}
        <section className="dock-sequence-panel route-sheet wp-panel" style={{ padding: "1.25rem" }}>
          <div className="store-panel-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div>
              <span className="wp-label">Run sheet</span>
              <h2 className="wp-headline-sm store-panel-title" style={{ margin: "0.25rem 0 0" }}>
                Stops on this corridor
              </h2>
            </div>
            <span className="wp-subtext store-panel-count" style={{ fontSize: "0.75rem" }}>
              {stops.length} stops
            </span>
          </div>

          <div className="cab-search" style={{ marginBottom: "1rem" }}>
            <input
              type="search"
              className="wp-input"
              placeholder="Search delivery or outlet..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>

          <div className="cab-chips" style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
            {(["all", "active", "done", "later"] as const).map((f) => (
              <button
                key={f}
                type="button"
                className={`cab-chip ${filter === f ? "is-on" : ""}`}
                style={{
                  padding: "0.3rem 0.75rem",
                  fontSize: "0.75rem",
                  borderRadius: "16px",
                  border: filter === f ? "1px solid var(--wp-primary)" : "1px solid var(--wp-border-color)",
                  background: filter === f ? "var(--wp-primary)" : "transparent",
                  color: filter === f ? "#fff" : "inherit",
                  cursor: "pointer",
                }}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Stops List */}
          <div className="cab-stops" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "1.5rem" }}>Loading stops...</div>
            ) : (
              filteredStops.map((stop) => {
                const isExpanded = expandedId === stop.id;
                return (
                  <article
                    key={stop.id}
                    className={`cab-stop ${stop.status === "Delivered" ? "is-done" : stop.status === "In Transit" ? "is-now" : ""}`}
                    style={{
                      border: "1px solid var(--wp-border-color, #e2e8f0)",
                      borderRadius: "var(--wp-radius-sm, 6px)",
                      overflow: "hidden",
                      background: "var(--wp-panel-bg)",
                    }}
                  >
                    <button
                      type="button"
                      className="cab-stop-head"
                      onClick={() => setExpandedId(isExpanded ? "" : stop.id)}
                      style={{
                        width: "100%",
                        padding: "0.85rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            background: stop.status === "Delivered" ? "var(--wp-success)" : "var(--wp-primary)",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                          }}
                        >
                          {stop.seq}
                        </span>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            <span className="wp-label" style={{ fontSize: "0.65rem" }}>
                              {stop.deliveryCode}
                            </span>
                            <span className="wp-access-chip wp-access-chip--van_only" style={{ fontSize: "0.65rem", padding: "0.1rem 0.35rem" }}>
                              {stop.access}
                            </span>
                          </div>
                          <strong style={{ fontSize: "0.9rem", display: "block" }}>{stop.outletName}</strong>
                          <span className="cab-stop-meta" style={{ fontSize: "0.75rem", color: "var(--wp-muted)" }}>
                            {stop.meta}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`wp-badge ${
                          stop.status === "Delivered"
                            ? "wp-badge-success"
                            : stop.status === "In Transit"
                            ? "wp-badge-info"
                            : ""
                        }`}
                        style={{ fontSize: "0.7rem" }}
                      >
                        {stop.status}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="cab-stop-body" style={{ padding: "0.85rem", borderTop: "1px solid var(--wp-border-color)" }}>
                        {stop.cargo && (
                          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem" }}>
                            {stop.cargo.map((c, idx) => (
                              <div key={idx} style={{ padding: "0.5rem", background: "var(--wp-card-bg, #f8fafc)", borderRadius: "4px", flex: 1 }}>
                                <strong style={{ display: "block", fontSize: "0.8rem" }}>{c.name}</strong>
                                <span className="wp-subtext" style={{ fontSize: "0.72rem" }}>
                                  {c.qty}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {stop.windowSlack && (
                          <div style={{ padding: "0.5rem 0", marginBottom: "0.5rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                              <span className="wp-label">Window slack</span>
                              <strong className="font-mono">{stop.windowSlack}</strong>
                            </div>
                            <span className="wp-subtext" style={{ fontSize: "0.7rem" }}>
                              Closes {stop.windowCloses}
                            </span>
                          </div>
                        )}

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
                          <div>
                            <span className="wp-label" style={{ fontSize: "0.65rem" }}>
                              Receiver
                            </span>
                            <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600 }}>{stop.receiverName}</p>
                          </div>

                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <Link href="/driver/pod" className="wp-btn wp-btn-primary" style={{ fontSize: "0.75rem", padding: "0.35rem 0.65rem" }}>
                              Capture POD
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </section>

        {/* In Cab Telemetry & Map Column */}
        <aside className="wp-panel screen-panel" style={{ padding: "1.25rem" }}>
          <h2 className="wp-headline-sm">Cab Telemetry</h2>

          <div style={{ margin: "1rem 0" }}>
            <div className="wp-corridor-map wp-corridor-map--compact" style={{ height: "160px", overflow: "hidden", borderRadius: "6px" }}>
              <svg viewBox="0 0 600 200" style={{ width: "100%", height: "100%", display: "block" }}>
                <rect width="600" height="200" fill="#EEF3F6" />
                <path d="M40,120 Q200,100 360,110 T560,125" fill="none" stroke="#C5D0D8" strokeWidth="5" />
                <circle cx="280" cy="115" r="12" fill="#16A34A" />
                <circle cx="280" cy="115" r="20" fill="none" stroke="#16A34A" strokeWidth="2" opacity="0.4">
                  <animate attributeName="r" values="12;22;12" dur="2s" repeatCount="indefinite" />
                </circle>
                <text x="280" y="98" fill="#16A34A" fontFamily="JetBrains Mono, monospace" fontSize="9" fontWeight="700" textAnchor="middle">
                  VEH037 Live
                </text>
              </svg>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div style={{ padding: "0.75rem", background: "var(--wp-card-bg, #f8fafc)", borderRadius: "6px" }}>
              <span className="wp-label" style={{ fontSize: "0.7rem" }}>
                Frozen Box
              </span>
              <p className="font-mono" style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0.2rem 0", color: "var(--wp-info)" }}>
                −18.4°C
              </p>
              <span className="mc-status-chip mc-status-chip-ok" style={{ fontSize: "0.65rem" }}>
                Compliant
              </span>
            </div>

            <div style={{ padding: "0.75rem", background: "var(--wp-card-bg, #f8fafc)", borderRadius: "6px" }}>
              <span className="wp-label" style={{ fontSize: "0.7rem" }}>
                Chilled Box
              </span>
              <p className="font-mono" style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0.2rem 0", color: "var(--wp-success)" }}>
                +3.8°C
              </p>
              <span className="mc-status-chip mc-status-chip-ok" style={{ fontSize: "0.65rem" }}>
                Compliant
              </span>
            </div>
          </div>

          <div style={{ marginTop: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <Link href="/driver/sync" className="wp-btn wp-btn-outline" style={{ textAlign: "center" }}>
              Offline Sync Hub
            </Link>
            <Link href="/driver/pod" className="wp-btn wp-btn-primary" style={{ textAlign: "center" }}>
              Open POD Signature Screen
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
