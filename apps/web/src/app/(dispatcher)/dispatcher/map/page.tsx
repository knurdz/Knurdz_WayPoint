"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MapVehicle } from "@/app/api/dispatcher/map/route";

export default function DispatcherLiveMapPage() {
  const [vehicles, setVehicles] = useState<MapVehicle[]>([]);
  const [selectedId, setSelectedId] = useState<string>("VEH037");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMapData() {
      try {
        const res = await fetch("/api/dispatcher/map");
        if (res.ok) {
          const data = await res.json();
          setVehicles(data.vehicles || []);
        }
      } catch (err) {
        console.error("Failed to load map data", err);
      } finally {
        setLoading(false);
      }
    }
    loadMapData();
  }, []);

  const selectedVeh = vehicles.find((v) => v.id === selectedId) || vehicles[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header */}
      <div className="screen-page-header">
        <div>
          <span className="wp-label">DISP 08 · Today only</span>
          <h1 className="wp-headline-md" style={{ margin: "0.35rem 0 0" }}>
            {selectedVeh
              ? `${selectedVeh.name} · ${selectedVeh.routeId} · ${selectedVeh.completedStops} / ${selectedVeh.totalStops} stops`
              : "Fleet Live Map"}
          </h1>
          <p className="wp-subtext">All vehicles on corridor · marker shape by chassis type</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
          <span className="wp-chassis-chip wp-chassis-chip--truck">Dry truck</span>
          <span className="wp-chassis-chip wp-chassis-chip--truck_freezer">Truck + freezer</span>
          <span className="wp-chassis-chip wp-chassis-chip--van_freezer">Van + freezer</span>
          <Link href="/driver/route" className="wp-btn wp-btn-outline" style={{ fontSize: "0.75rem", padding: "0.45rem 0.85rem", marginLeft: "0.5rem" }}>
            Driver view
          </Link>
        </div>
      </div>

      <div className="wp-fleet-map-layout" style={{ display: "grid", gridTemplateColumns: "2.2fr 1fr", gap: "1.25rem" }}>
        {/* Map SVG Stage */}
        <section className="wp-panel screen-panel" style={{ padding: 0, overflow: "hidden", position: "relative" }}>
          <div className="wp-corridor-map" style={{ width: "100%", height: "100%", minHeight: "440px" }}>
            <svg
              viewBox="0 0 800 420"
              style={{ width: "100%", height: "100%", display: "block" }}
              role="img"
              aria-label="Fleet map showing all active vehicles on Colombo coastal corridor"
            >
              <defs>
                <pattern id="fleetGrid" width="32" height="32" patternUnits="userSpaceOnUse">
                  <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#D7E2EA" strokeWidth="0.75" />
                </pattern>
              </defs>
              <rect width="800" height="420" fill="#EEF3F6" />
              <rect width="800" height="420" fill="url(#fleetGrid)" opacity="0.55" />
              <path d="M0,300 Q200,260 400,280 T800,310 L800,420 L0,420 Z" fill="#D5E6EE" />
              <path d="M60,200 Q280,180 520,195 T760,210" fill="none" stroke="#C5D0D8" strokeWidth="6" strokeLinecap="round" />
              <path d="M80,200 L240,190" stroke="#16A34A" strokeWidth="4" fill="none" />
              <path d="M240,190 Q400,185 560,200" stroke="#377a8b" strokeWidth="4" fill="none" />
              <path d="M560,200 Q680,210 760,215" stroke="#CBD5E1" strokeWidth="4" fill="none" strokeDasharray="8 6" />

              {vehicles.map((v) => {
                const isSelected = selectedId === v.id;
                return (
                  <g
                    key={v.id}
                    className={`wp-fleet-map-vehicle ${isSelected ? "is-selected" : ""}`}
                    transform={`translate(${v.x}, ${v.y})`}
                    onClick={() => setSelectedId(v.id)}
                    style={{ cursor: "pointer" }}
                  >
                    {isSelected && (
                      <circle r="20" fill="none" stroke="#377a8b" strokeWidth="2" opacity="0.6">
                        <animate attributeName="r" values="14;24;14" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}
                    {v.markerType === "circle" ? (
                      <circle r="12" fill={v.color} />
                    ) : (
                      <rect x="-14" y="-10" width="28" height="20" rx="4" fill={v.color} opacity={v.id === "VEH005" ? 0.6 : 1} />
                    )}
                    <text
                      fill="#fff"
                      fontFamily="JetBrains Mono, monospace"
                      fontSize="7"
                      fontWeight="700"
                      textAnchor="middle"
                      y="3"
                    >
                      {v.code}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </section>

        {/* Sidebar Roster & Stops */}
        <aside className="wp-panel screen-panel" style={{ padding: "1.25rem" }}>
          <h2 className="wp-headline-sm">Fleet roster</h2>
          <p className="decision-note wp-subtext" style={{ margin: "0.35rem 0 0.75rem", fontSize: "0.72rem", padding: "0.5rem 0.65rem" }}>
            Critical stop OUT003 · learned dwell 22 min · 6 min slack
          </p>

          <div className="wp-fleet-list" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {vehicles.map((v) => {
              const isSelected = selectedId === v.id;
              const markerLetter = v.chassis === "truck" ? "T" : v.chassis === "van_freezer" ? "V" : "R";
              return (
                <button
                  key={v.id}
                  type="button"
                  className={`wp-fleet-list-item ${isSelected ? "active" : ""}`}
                  onClick={() => setSelectedId(v.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.6rem 0.75rem",
                    border: isSelected ? "2px solid var(--wp-primary)" : "1px solid var(--wp-border-color, #e2e8f0)",
                    borderRadius: "var(--wp-radius-sm, 6px)",
                    background: isSelected ? "var(--wp-active-bg, rgba(14, 165, 233, 0.08))" : "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    width: "100%",
                  }}
                >
                  <span
                    className={`wp-fleet-list-marker wp-fleet-list-marker--${v.chassis}`}
                    style={{
                      width: "1.5rem",
                      height: "1.5rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "4px",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      background: v.color,
                      color: "#fff",
                    }}
                  >
                    {markerLetter}
                  </span>
                  <span style={{ flex: 1 }}>
                    <strong className="font-mono" style={{ fontSize: "0.8rem", display: "block" }}>
                      {v.name}
                    </strong>
                    <span className="wp-subtext" style={{ display: "block", fontSize: "0.72rem" }}>
                      {v.statusText}
                    </span>
                  </span>
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: v.isOnline ? "var(--wp-success, #22c55e)" : "var(--wp-muted, #94a3b8)",
                    }}
                    title={v.isOnline ? "Online" : "Offline"}
                  ></span>
                </button>
              );
            })}
          </div>

          {selectedVeh && (
            <div style={{ marginTop: "1.25rem" }}>
              <h3 className="wp-headline-sm" style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                {selectedVeh.name} Stops ({selectedVeh.stops.length})
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                {selectedVeh.stops.map((stop) => (
                  <div
                    key={stop.stopNumber}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.45rem 0.6rem",
                      background: "var(--wp-panel-bg)",
                      border: "1px solid var(--wp-border-color, #e2e8f0)",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                    }}
                  >
                    <span>
                      <strong>#{stop.stopNumber}</strong> {stop.outletName}
                    </span>
                    <span
                      className={`mc-status-chip ${
                        stop.status === "Delivered"
                          ? "mc-status-chip-ok"
                          : stop.status === "EnRoute"
                          ? "mc-status-chip-info"
                          : "mc-status-chip-muted"
                      }`}
                    >
                      {stop.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: "1rem" }}>
            <Link href="/store" className="mc-link" style={{ fontSize: "0.78rem" }}>
              Outlet detail →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
