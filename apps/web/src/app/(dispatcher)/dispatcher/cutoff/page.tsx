"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useCutoffCountdown } from "@/hooks/useCutoffCountdown";

interface RolledOrder {
  id: string;
  orderNumber: string;
  outletName: string;
  receivedTime: string;
  nextRunDate: string;
  weightKg: number;
  isColdChain: boolean;
}

export default function DispatcherCutoffPage() {
  const countdown = useCutoffCountdown();
  const [orders, setOrders] = useState<RolledOrder[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [lockedAt, setLockedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function loadCutoffData() {
      try {
        const res = await fetch("/api/dispatcher/cutoff", { signal: controller.signal });
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
          setIsLocked(data.isLocked || false);
          setLockedAt(data.lockedAt || null);
        }
      } catch (err: unknown) {
        if ((err as Error)?.name !== "AbortError") {
          console.error("Failed to fetch cutoff info", err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }
    loadCutoffData();
    return () => {
      controller.abort();
    };
  }, []);

  async function handleTriggerRollover() {
    setActionLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/dispatcher/cutoff", {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setIsLocked(true);
        setLockedAt(data.lockedAt);
        setStatusMessage("Cutoff mutex lock activated. Rollover snapshot locked.");
      }
    } catch (err) {
      console.error("Failed to trigger rollover", err);
      setStatusMessage("Failed to acquire rollover mutex lock");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div className="screen-cutoff-hero wp-panel">
        <span className="wp-label">Orders close 16:00 SLST</span>
        <p className="font-mono" style={{ fontSize: "2.5rem", fontWeight: 700, margin: "0.5rem 0" }}>
          {countdown.formatted}
        </p>
        <p className="wp-subtext">Orders after 4:00 PM ship on the following run</p>
      </div>

      <section className="wp-panel screen-panel">
        <div className="screen-page-header">
          <div>
            <span className="wp-label">DISP 03</span>
            <h1 className="wp-headline-md" style={{ margin: "0.35rem 0 0" }}>
              Rolled to next run
            </h1>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span className="mc-pill mc-pill-warn">
              {orders.length} late today
            </span>
            {isLocked ? (
              <span className="mc-pill mc-pill-ok">
                Locked {lockedAt ? new Date(lockedAt).toLocaleTimeString() : ""}
              </span>
            ) : (
              <button
                type="button"
                className="wp-btn wp-btn-secondary"
                onClick={handleTriggerRollover}
                disabled={actionLoading}
                style={{ fontSize: "0.75rem", padding: "0.35rem 0.75rem" }}
              >
                {actionLoading ? "Locking..." : "Acquire Rollover Lock"}
              </button>
            )}
          </div>
        </div>

        {statusMessage && (
          <div
            style={{
              padding: "0.65rem 0.85rem",
              borderRadius: "var(--wp-radius-sm, 6px)",
              background: "var(--wp-card-bg, #f8fafc)",
              border: "1px solid var(--wp-border-color, #e2e8f0)",
              fontSize: "0.8rem",
              margin: "0.75rem 0",
              color: "var(--wp-text-main, #0f172a)",
            }}
          >
            {statusMessage}
          </div>
        )}

        <div className="wp-table-wrap">
          <table className="wp-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Outlet</th>
                <th>Received</th>
                <th>Weight</th>
                <th>Cold Chain</th>
                <th>Next run</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "1.5rem" }}>
                    Loading cutoff queue...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "1.5rem" }}>
                    No late orders rolled today.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id}>
                    <td className="font-mono">{o.orderNumber}</td>
                    <td>{o.outletName}</td>
                    <td>{o.receivedTime}</td>
                    <td className="font-mono">{o.weightKg} kg</td>
                    <td>
                      {o.isColdChain ? (
                        <span className="mc-pill mc-pill-info" style={{ fontSize: "0.7rem" }}>
                          Cold Chain
                        </span>
                      ) : (
                        <span style={{ fontSize: "0.75rem", color: "var(--wp-muted)" }}>
                          Ambient
                        </span>
                      )}
                    </td>
                    <td>{o.nextRunDate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p style={{ marginTop: "1rem" }}>
          <Link href="/store/cutoff" className="mc-link">
            Store cutoff view →
          </Link>
        </p>
      </section>
    </div>
  );
}
