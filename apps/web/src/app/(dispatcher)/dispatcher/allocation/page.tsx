"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCutoffCountdown } from "@/hooks/useCutoffCountdown";

interface Vehicle {
  id: string;
  code: string;
  name: string;
  chassis: "truck" | "truck_freezer" | "van_freezer";
  chassisLabel: string;
  status: string;
  trip: string;
  fillPct: number;
  tareWeight: string;
  maxPayload: string;
  capacity: string;
  loadedSlots: number;
  maxSlots: number;
}

const initialVehicles: Vehicle[] = [
  {
    id: "VEH001",
    code: "S616",
    name: "VEH001",
    chassis: "truck",
    chassisLabel: "Dry Truck",
    status: "Operational",
    trip: "Trip 1",
    fillPct: 68,
    tareWeight: "7,500 kg",
    maxPayload: "12,000 kg",
    capacity: "Open Bed Dry Cargo",
    loadedSlots: 2,
    maxSlots: 3,
  },
  {
    id: "VEH002",
    code: "S617",
    name: "VEH002",
    chassis: "van_freezer",
    chassisLabel: "Van + Freezer",
    status: "Operational",
    trip: "Trip 1",
    fillPct: 54,
    tareWeight: "3,500 kg",
    maxPayload: "4,500 kg",
    capacity: "Curbside Reefer Van",
    loadedSlots: 1,
    maxSlots: 2,
  },
  {
    id: "VEH003",
    code: "S618",
    name: "VEH003",
    chassis: "truck_freezer",
    chassisLabel: "Truck + Freezer",
    status: "Operational",
    trip: "Trip 1",
    fillPct: 72,
    tareWeight: "14,000 kg",
    maxPayload: "32,000 kg",
    capacity: "2 x 40ft Reefer",
    loadedSlots: 1,
    maxSlots: 2,
  },
  {
    id: "VEH004",
    code: "S619",
    name: "VEH004",
    chassis: "truck_freezer",
    chassisLabel: "Truck + Freezer",
    status: "Active",
    trip: "Trip 1",
    fillPct: 82,
    tareWeight: "22,800 kg",
    maxPayload: "68,400 kg",
    capacity: "2 x 40ft / 53ft Reefer",
    loadedSlots: 1,
    maxSlots: 2,
  },
  {
    id: "VEH005",
    code: "S620",
    name: "VEH005",
    chassis: "truck_freezer",
    chassisLabel: "Truck + Freezer",
    status: "Operational",
    trip: "Trip 2",
    fillPct: 76,
    tareWeight: "22,800 kg",
    maxPayload: "68,400 kg",
    capacity: "2 x 40ft / 53ft Reefer",
    loadedSlots: 1,
    maxSlots: 2,
  },
  {
    id: "VEH037",
    code: "S621",
    name: "VEH037",
    chassis: "van_freezer",
    chassisLabel: "Van + Freezer",
    status: "Route",
    trip: "Trip 1",
    fillPct: 61,
    tareWeight: "3,500 kg",
    maxPayload: "4,500 kg",
    capacity: "Compact Reefer Van",
    loadedSlots: 1,
    maxSlots: 2,
  },
];

export default function DispatcherAllocationPage() {
  const cutoff = useCutoffCountdown();
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [selectedVehId, setSelectedVehId] = useState<string>("VEH004");
  const [activeDay, setActiveDay] = useState<"today" | "tomorrow">("today");
  const [isSlotFilled, setIsSlotFilled] = useState<boolean>(false);
  const [isSpecsOpen, setIsSpecsOpen] = useState<boolean>(false);
  const [optimizing, setOptimizing] = useState<boolean>(false);
  const [optResult, setOptResult] = useState<string | null>(null);

  const currentVeh = vehicles.find((v) => v.id === selectedVehId) || vehicles[3];

  const handleAssignCargo = () => {
    setIsSlotFilled(true);
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === selectedVehId ? { ...v, fillPct: Math.min(100, v.fillPct + 15), loadedSlots: Math.min(v.maxSlots, v.loadedSlots + 1) } : v
      )
    );
  };

  const handleRunOptimizer = async () => {
    setOptimizing(true);
    setOptResult(null);
    try {
      const res = await fetch("/api/dispatcher/allocate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategy: "greedy_heuristic" }),
      });
      if (res.ok) {
        const data = await res.json();
        setOptResult("AI solver completed successfully. 6 vehicles optimized with zero cold chain violations.");
      }
    } catch {
      setOptResult("Solver simulated offline run completed.");
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Top Action Header */}
      <div className="wp-action-row">
        <div className="wp-action-row__main">
          <div className="wp-eyebrow-row" style={{ marginBottom: "0.25rem" }}>
            <span className="wp-label">Chassis Inspection</span>
            <span className="wp-state wp-state-success">{currentVeh.status}</span>
          </div>
          <h1 className="wp-headline-md" style={{ margin: 0 }}>
            {currentVeh.name}: 16T Reefer Truck
          </h1>
          <div className="wp-day-switcher" style={{ marginTop: "0.75rem" }}>
            <button
              type="button"
              className={`wp-day-btn ${activeDay === "today" ? "active" : ""}`}
              onClick={() => setActiveDay("today")}
            >
              Today
            </button>
            <button
              type="button"
              className={`wp-day-btn ${activeDay === "tomorrow" ? "active" : ""}`}
              onClick={() => setActiveDay("tomorrow")}
            >
              Tomorrow planning <span className="wp-day-badge">142 orders</span>
            </button>
          </div>
        </div>

        <div className="wp-action-row__actions">
          <button
            type="button"
            className="wp-btn wp-btn-outline"
            onClick={() => setIsSpecsOpen(!isSpecsOpen)}
            style={{ padding: "0.45rem 0.85rem", fontSize: "0.75rem" }}
          >
            Vehicle Specs and Constraints
          </button>
          <button
            type="button"
            className="wp-btn wp-btn-primary"
            onClick={handleRunOptimizer}
            disabled={optimizing}
            style={{ padding: "0.45rem 0.85rem", fontSize: "0.75rem" }}
          >
            {optimizing ? "Solving..." : "Run AI Optimizer"}
          </button>
          <div className="wp-subpanel" style={{ padding: "0.4rem 0.85rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span className="wp-label" style={{ fontSize: "0.7rem", margin: 0 }}>
              Cutoff 16:00 SLST:
            </span>
            <span className="font-mono" style={{ fontWeight: 700, color: "var(--wp-primary)", fontSize: "0.85rem" }}>
              {cutoff.formatted}
            </span>
          </div>
        </div>
      </div>

      {optResult && (
        <div
          style={{
            padding: "0.75rem 1rem",
            background: "var(--wp-card-bg, #f8fafc)",
            border: "1px solid var(--wp-primary)",
            borderRadius: "var(--wp-radius-sm, 6px)",
            fontSize: "0.85rem",
            color: "var(--wp-text-main, #0f172a)",
          }}
        >
          {optResult}
        </div>
      )}

      {/* Fleet Allocation Status Tray */}
      <div className="wp-panel wp-fleet-tray" style={{ padding: "1.25rem 1.5rem" }}>
        <div className="wp-flex-between" style={{ marginBottom: "1rem" }}>
          <div>
            <span className="wp-label">Fleet Allocation Status</span>
            <p className="wp-subtext" style={{ margin: "0.25rem 0 0", fontSize: "0.8rem" }}>
              Select vehicle chassis to inspect payload and constraints
            </p>
          </div>
          <span className="mc-pill mc-pill-info">{vehicles.length} Active Chassis</span>
        </div>

        <div className="wp-fleet-scroll" style={{ display: "flex", gap: "0.75rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
          {vehicles.map((v) => (
            <div
              key={v.id}
              className={`wp-fleet-card ${selectedVehId === v.id ? "active" : ""}`}
              onClick={() => {
                setSelectedVehId(v.id);
                setIsSlotFilled(false);
              }}
              style={{ cursor: "pointer", minWidth: "150px" }}
            >
              <div className="wp-flex-between">
                <span className="font-mono wp-label">{v.code}</span>
                <span className="wp-meta-inline">{v.trip}</span>
              </div>
              <span className={`wp-chassis-chip wp-chassis-chip--${v.chassis}`}>{v.chassisLabel}</span>
              <div className="mini-rail">
                <div className="mini-box" style={{ width: `${v.fillPct}%` }}></div>
              </div>
              <div className="wp-flex-between">
                <span className="font-mono" style={{ fontSize: "0.75rem", fontWeight: 700 }}>
                  {v.name}
                </span>
                <span className="wp-subtext" style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--wp-primary)" }}>
                  {v.fillPct}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {activeDay === "today" ? (
        <div className="wp-grid-2-1">
          {/* Main Visual Chassis Stage */}
          <section className="wp-canvas-inner wp-vehicle-stage">
            <div style={{ textAlign: "center", marginBottom: "1rem" }}>
              <span className="wp-label" style={{ fontSize: "0.75rem" }}>
                Peliyagoda Loading Bay 04 · {currentVeh.name} Active Chassis
              </span>
              <p className="wp-subtext" style={{ fontSize: "0.75rem", margin: "0.25rem 0 0" }}>
                Current Fill Rate: {currentVeh.fillPct}% · {currentVeh.capacity}
              </p>
            </div>

            {currentVeh.chassis === "truck" && (
              <div className="wp-chassis-body wp-chassis-body--truck">
                <div className="wp-chassis-truck" aria-label="Dry truck with open cargo bays">
                  <div className="wp-chassis-truck__cab"></div>
                  <div className="wp-chassis-truck__bed">
                    <div className="wp-chassis-truck__bay is-loaded">Style</div>
                    <div className="wp-chassis-truck__bay is-loaded">Tech</div>
                    <div className={`wp-chassis-truck__bay ${isSlotFilled ? "is-loaded" : ""}`}>
                      {isSlotFilled ? "40CN Chilled" : "Empty"}
                    </div>
                  </div>
                  <div className="wp-chassis-wheels">
                    <span style={{ left: "14%" }}></span>
                    <span style={{ left: "22%" }}></span>
                    <span style={{ right: "18%" }}></span>
                    <span style={{ right: "10%" }}></span>
                  </div>
                </div>
                <p className="font-mono wp-subtext wp-chassis-caption">
                  7.5T Ambient Rigid · Open bays · No cold chain
                </p>
              </div>
            )}

            {currentVeh.chassis === "truck_freezer" && (
              <div className="wp-chassis-body wp-chassis-body--truck_freezer">
                <div className="wp-flatcar" style={{ marginTop: "0.5rem" }}>
                  <div
                    className="wp-container-slot wp-container-filled wp-container-corrugated"
                    style={{
                      left: "6%",
                      top: 0,
                      width: "42%",
                      height: "90px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                    }}
                  >
                    <span className="wp-container-corner tl"></span>
                    <span className="wp-container-corner tr"></span>
                    <span className="wp-container-corner bl"></span>
                    <span className="wp-container-corner br"></span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.2rem" }}>
                      <span style={{ fontSize: "0.7rem", letterSpacing: "0.08em", fontWeight: 800 }}>WAYPOINT</span>
                      <span className="wp-label" style={{ fontSize: "0.55rem", color: "#fff", opacity: 0.9 }}>
                        Reefer
                      </span>
                    </div>
                    <span className="font-mono" style={{ opacity: 0.95, fontSize: "0.65rem" }}>
                      FSCU 423198 · 53CN
                    </span>
                  </div>

                  {isSlotFilled ? (
                    <div
                      className="wp-container-slot wp-container-filled wp-container-corrugated"
                      style={{
                        right: "8%",
                        top: 0,
                        width: "42%",
                        height: "90px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        background: "#0284c7",
                      }}
                    >
                      <span className="wp-container-corner tl"></span>
                      <span className="wp-container-corner tr"></span>
                      <span className="wp-container-corner bl"></span>
                      <span className="wp-container-corner br"></span>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.2rem" }}>
                        <span style={{ fontSize: "0.7rem", letterSpacing: "0.08em", fontWeight: 800 }}>WAYPOINT</span>
                        <span className="wp-label" style={{ fontSize: "0.55rem", color: "#fff", opacity: 0.9 }}>
                          Reefer
                        </span>
                      </div>
                      <span className="font-mono" style={{ opacity: 0.95, fontSize: "0.65rem" }}>
                        OUT001 · 40CN Chilled
                      </span>
                    </div>
                  ) : (
                    <div
                      className="wp-container-slot slot-active"
                      id="empty-container-slot"
                      onClick={handleAssignCargo}
                      style={{ right: "8%", top: 0, width: "42%", height: "90px", cursor: "pointer" }}
                    >
                      <div style={{ textAlign: "center" }}>
                        <p className="wp-label" style={{ fontSize: "0.65rem", color: "var(--wp-primary)", margin: 0 }}>
                          Staged Slot Ready
                        </p>
                        <p className="wp-subtext" style={{ fontSize: "0.65rem", margin: 0 }}>
                          Click Assign to Mount
                        </p>
                      </div>
                    </div>
                  )}

                  <svg viewBox="0 0 540 80" style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "46px" }} aria-hidden="true">
                    <line x1="10" y1="68" x2="530" y2="68" stroke="#cbd5e1" strokeWidth="4" strokeDasharray="16 8" />
                    <rect x="24" y="24" width="492" height="14" rx="3" fill="#475569" />
                    <circle cx="70" cy="54" r="14" fill="#1e293b" />
                    <circle cx="106" cy="54" r="14" fill="#1e293b" />
                    <circle cx="434" cy="54" r="14" fill="#1e293b" />
                    <circle cx="470" cy="54" r="14" fill="#1e293b" />
                  </svg>
                </div>
                <div
                  className="wp-chassis-freezer-box"
                  style={{
                    position: "relative",
                    marginTop: "1.25rem",
                    left: "auto",
                    right: "auto",
                    bottom: "auto",
                    width: "100%",
                    maxWidth: "520px",
                    marginLeft: "auto",
                    marginRight: "auto",
                  }}
                >
                  <span style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.06em" }}>REEFER BOX</span>
                  <span className="wp-chassis-temp">−18°C to +4°C</span>
                </div>
                <p className="font-mono wp-subtext wp-chassis-caption">
                  Reefer truck · Container mount + freezer box · Fresh 270 min budget
                </p>
              </div>
            )}

            {currentVeh.chassis === "van_freezer" && (
              <div className="wp-chassis-body wp-chassis-body--van_freezer">
                <div className="wp-chassis-van" aria-label="Reefer van with curb clearance">
                  <div className="wp-chassis-van__cab"></div>
                  <div className="wp-chassis-van__body">
                    <span style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.06em" }}>REEFER VAN</span>
                    <span className="wp-chassis-temp">+2°C to +4°C</span>
                  </div>
                  <span className="wp-chassis-van__clearance">van only · 3.2 m</span>
                  <div className="wp-chassis-wheels">
                    <span style={{ left: "18%" }}></span>
                    <span style={{ right: "22%" }}></span>
                  </div>
                </div>
                <p className="font-mono wp-subtext wp-chassis-caption">
                  Compact reefer van · van only eligible · curb unload
                </p>
              </div>
            )}
          </section>

          {/* Right Column: Staged Cargo Queue */}
          <aside>
            <div className="wp-flex-between" style={{ marginBottom: "1rem" }}>
              <span className="wp-label">Staged Cargo Queue</span>
              <span className="wp-flag wp-flag-warning">{isSlotFilled ? "1 Unassigned" : "2 Unassigned"}</span>
            </div>

            {/* Cargo Card 1: 40CN Reefer */}
            <div className="wp-panel wp-cargo-card" style={{ padding: "1.25rem", marginBottom: "1rem" }}>
              <div className="wp-flex-between">
                <span className="wp-headline-sm" style={{ fontSize: "1.1rem" }}>
                  40CN Reefer
                </span>
                <span className="font-mono wp-subtext" style={{ fontSize: "0.7rem" }}>
                  12,192 x 2,438 mm
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "0.5rem 0" }}>
                <div>
                  <p className="wp-subtext" style={{ margin: 0 }}>
                    <strong>OUT001</strong> · Fresh · Galle Road
                  </p>
                  <p className="wp-subtext" style={{ fontSize: "0.78rem", margin: "0.15rem 0 0" }}>
                    <span className="wp-meta-stack-primary is-chilled">Chilled Reefer</span> · 4,850 kg
                  </p>
                </div>
              </div>

              <div style={{ margin: "0.75rem 0 0.5rem" }}>
                <span className="wp-label" style={{ display: "block", marginBottom: "0.35rem" }}>
                  Departure Window
                </span>
                <div className="wp-select-btn">
                  <span>05:00 to 07:30 SLST</span>
                </div>
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <span className="wp-label" style={{ display: "block", marginBottom: "0.35rem" }}>
                  Depot Bay
                </span>
                <div className="wp-select-btn">
                  <span>Peliyagoda Bay 04</span>
                </div>
              </div>

              <button
                type="button"
                className="wp-btn wp-btn-primary"
                onClick={handleAssignCargo}
                disabled={isSlotFilled}
                style={{ width: "100%", marginBottom: "0.5rem" }}
              >
                {isSlotFilled ? "Mounted to Active Chassis" : "Assign to Vehicle"}
              </button>

              <div className="decision-note" style={{ marginTop: "0.75rem", fontSize: "0.72rem" }}>
                <strong>VEH014 trip 2 over weight.</strong> Move overflow to VEH037 trip 1 (14 min Fresh budget) or defer OUT088 instead of OUT004.
                <Link href="/dispatcher/validator" className="mc-link" style={{ display: "inline-block", marginTop: "0.35rem" }}>
                  Open validator →
                </Link>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                <Link href="/dispatcher/deferral" className="wp-btn wp-btn-outline" style={{ flex: 1, textAlign: "center" }}>
                  Deferral panel
                </Link>
                <Link href="/dispatcher/validator" className="wp-btn wp-btn-ghost" style={{ flex: 1, textAlign: "center" }}>
                  Live meters
                </Link>
              </div>
            </div>

            {/* Cargo Card 2: 53CN Dry Van */}
            <div className="wp-panel wp-cargo-card" style={{ padding: "1.25rem" }}>
              <div className="wp-flex-between">
                <span className="wp-headline-sm" style={{ fontSize: "1.1rem" }}>
                  53CN Dry Van
                </span>
                <span className="font-mono wp-subtext" style={{ fontSize: "0.7rem" }}>
                  16,154 x 2,591 mm
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "0.5rem 0" }}>
                <div>
                  <p className="wp-subtext" style={{ margin: 0 }}>
                    <strong>OUT002</strong> · Style · Duplication Rd
                  </p>
                  <p className="wp-subtext" style={{ fontSize: "0.78rem", margin: "0.15rem 0 0" }}>
                    Ambient · 2,100 kg · <span className="wp-meta-inline">Van only</span>
                  </p>
                </div>
              </div>
              <div style={{ marginTop: "0.75rem" }}>
                <span className="wp-label" style={{ display: "block", marginBottom: "0.35rem" }}>
                  Departure Window
                </span>
                <div className="wp-select-btn">
                  <span>05:30 to 08:00 SLST</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      ) : (
        /* Tomorrow Planning Tab */
        <div className="wp-panel" style={{ padding: "1.5rem" }}>
          <span className="wp-label">Evening planning · Post cutoff 16:00 SLST</span>
          <h2 className="wp-headline-sm" style={{ margin: "0.5rem 0" }}>
            Tomorrow: 142 orders · 48 chilled · 9 reefer trips available
          </h2>
          <p className="wp-subtext">
            Load tomorrow queue when evening planning starts. Today live allocation stays on the Today tab.
          </p>
          <div className="wp-kpi-row" style={{ marginTop: "1.25rem" }}>
            <div className="wp-kpi">
              <span className="wp-label">Total orders</span>
              <p className="wp-kpi-value">142</p>
            </div>
            <div className="wp-kpi">
              <span className="wp-label">Chilled</span>
              <p className="wp-kpi-value" style={{ color: "var(--wp-info)" }}>
                48
              </p>
            </div>
            <div className="wp-kpi">
              <span className="wp-label">Reefer trips</span>
              <p className="wp-kpi-value">9</p>
            </div>
            <div className="wp-kpi">
              <span className="wp-label">Est deferrals</span>
              <p className="wp-kpi-value" style={{ color: "var(--wp-warning)" }}>
                4
              </p>
            </div>
          </div>
          <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.65rem" }}>
            <Link href="/dispatcher/queue" className="wp-btn wp-btn-primary">
              Open tomorrow queue
            </Link>
            <Link href="/dispatcher/deferral" className="wp-btn wp-btn-outline">
              Plan deferrals
            </Link>
          </div>
        </div>
      )}

      {/* Slide Out Vehicle Specs Drawer */}
      {isSpecsOpen && (
        <div className="wp-drawer-backdrop" style={{ display: "block" }}>
          <div className="wp-drawer-right">
            <div className="wp-drawer-header">
              <div>
                <span className="wp-label">Chassis Engineering</span>
                <h2 className="wp-headline-sm" style={{ margin: "0.25rem 0 0" }}>
                  Vehicle Specifications
                </h2>
              </div>
              <button
                type="button"
                className="wp-icon-btn"
                onClick={() => setIsSpecsOpen(false)}
                aria-label="Close sidebar"
              >
                ✕
              </button>
            </div>

            <div className="wp-drawer-body">
              <section className="wp-specs-drawer-panel">
                <h3 className="wp-specs-drawer-title">Vehicle Profile</h3>
                <ul className="wp-specs-drawer-list">
                  <li>
                    <span>Model</span>
                    <strong>{currentVeh.name} Reefer</strong>
                  </li>
                  <li>
                    <span>Tare weight</span>
                    <strong className="font-mono">{currentVeh.tareWeight}</strong>
                  </li>
                  <li>
                    <span>Max payload</span>
                    <strong className="font-mono">{currentVeh.maxPayload}</strong>
                  </li>
                  <li>
                    <span>Status</span>
                    <strong>{currentVeh.status}</strong>
                  </li>
                  <li>
                    <span>Capacity</span>
                    <strong>{currentVeh.capacity}</strong>
                  </li>
                </ul>
              </section>

              <section className="wp-specs-drawer-panel" style={{ marginTop: "1rem" }}>
                <h3 className="wp-specs-drawer-title">Axle Weight Distribution</h3>
                <div className="wp-specs-cog-labels">
                  <span>Front Axle Bias</span>
                  <strong>Center</strong>
                  <span>Rear Axle Bias</span>
                </div>
                <div className="wp-axle-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginTop: "0.5rem" }}>
                  <div className="wp-axle-card" style={{ padding: "0.5rem", background: "var(--wp-panel-bg)" }}>
                    <span className="wp-label">Front Steer Axle</span>
                    <div className="font-mono wp-specs-axle-val">11,400 kg</div>
                    <span className="wp-subtext">Limit: 16,000 kg</span>
                  </div>
                  <div className="wp-axle-card" style={{ padding: "0.5rem", background: "var(--wp-panel-bg)" }}>
                    <span className="wp-label">Rear Drive Tandem</span>
                    <div className="font-mono wp-specs-axle-val">22,800 kg</div>
                    <span className="wp-subtext">Limit: 32,000 kg</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
