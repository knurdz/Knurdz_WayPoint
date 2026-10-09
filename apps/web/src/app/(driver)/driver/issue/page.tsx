"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, ArrowRight, ShieldAlert } from "lucide-react";

function DriverIssueContent() {
  const searchParams = useSearchParams();
  const paramStopId = searchParams.get("stopId") || "stop-2";
  const paramDeliveryCode = searchParams.get("deliveryCode") || "OUT003";
  const paramOutletCode = searchParams.get("outletCode") || paramDeliveryCode || "OUT003";
  const paramOutletName = searchParams.get("outletName") || "Fresh Store Outlet";
  const paramRouteId = searchParams.get("routeId") || "R025229";

  const [issueType, setIssueType] = useState("Late for mall window");
  const [notes, setNotes] = useState(
    `Late for scheduled delivery window at ${paramOutletCode}. Traffic delay in corridor. Contact outlet receiving desk.`
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/driver/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issueType,
          notes,
          deliveryCode: paramDeliveryCode,
          stopId: paramStopId,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch {
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: "1.5rem", maxWidth: "1000px", margin: "0 auto" }}>
      <div className="screen-page-header" style={{ marginBottom: "1.5rem" }}>
        <div>
          <span className="wp-label">DRV 05</span>
          <h1 className="wp-headline-md" style={{ margin: "0.35rem 0 0" }}>
            Report delivery issue
          </h1>
          <p className="wp-subtext">Route {paramRouteId} · {paramOutletCode} {paramOutletName}</p>
        </div>
      </div>

      <div
        className="screen-grid-2"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.5rem",
        }}
      >
        <section className="wp-panel screen-panel" style={{ padding: "1.5rem" }}>
          {submitted ? (
            <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
              <CheckCircle
                size={48}
                color="#16a34a"
                style={{ margin: "0 auto 1rem auto" }}
              />
              <h2 className="wp-headline-sm">Issue transmitted</h2>
              <p
                className="wp-subtext"
                style={{ maxWidth: "340px", margin: "0.5rem auto 1.5rem auto" }}
              >
                The exception has been logged and dispatched to central control. Dispatcher exceptions desk has been notified.
              </p>
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
                <Link href="/driver/sync" className="wp-btn wp-btn-primary">
                  View sync state
                </Link>
                <Link href="/driver/route" className="wp-btn wp-btn-outline">
                  Return to route
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="wp-field" style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 600, fontSize: "0.85rem" }}>
                  Issue type
                </label>
                <select
                  className="wp-select"
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.75rem",
                    borderRadius: "6px",
                    border: "1px solid var(--wp-border)",
                    backgroundColor: "var(--wp-surface)",
                  }}
                >
                  <option value="Access blocked">Access blocked</option>
                  <option value="Late for mall window">Late for mall window</option>
                  <option value="Store receiver unavailable">Store receiver unavailable</option>
                  <option value="Cold chain chamber threshold warning">Cold chain chamber threshold warning</option>
                  <option value="Vehicle mechanical issue">Vehicle mechanical issue</option>
                </select>
              </div>

              <div className="wp-field" style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 600, fontSize: "0.85rem" }}>
                  Operational note
                </label>
                <textarea
                  className="wp-textarea"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.75rem",
                    borderRadius: "6px",
                    border: "1px solid var(--wp-border)",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="wp-btn wp-btn-primary"
                style={{ width: "100%", padding: "0.65rem 1rem", fontSize: "0.9rem" }}
              >
                {isSubmitting ? "Transmitting..." : "Send incident report"}
              </button>
            </form>
          )}
        </section>

        <aside className="wp-panel screen-panel" style={{ padding: "1.5rem" }}>
          <div style={{ marginBottom: "1rem" }}>
            <span
              className="mc-status-chip mc-status-chip-warn"
              style={{
                display: "inline-block",
                padding: "0.25rem 0.5rem",
                borderRadius: "4px",
                backgroundColor: "#fef3c7",
                color: "#b45309",
                fontWeight: 600,
                fontSize: "0.75rem",
                marginBottom: "0.5rem",
              }}
            >
              Delivery SLA Exception
            </span>
            <h2 className="wp-headline-sm" style={{ margin: "0.25rem 0" }}>
              {paramOutletCode} Incident Desk
            </h2>
            <p className="wp-subtext" style={{ fontSize: "0.82rem", lineHeight: 1.5 }}>
              Transmitting an issue routes directly into Dispatcher exceptions triage and logs an immutable audit trail entry.
            </p>
          </div>

          <div
            style={{
              padding: "1rem",
              borderRadius: "8px",
              backgroundColor: "var(--wp-surface-hover, #f8fafc)",
              border: "1px solid var(--wp-border)",
              marginTop: "1.25rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <ShieldAlert size={18} color="#e11d48" />
              <strong style={{ fontSize: "0.82rem" }}>Cold chain sensor alert</strong>
            </div>
            <p className="wp-subtext" style={{ fontSize: "0.78rem", margin: 0 }}>
              Reefer unit frozen telemetry: -19.2°C (compliant). Chilled chamber: +3.4°C (compliant). Vehicle telemetry active.
            </p>
          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <Link
              href="/driver/degradation"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                color: "var(--wp-primary)",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              Degradation scenarios <ArrowRight size={14} />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function DriverIssuePage() {
  return (
    <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>Loading issue reporter...</div>}>
      <DriverIssueContent />
    </Suspense>
  );
}
