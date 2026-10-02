"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function LoaderShortfallPage() {
  const [trip, setTrip] = useState("VEH037 Trip 1 · Stop 2 OUT004");
  const [qtyShort, setQtyShort] = useState("3");
  const [productLine, setProductLine] = useState("Chilled Greek Yogurt 500g");
  const [notes, setNotes] = useState("3 chilled cases missing from pick face, flagged at 4:42 AM");
  const [selectedDecision, setSelectedDecision] = useState<string>("Leave now · 3 cases short");
  const [submitting, setSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmittedMessage(null);

    try {
      const res = await fetch("/api/loader/shortfall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId: trip,
          qtyShort: Number(qtyShort),
          productLine,
          notes,
          decision: selectedDecision,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSubmittedMessage(`Shortfall incident ${data.incidentId} transmitted to Dispatcher Incident Desk.`);
      }
    } catch {
      setSubmittedMessage("Failed to transmit shortfall alert");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div className="screen-page-header">
        <div>
          <span className="wp-label">LOAD 04 · Core</span>
          <h1 className="wp-headline-md" style={{ margin: "0.35rem 0 0" }}>
            Report before departure
          </h1>
          <p className="wp-subtext">Stop 2 (OUT004): flag missing stock before truck leaves.</p>
        </div>
        <Link href="/dispatcher/exceptions" className="wp-btn wp-btn-primary" style={{ fontSize: "0.75rem", padding: "0.45rem 0.85rem" }}>
          Dispatcher inbox
        </Link>
      </div>

      {submittedMessage && (
        <div
          style={{
            padding: "0.85rem 1.25rem",
            background: "var(--wp-card-bg, #fef2f2)",
            border: "1px solid var(--wp-warning, #f59e0b)",
            borderRadius: "var(--wp-radius-sm, 6px)",
            fontSize: "0.85rem",
          }}
        >
          ✓ {submittedMessage}
        </div>
      )}

      <div className="screen-grid-2" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "1.25rem" }}>
        <section className="wp-panel screen-panel" style={{ padding: "1.25rem" }}>
          <form className="store-order-form" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="wp-field">
              <label style={{ display: "block", marginBottom: "0.35rem", fontSize: "0.8rem", fontWeight: 600 }}>Trip</label>
              <input className="wp-input font-mono" value={trip} onChange={(e) => setTrip(e.target.value)} readOnly style={{ width: "100%", padding: "0.5rem" }} />
            </div>

            <div className="wp-field">
              <label style={{ display: "block", marginBottom: "0.35rem", fontSize: "0.8rem", fontWeight: 600 }}>Qty short (cases)</label>
              <input className="wp-input font-mono" type="number" value={qtyShort} onChange={(e) => setQtyShort(e.target.value)} required style={{ width: "100%", padding: "0.5rem" }} />
            </div>

            <div className="wp-field">
              <label style={{ display: "block", marginBottom: "0.35rem", fontSize: "0.8rem", fontWeight: 600 }}>Product line</label>
              <input className="wp-input" value={productLine} onChange={(e) => setProductLine(e.target.value)} required style={{ width: "100%", padding: "0.5rem" }} />
            </div>

            <div className="wp-field">
              <label style={{ display: "block", marginBottom: "0.35rem", fontSize: "0.8rem", fontWeight: 600 }}>Notes</label>
              <textarea className="wp-textarea" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} style={{ width: "100%", padding: "0.5rem" }} />
            </div>

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              <button type="submit" className="wp-btn wp-btn-primary" disabled={submitting}>
                {submitting ? "Transmitting..." : "Submit to dispatcher"}
              </button>
              <Link href="/loader" className="wp-btn wp-btn-outline">
                Back to checklist
              </Link>
            </div>

            {/* Decision choice grid */}
            <div className="decision-choice-grid" style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
              <button
                type="button"
                className={`decision-choice ${selectedDecision.includes("Hold") ? "active" : ""}`}
                style={{
                  textAlign: "left",
                  padding: "0.85rem",
                  border: selectedDecision.includes("Hold") ? "2px solid var(--wp-primary)" : "1px solid var(--wp-border-color)",
                  borderRadius: "var(--wp-radius-sm, 6px)",
                  background: selectedDecision.includes("Hold") ? "var(--wp-active-bg, rgba(14, 165, 233, 0.08))" : "transparent",
                  cursor: "pointer",
                }}
                onClick={() => setSelectedDecision("Hold Bay 04 · 12 min")}
              >
                <span className="decision-choice-title" style={{ display: "block", fontWeight: 700 }}>
                  Hold Bay 04 · 12 min
                </span>
                <span className="decision-choice-meta" style={{ display: "block", fontSize: "0.78rem", color: "var(--wp-muted)", marginTop: "0.25rem" }}>
                  Retrieve 3 chilled cases from pick face · keeps OUT004 whole · pushes OUT015 past 09:00 mall window
                </span>
              </button>

              <button
                type="button"
                className={`decision-choice ${selectedDecision.includes("Leave") ? "active" : ""}`}
                style={{
                  textAlign: "left",
                  padding: "0.85rem",
                  border: selectedDecision.includes("Leave") ? "2px solid var(--wp-primary)" : "1px solid var(--wp-border-color)",
                  borderRadius: "var(--wp-radius-sm, 6px)",
                  background: selectedDecision.includes("Leave") ? "var(--wp-active-bg, rgba(14, 165, 233, 0.08))" : "transparent",
                  cursor: "pointer",
                }}
                onClick={() => setSelectedDecision("Leave now · 3 cases short")}
              >
                <span className="decision-choice-title" style={{ display: "block", fontWeight: 700 }}>
                  Leave now · 3 cases short
                </span>
                <span className="decision-choice-meta" style={{ display: "block", fontSize: "0.78rem", color: "var(--wp-muted)", marginTop: "0.25rem" }}>
                  Mall window for OUT015 holds · store receipt shows short delivery · gate pass at 4:50 AM
                </span>
              </button>
            </div>
          </form>
        </section>

        <aside className="wp-panel screen-panel" style={{ padding: "1.25rem" }}>
          <span className="wp-label">Before the truck leaves</span>
          <h2 className="wp-headline-sm" style={{ margin: "0.35rem 0 0.5rem" }}>
            This alert reaches the dispatcher
          </h2>
          <p className="wp-subtext">
            Stop 2 (OUT004): 3 chilled cases missing, flagged at 4:42 AM. Plan can still change before 4:50 AM departure.
          </p>
          <div style={{ marginTop: "1.5rem" }}>
            <Link href="/dispatcher/exceptions" className="wp-btn wp-btn-outline">
              Open exception inbox
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
