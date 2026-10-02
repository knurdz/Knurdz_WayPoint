"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface StagedDeferral {
  id: string;
  orderNumber: string;
  outletCode: string;
  outletName: string;
  cargoType: "chilled" | "ambient";
  weightKg: number;
  status: string;
  deferredLastRun: boolean;
  lastReason?: string;
}

export default function DispatcherDeferralPage() {
  const [stagedOrders, setStagedOrders] = useState<StagedDeferral[]>([]);
  const [reasonCode, setReasonCode] = useState<string>("REEFER_CAPACITY");
  const [impactNote, setImpactNote] = useState<string>(
    "Outlet skipped 2 days, chilled volume exceeds reefer fleet for tomorrow 05:00 dispatch."
  );
  const [overrideDebt, setOverrideDebt] = useState<boolean>(false);
  const [overrideReason, setOverrideReason] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [confirmed, setConfirmed] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadDeferrals() {
      try {
        const res = await fetch("/api/dispatcher/defer");
        if (res.ok) {
          const data = await res.json();
          setStagedOrders(data.staged || []);
        }
      } catch (err) {
        console.error("Failed to fetch staged deferrals", err);
      }
    }
    loadDeferrals();
  }, []);

  const hasConsecutiveDebt = stagedOrders.some((o) => o.deferredLastRun);
  const canSubmit = !hasConsecutiveDebt || (overrideDebt && overrideReason.trim().length > 3);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/dispatcher/defer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderIds: stagedOrders.map((o) => o.id),
          reasonCode,
          impactNote,
          overrideReason: overrideDebt ? overrideReason : null,
        }),
      });

      if (res.ok) {
        setConfirmed(true);
        setStagedOrders((prev) =>
          prev.map((o) => ({ ...o, status: "Deferred" }))
        );
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Failed to confirm deferral audit");
      }
    } catch {
      setErrorMsg("Network error confirming deferral");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div className="screen-page-header">
        <div>
          <span className="wp-label">DISP 05 · Core</span>
          <h1 className="wp-headline-md" style={{ margin: "0.35rem 0 0" }}>
            Confirm deferrals with audit trail
          </h1>
          <p className="wp-subtext">Every deferral requires a standard reason code and optional cost note.</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link href="/store/deferral" className="wp-btn wp-btn-outline" style={{ fontSize: "0.75rem", padding: "0.45rem 0.85rem" }}>
            Preview Store Notice
          </Link>
          <Link href="/dispatcher/allocation" className="wp-btn wp-btn-primary" style={{ fontSize: "0.75rem", padding: "0.45rem 0.85rem" }}>
            Back to Allocation
          </Link>
        </div>
      </div>

      {confirmed && (
        <div
          style={{
            padding: "0.85rem 1.25rem",
            background: "var(--wp-card-bg, #f0fdf4)",
            border: "1px solid var(--wp-success, #22c55e)",
            borderRadius: "var(--wp-radius-sm, 6px)",
            color: "var(--wp-text-main, #0f172a)",
            fontSize: "0.85rem",
          }}
        >
          ✓ Deferrals successfully confirmed and audit stamped. Notices transmitted to destination store portals.
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            padding: "0.85rem 1.25rem",
            background: "var(--wp-card-bg, #fef2f2)",
            border: "1px solid var(--wp-danger, #ef4444)",
            borderRadius: "var(--wp-radius-sm, 6px)",
            color: "var(--wp-danger, #ef4444)",
            fontSize: "0.85rem",
          }}
        >
          {errorMsg}
        </div>
      )}

      <div className="screen-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
        {/* Selected Orders List */}
        <section className="wp-panel screen-panel">
          <h2 className="wp-headline-sm">Selected orders ({stagedOrders.length})</h2>
          <div className="screen-list" style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {stagedOrders.map((order) => (
              <div
                key={order.id}
                className="screen-list-item"
                style={{
                  padding: "0.85rem",
                  border: "1px solid var(--wp-border-color, #e2e8f0)",
                  borderRadius: "var(--wp-radius-sm, 6px)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.35rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>
                    <strong className="font-mono">{order.orderNumber}</strong> · {order.outletCode} · {order.cargoType} · {order.weightKg} kg
                  </span>
                  <span className={`mc-status-chip ${order.status === "Deferred" ? "mc-status-chip-ok" : "mc-status-chip-warn"}`}>
                    {order.status}
                  </span>
                </div>
                {order.deferredLastRun && (
                  <span className="decision-debt-chip mc-status-chip mc-status-chip-warn" style={{ alignSelf: "flex-start", fontSize: "0.7rem" }}>
                    Deferred last run · {order.lastReason}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Audit Form */}
        <section className="wp-panel screen-panel">
          <form className="store-order-form" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="wp-field">
              <label htmlFor="defer-reason" style={{ display: "block", marginBottom: "0.35rem", fontSize: "0.8rem", fontWeight: 600 }}>
                Standard reason code
              </label>
              <select
                className="wp-select"
                id="defer-reason"
                value={reasonCode}
                onChange={(e) => setReasonCode(e.target.value)}
                style={{ width: "100%", padding: "0.5rem" }}
              >
                <option value="REEFER_CAPACITY">REEFER_CAPACITY</option>
                <option value="VAN_ONLY">VAN_ONLY</option>
                <option value="WEIGHT_VOLUME">WEIGHT_VOLUME</option>
                <option value="TIME_BUDGET">TIME_BUDGET</option>
                <option value="FUEL_QUOTA">FUEL_QUOTA</option>
                <option value="MALL_WINDOW">MALL_WINDOW</option>
              </select>
            </div>

            <div className="wp-field">
              <label htmlFor="defer-cost" style={{ display: "block", marginBottom: "0.35rem", fontSize: "0.8rem", fontWeight: 600 }}>
                Cost / impact note
              </label>
              <textarea
                className="wp-textarea"
                id="defer-cost"
                rows={4}
                value={impactNote}
                onChange={(e) => setImpactNote(e.target.value)}
                style={{ width: "100%", padding: "0.5rem" }}
              />
            </div>

            <p className="wp-subtext" style={{ fontSize: "0.8rem", margin: 0 }}>
              Deferred: {reasonCode} · Next run Saturday
            </p>

            {hasConsecutiveDebt && (
              <div
                className="decision-debt-lock"
                style={{
                  padding: "0.85rem",
                  background: "var(--wp-card-bg, #fef2f2)",
                  border: "1px solid var(--wp-warning, #f59e0b)",
                  borderRadius: "var(--wp-radius-sm, 6px)",
                }}
              >
                <p className="wp-subtext" style={{ margin: "0 0 0.65rem", fontSize: "0.78rem", fontWeight: 600, color: "var(--wp-warning, #b45309)" }}>
                  OUT004 was deferred last run. A second consecutive deferral requires supervisor override.
                </p>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={overrideDebt}
                    onChange={(e) => setOverrideDebt(e.target.checked)}
                  />
                  <span>Override consecutive deferral for OUT004</span>
                </label>
                <div className="wp-field" style={{ marginTop: "0.5rem" }}>
                  <label htmlFor="defer-override-reason" style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.75rem" }}>
                    Override reason
                  </label>
                  <input
                    className="wp-input"
                    type="text"
                    id="defer-override-reason"
                    placeholder="e.g. Reefer trip freed after VEH037 replan"
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    disabled={!overrideDebt}
                    style={{ width: "100%", padding: "0.4rem" }}
                  />
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              <button
                type="submit"
                className="wp-btn wp-btn-primary"
                disabled={!canSubmit || submitting || confirmed}
                style={{ flex: 1 }}
              >
                {submitting ? "Transmitting..." : "Defer selected and notify stores"}
              </button>
              <Link href="/dispatcher/queue" className="wp-btn wp-btn-outline">
                Return to queue
              </Link>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
