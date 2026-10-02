"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useCutoffCountdown } from "@/hooks/useCutoffCountdown";

interface Incident {
  id: string;
  code: string;
  type: "shortfall" | "sync" | "window";
  severity: "critical" | "high" | "medium";
  title: string;
  description: string;
  vehicleId: string;
  routeId: string;
  outletId: string;
  status: "OPEN" | "RESOLVED";
  resolutionNote?: string;
  timestamp: string;
}

export default function DispatcherExceptionsPage() {
  const cutoff = useCutoffCountdown();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncState, setSyncState] = useState<"offline" | "queued" | "syncing" | "synced" | "conflict">("conflict");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadIncidents() {
      try {
        const res = await fetch("/api/dispatcher/exceptions");
        if (res.ok) {
          const data = await res.json();
          setIncidents(data.incidents || []);
        }
      } catch (err) {
        console.error("Failed to load incidents", err);
      } finally {
        setLoading(false);
      }
    }
    loadIncidents();
  }, []);

  const handleResolve = async (incidentId: string, action: string) => {
    try {
      const res = await fetch("/api/dispatcher/exceptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incidentId, action, note: `Action ${action} executed by dispatcher desk` }),
      });
      if (res.ok) {
        const data = await res.json();
        setActionMessage(data.message);
        setIncidents((prev) =>
          prev.map((i) => (i.id === incidentId ? { ...i, status: "RESOLVED", resolutionNote: action } : i))
        );
      }
    } catch (err) {
      console.error("Failed to resolve incident", err);
    }
  };

  const openIncidents = incidents.filter((i) => i.status === "OPEN");
  const gateHolds = openIncidents.filter((i) => i.type === "shortfall").length;
  const syncConflicts = openIncidents.filter((i) => i.type === "sync").length;
  const windowRisks = openIncidents.filter((i) => i.type === "window").length;

  const filteredIncidents = incidents.filter((i) => {
    const matchesSearch =
      i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.vehicleId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !typeFilter || i.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Cutoff Banner */}
      <div className="wp-cutoff-banner" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.35rem" }}>
            <span className="wp-state wp-state-warning">Triage Active</span>
            <span className="wp-subtext" style={{ fontSize: "0.8rem" }}>
              Warehouse dock, field driver sync, and cold chain telemetry
            </span>
          </div>
          <h1 className="wp-headline-md" style={{ margin: 0 }}>
            Exception and Synchronization Triage
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div style={{ textAlign: "right" }}>
            <span className="wp-label" style={{ fontSize: "0.7rem" }}>
              Open Incidents
            </span>
            <div className="font-mono" style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--wp-error, #ef4444)" }}>
              {openIncidents.length} / {incidents.length}
            </div>
          </div>
          <div className="wp-subpanel" style={{ padding: "0.4rem 0.85rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span className="wp-label" style={{ fontSize: "0.7rem", margin: 0 }}>
              Daily Cutoff:
            </span>
            <span className="font-mono" style={{ fontWeight: 700, color: "var(--wp-primary)", fontSize: "0.85rem" }}>
              {cutoff.formatted}
            </span>
          </div>
        </div>
      </div>

      {actionMessage && (
        <div
          style={{
            padding: "0.75rem 1rem",
            background: "var(--wp-card-bg, #f0fdf4)",
            border: "1px solid var(--wp-success, #22c55e)",
            borderRadius: "var(--wp-radius-sm, 6px)",
            fontSize: "0.85rem",
          }}
        >
          ✓ {actionMessage}
        </div>
      )}

      {/* KPI Summary Row */}
      <div className="wp-kpi-row">
        <div className="wp-kpi">
          <span className="wp-label">Open Incidents</span>
          <p className="wp-kpi-value" style={{ color: "var(--wp-error, #ef4444)" }}>
            {openIncidents.length}
          </p>
          <span className="wp-subtext" style={{ fontSize: "0.75rem", marginTop: "0.4rem" }}>
            Action items pending resolution
          </span>
        </div>
        <div className="wp-kpi">
          <span className="wp-label">Gate Holds</span>
          <p className="wp-kpi-value" style={{ color: "var(--wp-warning, #f59e0b)" }}>
            {gateHolds}
          </p>
          <span className="wp-subtext" style={{ fontSize: "0.75rem", marginTop: "0.4rem" }}>
            Departure blocked at dock
          </span>
        </div>
        <div className="wp-kpi">
          <span className="wp-label">Sync Conflicts</span>
          <p className="wp-kpi-value" style={{ color: "var(--wp-info, #0284c7)" }}>
            {syncConflicts}
          </p>
          <span className="wp-subtext" style={{ fontSize: "0.75rem", marginTop: "0.4rem" }}>
            Offline vs server state mismatch
          </span>
        </div>
        <div className="wp-kpi">
          <span className="wp-label">Window Risks</span>
          <p className="wp-kpi-value">{windowRisks}</p>
          <span className="wp-subtext" style={{ fontSize: "0.75rem", marginTop: "0.4rem" }}>
            Mall dock ETA breach projected
          </span>
        </div>
      </div>

      {/* Primary Degradation Strip: Offline Sync */}
      <section className="deg-strip wp-panel" style={{ padding: "1.25rem 1.5rem" }}>
        <div className="deg-strip-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
          <div>
            <span className="wp-label">DISP 07 · Degradation Simulation</span>
            <h2 className="wp-headline-sm" style={{ margin: "0.35rem 0 0" }}>
              Kandy hill country blackout · VEH037 · Route R025229
            </h2>
            <p className="wp-subtext" style={{ fontSize: "0.78rem", margin: "0.35rem 0 0" }}>
              Server deferred OUT003 at 6:00 AM while Kamal Silva delivered offline at 6:35 AM with proof of delivery.
            </p>
          </div>
          <span className="mc-pill mc-pill-info">State: {syncState.toUpperCase()}</span>
        </div>

        {/* Tab state buttons */}
        <div className="screen-sync-states" style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          {(["offline", "queued", "syncing", "synced", "conflict"] as const).map((s) => (
            <button
              key={s}
              type="button"
              className={`wp-btn ${syncState === s ? "wp-btn-primary" : "wp-btn-outline"}`}
              style={{ fontSize: "0.75rem", padding: "0.35rem 0.75rem" }}
              onClick={() => setSyncState(s)}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="screen-grid-2" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "1.25rem" }}>
          <div className="deg-dispatcher-route" style={{ border: "1px solid var(--wp-border-color, #e2e8f0)", borderRadius: "var(--wp-radius-sm, 6px)", padding: "1rem" }}>
            {syncState === "offline" && (
              <div>
                <p className="wp-subtext" style={{ margin: "0 0 0.75rem", fontSize: "0.8rem" }}>
                  <strong>Last sync 6:12 AM</strong> · Route R025229 · Stops 2 and 3 pending in hill blackout zone
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem", background: "var(--wp-panel-bg)" }}>
                    <span>Stop 1 · OUT001</span>
                    <span className="mc-status-chip mc-status-chip-ok">Delivered 05:45 AM</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem", background: "var(--wp-panel-bg)" }}>
                    <span>Stop 2 · OUT003</span>
                    <span className="mc-status-chip mc-status-chip-muted">Pending Offline</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem", background: "var(--wp-panel-bg)" }}>
                    <span>Stop 3 · OUT004</span>
                    <span className="mc-status-chip mc-status-chip-muted">Pending Offline</span>
                  </div>
                </div>
              </div>
            )}

            {syncState === "queued" && (
              <div>
                <p className="wp-subtext" style={{ margin: "0 0 0.75rem", fontSize: "0.8rem" }}>
                  Driver reconnect pending · Delivery transactions safely queued in device IndexedDB
                </p>
                <div style={{ padding: "1rem", textAlign: "center", color: "var(--wp-muted)" }}>
                  Awaiting 4G cellular restoration in Kadugannawa pass
                </div>
              </div>
            )}

            {syncState === "syncing" && (
              <div>
                <p className="wp-subtext" style={{ margin: "0 0 0.75rem", fontSize: "0.8rem" }}>
                  Network restored · Replaying queued IndexedDB transactions to server
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem", background: "var(--wp-panel-bg)" }}>
                    <span>Stop 2 · OUT003 POD</span>
                    <span className="mc-status-chip mc-status-chip-info">Uploading Signature...</span>
                  </div>
                </div>
              </div>
            )}

            {syncState === "synced" && (
              <div>
                <p className="wp-subtext" style={{ margin: "0 0 0.75rem", fontSize: "0.8rem" }}>
                  All stops checkmarked · Timestamps and signatures synchronized
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem", background: "var(--wp-panel-bg)" }}>
                    <span>Stop 2 · OUT003</span>
                    <span className="mc-status-chip mc-status-chip-ok">Delivered 06:35 AM</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem", background: "var(--wp-panel-bg)" }}>
                    <span>Stop 3 · OUT004</span>
                    <span className="mc-status-chip mc-status-chip-ok">Delivered 06:50 AM</span>
                  </div>
                </div>
              </div>
            )}

            {syncState === "conflict" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <strong style={{ fontSize: "0.9rem", color: "var(--wp-error, #ef4444)" }}>
                  Conflict: OUT003 deferred by dispatcher at 06:00 AM, driver completed POD at 06:35 AM offline
                </strong>
                <p className="wp-subtext" style={{ fontSize: "0.78rem", margin: 0 }}>
                  Kamal Silva · VEH037 · Digital POD with receiver signature evidence verified on device.
                </p>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                  <button
                    type="button"
                    className="wp-btn wp-btn-primary"
                    style={{ fontSize: "0.75rem" }}
                    onClick={() => {
                      setSyncState("synced");
                      handleResolve("inc_02", "Accepted delivery as served");
                    }}
                  >
                    Accept delivery as served
                  </button>
                  <button
                    type="button"
                    className="wp-btn wp-btn-outline"
                    style={{ fontSize: "0.75rem" }}
                    onClick={() => handleResolve("inc_02", "Escalated to Area Manager")}
                  >
                    Escalate
                  </button>
                </div>
              </div>
            )}
          </div>

          <aside className="wp-subpanel" style={{ padding: "1rem" }}>
            <span className="wp-label">Store impact · SM 07</span>
            <p className="wp-subtext" style={{ fontSize: "0.8rem", margin: "0.35rem 0 0" }}>
              ETA frozen, driver offline, last update 6:12 AM
            </p>
            <Link href="/driver/sync" className="mc-link" style={{ display: "inline-block", marginTop: "0.75rem", fontSize: "0.78rem" }}>
              Driver sync view →
            </Link>
          </aside>
        </div>
      </section>

      {/* Incident List with Filters */}
      <div className="wp-panel" style={{ padding: "1.25rem 1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", flex: 1, maxWidth: "450px" }}>
            <input
              type="text"
              className="wp-input"
              placeholder="Search incident, vehicle, or outlet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: "100%", padding: "0.45rem 0.75rem" }}
            />
            <select
              className="wp-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ padding: "0.45rem 0.75rem" }}
            >
              <option value="">All Types</option>
              <option value="shortfall">Shortfall</option>
              <option value="sync">Sync Conflict</option>
              <option value="window">Window Risk</option>
            </select>
          </div>
          <span className="wp-subtext" style={{ fontSize: "0.8rem" }}>
            Showing {filteredIncidents.length} incidents
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>Loading incident feed...</div>
          ) : (
            filteredIncidents.map((incident) => (
              <div
                key={incident.id}
                style={{
                  padding: "1rem",
                  border: "1px solid var(--wp-border-color, #e2e8f0)",
                  borderRadius: "var(--wp-radius-sm, 6px)",
                  background: incident.status === "RESOLVED" ? "var(--wp-card-bg, #f8fafc)" : "var(--wp-panel-bg)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                      <span className="font-mono wp-label">{incident.code}</span>
                      <span
                        className={`mc-status-chip ${
                          incident.severity === "critical"
                            ? "mc-status-chip-danger"
                            : incident.severity === "high"
                            ? "mc-status-chip-warn"
                            : "mc-status-chip-info"
                        }`}
                      >
                        {incident.severity.toUpperCase()}
                      </span>
                      <span className="wp-subtext font-mono" style={{ fontSize: "0.75rem" }}>
                        {incident.timestamp}
                      </span>
                    </div>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0.2rem 0" }}>{incident.title}</h3>
                  </div>
                  <span className={`mc-status-chip ${incident.status === "RESOLVED" ? "mc-status-chip-ok" : "mc-status-chip-danger"}`}>
                    {incident.status}
                  </span>
                </div>

                <p className="wp-subtext" style={{ fontSize: "0.85rem", margin: "0.25rem 0 0.75rem" }}>
                  {incident.description}
                </p>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.75rem", color: "var(--wp-muted)" }}>
                    <span>Vehicle: {incident.vehicleId}</span>
                    <span>Route: {incident.routeId}</span>
                    <span>Outlet: {incident.outletId}</span>
                  </div>

                  {incident.status === "OPEN" ? (
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      {incident.type === "shortfall" && (
                        <button
                          type="button"
                          className="wp-btn wp-btn-primary"
                          style={{ fontSize: "0.75rem", padding: "0.35rem 0.75rem" }}
                          onClick={() => handleResolve(incident.id, "Approved short shipment and released gate hold")}
                        >
                          Approve Short Shipment
                        </button>
                      )}
                      {incident.type === "sync" && (
                        <button
                          type="button"
                          className="wp-btn wp-btn-primary"
                          style={{ fontSize: "0.75rem", padding: "0.35rem 0.75rem" }}
                          onClick={() => handleResolve(incident.id, "Accepted offline POD as valid")}
                        >
                          Accept Offline POD
                        </button>
                      )}
                      {incident.type === "window" && (
                        <button
                          type="button"
                          className="wp-btn wp-btn-primary"
                          style={{ fontSize: "0.75rem", padding: "0.35rem 0.75rem" }}
                          onClick={() => handleResolve(incident.id, "Re routed trip via Colombo Katunayake expressway")}
                        >
                          Re route via Expressway
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="wp-subtext" style={{ fontSize: "0.75rem", fontStyle: "italic" }}>
                      Resolved: {incident.resolutionNote}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
