"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  WifiOff,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

type SyncState = "offline" | "queued" | "syncing" | "synced" | "conflict";

export default function DriverSyncPage() {
  const [syncState, setSyncState] = useState<SyncState>("offline");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const updateOnline = () => {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        setSyncState("offline");
      }
    };
    updateOnline();
    window.addEventListener("offline", updateOnline);
    return () => {
      window.removeEventListener("offline", updateOnline);
    };
  }, []);

  const handleSyncReplay = async () => {
    setIsSubmitting(true);
    setSyncState("syncing");
    try {
      const res = await fetch("/api/sync/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pods: [
            { id: "POD001", deliveryCode: "OUT001", receiverName: "Sunil Bandara" },
            { id: "POD003", deliveryCode: "OUT003", receiverName: "Nimal Perera" },
          ],
          tempReadings: [
            { id: "T1", vehicleId: "VEH037", frozenTempC: -19.2, chilledTempC: 3.4 },
          ],
        }),
      });
      const data = await res.json();
      if (data.conflicts && data.conflicts.length > 0) {
        setSyncState("conflict");
      } else {
        setSyncState("synced");
      }
    } catch {
      setSyncState("conflict");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: "1.5rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div className="screen-page-header" style={{ marginBottom: "1.5rem" }}>
        <div>
          <span className="wp-label">DRV 06 · Degradation hi fi</span>
          <h1 className="wp-headline-md" style={{ margin: "0.35rem 0 0" }}>
            Kandy hill country blackout
          </h1>
          <p className="wp-subtext">Kamal Silva · VEH037 · Route R025229 · OUT003 stop 2</p>
        </div>
      </div>

      <div
        className="screen-grid-2"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: "1.5rem",
        }}
      >
        <section className="wp-panel screen-panel" style={{ padding: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <span className="wp-label">Driver Handheld Cockpit · Offline Sync</span>
            <button
              type="button"
              onClick={handleSyncReplay}
              disabled={isSubmitting}
              className="wp-btn wp-btn-outline"
              style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}
            >
              Trigger batch sync
            </button>
          </div>

          <div
            className="deg-driver-screen"
            style={{ padding: "0.5rem 0", minHeight: "520px" }}
          >

              {syncState === "offline" && (
                <div>
                  <div
                    className="wp-offline-banner stale"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.6rem 0.8rem",
                      borderRadius: "6px",
                      backgroundColor: "#fef3c7",
                      color: "#92400e",
                      fontSize: "0.78rem",
                      marginBottom: "1rem",
                      lineHeight: "1.3",
                    }}
                  >
                    <WifiOff size={16} />
                    <span>Deliveries will queue locally when signal drops.</span>
                  </div>
                  <h2 className="wp-headline-sm" style={{ margin: "0" }}>
                    Route R025229
                  </h2>
                  <p
                    className="wp-subtext"
                    style={{ fontSize: "0.75rem", margin: "0.25rem 0 1rem" }}
                  >
                    Last sync 6:12 AM · 2 stops remaining
                  </p>
                  <div
                    className="deg-route-mini"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    <div
                      className="deg-route-stop is-done"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "0.6rem",
                        border: "1px solid var(--wp-border)",
                        borderRadius: "6px",
                        fontSize: "0.85rem",
                      }}
                    >
                      <span>Stop 1 · OUT001</span>
                      <span className="mc-status-chip mc-status-chip-ok">
                        Delivered
                      </span>
                    </div>
                    <div
                      className="deg-route-stop is-active"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "0.6rem",
                        border: "2px solid var(--wp-primary)",
                        borderRadius: "6px",
                        fontSize: "0.85rem",
                        background: "rgba(224, 28, 36, 0.04)",
                      }}
                    >
                      <span>Stop 2 · OUT003</span>
                      <span className="mc-status-chip mc-status-chip-muted">
                        In progress
                      </span>
                    </div>
                    <div
                      className="deg-route-stop"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "0.6rem",
                        border: "1px solid var(--wp-border)",
                        borderRadius: "6px",
                        fontSize: "0.85rem",
                      }}
                    >
                      <span>Stop 3 · OUT004</span>
                      <span className="mc-status-chip mc-status-chip-muted">
                        Pending
                      </span>
                    </div>
                  </div>
                  <p
                    className="wp-subtext"
                    style={{ marginTop: "1rem", fontSize: "0.75rem" }}
                  >
                    Stops remain completable offline. POD and signatures queue locally.
                  </p>
                  <Link
                    href="/driver/pod"
                    className="wp-btn wp-btn-primary"
                    style={{
                      width: "100%",
                      marginTop: "1rem",
                      justifyContent: "center",
                      display: "flex",
                      padding: "0.6rem",
                    }}
                  >
                    Complete stop · Capture POD
                  </Link>
                </div>
              )}

              {syncState === "queued" && (
                <div>
                  <div
                    className="wp-offline-banner stale"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.6rem 0.8rem",
                      borderRadius: "6px",
                      backgroundColor: "#fef3c7",
                      color: "#92400e",
                      fontSize: "0.78rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <WifiOff size={16} />
                    <span>Offline: 3 actions queued</span>
                  </div>
                  <h2 className="wp-headline-sm" style={{ margin: "0" }}>
                    Sync queue
                  </h2>
                  <div
                    className="screen-list"
                    style={{
                      marginTop: "0.75rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    <div
                      className="screen-list-item"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "0.6rem",
                        border: "1px solid var(--wp-border)",
                        borderRadius: "6px",
                        fontSize: "0.82rem",
                      }}
                    >
                      <span>POD · OUT003 · 6:18 AM</span>
                      <span className="mc-status-chip mc-status-chip-muted">
                        Queued
                      </span>
                    </div>
                    <div
                      className="screen-list-item"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "0.6rem",
                        border: "1px solid var(--wp-border)",
                        borderRadius: "6px",
                        fontSize: "0.82rem",
                      }}
                    >
                      <span>POD · OUT001 · 6:35 AM</span>
                      <span className="mc-status-chip mc-status-chip-muted">
                        Queued
                      </span>
                    </div>
                    <div
                      className="screen-list-item"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "0.6rem",
                        border: "1px solid var(--wp-border)",
                        borderRadius: "6px",
                        fontSize: "0.82rem",
                      }}
                    >
                      <span>Telemetry · OUT004 · 6:40 AM</span>
                      <span className="mc-status-chip mc-status-chip-muted">
                        Queued
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {syncState === "syncing" && (
                <div>
                  <div
                    className="wp-offline-banner syncing"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.6rem 0.8rem",
                      borderRadius: "6px",
                      backgroundColor: "#dbeafe",
                      color: "#1e40af",
                      fontSize: "0.78rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Syncing 2 of 3 actions</span>
                  </div>
                  <h2 className="wp-headline-sm" style={{ margin: "0" }}>
                    Uploading actions
                  </h2>
                  <div
                    className="screen-list"
                    style={{
                      marginTop: "0.75rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    <div
                      className="screen-list-item"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "0.6rem",
                        border: "1px solid var(--wp-border)",
                        borderRadius: "6px",
                        fontSize: "0.82rem",
                      }}
                    >
                      <span>POD · OUT003 · 6:18 AM</span>
                      <span className="mc-status-chip mc-status-chip-info">
                        Syncing
                      </span>
                    </div>
                    <div
                      className="screen-list-item"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "0.6rem",
                        border: "1px solid var(--wp-border)",
                        borderRadius: "6px",
                        fontSize: "0.82rem",
                      }}
                    >
                      <span>POD · OUT001 · 6:35 AM</span>
                      <span className="mc-status-chip mc-status-chip-info">
                        Syncing
                      </span>
                    </div>
                    <div
                      className="screen-list-item"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "0.6rem",
                        border: "1px solid var(--wp-border)",
                        borderRadius: "6px",
                        fontSize: "0.82rem",
                      }}
                    >
                      <span>Telemetry · OUT004 · 6:40 AM</span>
                      <span className="mc-status-chip mc-status-chip-muted">
                        Waiting
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {syncState === "synced" && (
                <div>
                  <div
                    className="wp-offline-banner synced"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.6rem 0.8rem",
                      borderRadius: "6px",
                      backgroundColor: "#dcfce7",
                      color: "#166534",
                      fontSize: "0.78rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <CheckCircle size={16} />
                    <span>Synced · all timestamps updated</span>
                  </div>
                  <h2 className="wp-headline-sm" style={{ margin: "0" }}>
                    Sync complete
                  </h2>
                  <div
                    className="screen-list"
                    style={{
                      marginTop: "0.75rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    <div
                      className="screen-list-item"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "0.6rem",
                        border: "1px solid var(--wp-border)",
                        borderRadius: "6px",
                        fontSize: "0.82rem",
                      }}
                    >
                      <span>POD · OUT003 · 6:18 AM</span>
                      <span className="mc-status-chip mc-status-chip-ok">
                        Synced 6:37 AM
                      </span>
                    </div>
                    <div
                      className="screen-list-item"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "0.6rem",
                        border: "1px solid var(--wp-border)",
                        borderRadius: "6px",
                        fontSize: "0.82rem",
                      }}
                    >
                      <span>POD · OUT001 · 6:35 AM</span>
                      <span className="mc-status-chip mc-status-chip-ok">
                        Synced 6:37 AM
                      </span>
                    </div>
                    <div
                      className="screen-list-item"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "0.6rem",
                        border: "1px solid var(--wp-border)",
                        borderRadius: "6px",
                        fontSize: "0.82rem",
                      }}
                    >
                      <span>Telemetry · OUT004 · 6:40 AM</span>
                      <span className="mc-status-chip mc-status-chip-ok">
                        Synced 6:38 AM
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {syncState === "conflict" && (
                <div>
                  <div
                    className="wp-offline-banner conflict"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.6rem 0.8rem",
                      borderRadius: "6px",
                      backgroundColor: "#fee2e2",
                      color: "#991b1b",
                      fontSize: "0.78rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <AlertTriangle size={16} />
                    <span>Conflict on stop 2: server deferred while offline</span>
                  </div>
                  <h2 className="wp-headline-sm" style={{ margin: "0" }}>
                    OUT003 needs review
                  </h2>
                  <p
                    className="wp-subtext"
                    style={{ fontSize: "0.78rem", margin: "0.5rem 0 1rem" }}
                  >
                    Server deferred at 6:00 AM. Driver POD at 6:35 AM is queued for
                    dispatcher decision.
                  </p>
                  <div
                    className="deg-conflict-card"
                    style={{
                      padding: "0.85rem",
                      border: "1px solid #f87171",
                      borderRadius: "8px",
                      backgroundColor: "#fff1f2",
                    }}
                  >
                    <strong style={{ fontSize: "0.85rem", color: "#991b1b" }}>
                      Conflict: OUT003
                    </strong>
                    <p
                      className="wp-subtext"
                      style={{ fontSize: "0.75rem", margin: "0.35rem 0 0.75rem" }}
                    >
                      Deferred 6:00 AM server · driver POD 6:35 AM offline
                    </p>
                    <div
                      className="deg-conflict-actions"
                      style={{ display: "flex", gap: "0.5rem" }}
                    >
                      <Link
                        href="/dispatcher/exceptions"
                        className="wp-btn wp-btn-primary"
                        style={{ fontSize: "0.75rem", padding: "0.4rem 0.6rem" }}
                      >
                        Open dispatcher card
                      </Link>
                      <Link
                        href="/store/tracking"
                        className="wp-btn wp-btn-outline"
                        style={{ fontSize: "0.75rem", padding: "0.4rem 0.6rem" }}
                      >
                        Store view
                      </Link>
                    </div>
                  </div>
                </div>
              )}
          </div>
        </section>

        <section className="wp-panel screen-panel" style={{ padding: "1.5rem" }}>
          <span className="wp-label">Cross role context</span>
          <h2 className="wp-headline-sm" style={{ marginTop: "0.5rem" }}>
            Dispatcher · DISP 07
          </h2>
          <div
            className="deg-dispatcher-route"
            style={{
              padding: "1rem",
              borderRadius: "8px",
              backgroundColor: "var(--wp-surface-hover, #f8fafc)",
              border: "1px solid var(--wp-border)",
              marginTop: "0.75rem",
            }}
          >
            {syncState === "offline" && (
              <>
                <p className="wp-subtext" style={{ margin: "0 0 0.75rem", fontSize: "0.8rem" }}>
                  Last sync 6:12 AM · pending stops on route R025229
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                    <span>Stop 1 · OUT001</span>
                    <span className="mc-status-chip mc-status-chip-ok">Delivered</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                    <span>Stop 2 · OUT003</span>
                    <span className="mc-status-chip mc-status-chip-muted">Pending</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                    <span>Stop 3 · OUT004</span>
                    <span className="mc-status-chip mc-status-chip-muted">Pending</span>
                  </div>
                </div>
              </>
            )}

            {syncState === "queued" && (
              <p className="wp-subtext" style={{ margin: 0, fontSize: "0.8rem" }}>
                Awaiting reconnect · inbox idle
              </p>
            )}

            {syncState === "syncing" && (
              <>
                <p className="wp-subtext" style={{ margin: "0 0 0.75rem", fontSize: "0.8rem" }}>
                  Progressive update on route R025229
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                    <span>Stop 1 · OUT001</span>
                    <span className="mc-status-chip mc-status-chip-ok">Delivered</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                    <span>Stop 2 · OUT003</span>
                    <span className="mc-status-chip mc-status-chip-info">Syncing</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                    <span>Stop 3 · OUT004</span>
                    <span className="mc-status-chip mc-status-chip-info">Syncing</span>
                  </div>
                </div>
              </>
            )}

            {syncState === "synced" && (
              <>
                <p className="wp-subtext" style={{ margin: "0 0 0.75rem", fontSize: "0.8rem" }}>
                  Stops 2 and 3 completed
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                    <span>Stop 1 · OUT001</span>
                    <span className="mc-status-chip mc-status-chip-ok">Delivered</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                    <span>Stop 2 · OUT003</span>
                    <span className="mc-status-chip mc-status-chip-ok">Delivered</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                    <span>Stop 3 · OUT004</span>
                    <span className="mc-status-chip mc-status-chip-ok">Delivered</span>
                  </div>
                </div>
              </>
            )}

            {syncState === "conflict" && (
              <div>
                <p className="wp-subtext" style={{ margin: "0 0 0.5rem", fontSize: "0.8rem" }}>
                  OUT003: Accept delivery or escalate
                </p>
                <div
                  style={{
                    padding: "0.75rem",
                    border: "1px solid #fed7aa",
                    borderRadius: "6px",
                    backgroundColor: "#fff7ed",
                  }}
                >
                  <strong style={{ fontSize: "0.82rem", color: "#c2410c" }}>
                    Conflict: OUT003
                  </strong>
                  <p
                    className="wp-subtext"
                    style={{ fontSize: "0.75rem", margin: "0.25rem 0 0.5rem" }}
                  >
                    Deferred at 6:00 AM, driver POD at 6:35 AM offline
                  </p>
                  <Link
                    href="/dispatcher/exceptions"
                    className="wp-btn wp-btn-primary"
                    style={{ fontSize: "0.72rem", padding: "0.3rem 0.6rem" }}
                  >
                    Accept delivery
                  </Link>
                </div>
              </div>
            )}
          </div>

          <h2 className="wp-headline-sm" style={{ marginTop: "1.5rem" }}>
            Store · SM 07
          </h2>
          <div
            style={{
              padding: "1rem",
              borderRadius: "8px",
              backgroundColor: "var(--wp-surface-hover, #f8fafc)",
              border: "1px solid var(--wp-border)",
              marginTop: "0.75rem",
            }}
          >
            {syncState === "offline" && (
              <p className="wp-subtext" style={{ fontSize: "0.8rem", margin: 0 }}>
                ETA frozen, driver offline, last update 6:12 AM
              </p>
            )}
            {syncState === "queued" && (
              <p className="wp-subtext" style={{ fontSize: "0.8rem", margin: 0 }}>
                ETA frozen, driver offline, last update 6:12 AM
              </p>
            )}
            {syncState === "syncing" && (
              <p className="wp-subtext" style={{ fontSize: "0.8rem", margin: 0 }}>
                Updating delivery status...
              </p>
            )}
            {syncState === "synced" && (
              <p className="wp-subtext" style={{ fontSize: "0.8rem", margin: 0 }}>
                Delivered 6:38 AM
              </p>
            )}
            {syncState === "conflict" && (
              <p className="wp-subtext" style={{ fontSize: "0.8rem", margin: 0 }}>
                Delivery completed, planning record pending update
              </p>
            )}
          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <Link
              href="/dispatcher/exceptions"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                color: "var(--wp-primary)",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              Open exception triage <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
